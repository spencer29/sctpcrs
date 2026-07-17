-- SC-TPCRS Role-Based Access Control (RBAC)
-- Roles: Admin, Risk Officer, Analyst, Viewer
-- Fine-grained permissions per resource: vendors, incidents, alerts, dashboards
-- Team membership for scoped access

-- ============================================================
-- TYPES
-- ============================================================
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('admin', 'risk_officer', 'analyst', 'viewer');

DROP TYPE IF EXISTS public.permission_action CASCADE;
CREATE TYPE public.permission_action AS ENUM ('view', 'create', 'edit', 'delete', 'export', 'escalate', 'approve');

DROP TYPE IF EXISTS public.resource_type CASCADE;
CREATE TYPE public.resource_type AS ENUM ('vendors', 'incidents', 'alerts', 'dashboards', 'compliance', 'assessments', 'reports', 'supply_chain', 'monitoring', 'admin');

DROP TYPE IF EXISTS public.team_type CASCADE;
CREATE TYPE public.team_type AS ENUM ('security', 'compliance', 'operations', 'executive', 'vendor_management');

-- ============================================================
-- TABLES
-- ============================================================

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role public.app_role NOT NULL DEFAULT 'viewer',
  department TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Role permission definitions (what each role can do per resource)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  resource public.resource_type NOT NULL,
  action public.permission_action NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (role, resource, action)
);

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  team_type public.team_type NOT NULL DEFAULT 'security',
  description TEXT DEFAULT '',
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Team memberships (user → team with optional role override)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role_override public.app_role,  -- NULL means use user's global role
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (team_id, user_id)
);

-- Audit log for permission-sensitive actions
CREATE TABLE IF NOT EXISTS public.rbac_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  performed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource ON public.role_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_log_user_id ON public.rbac_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_log_performed_at ON public.rbac_audit_log(performed_at DESC);

-- ============================================================
-- HELPER FUNCTIONS (must be before RLS policies)
-- ============================================================

-- Get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_profiles WHERE id = user_uuid LIMIT 1;
$$;

-- Check if current user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = required_role AND is_active = true
  );
$$;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

-- Check if current user has permission for a resource+action
CREATE OR REPLACE FUNCTION public.has_permission(
  p_resource public.resource_type,
  p_action public.permission_action
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE rp.role = up.role
      AND rp.resource = p_resource
      AND rp.action = p_action
      AND up.is_active = true
  );
$$;

-- Check if current user is member of a team
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
$$;

-- Get effective role for a user in a team (team override or global role)
CREATE OR REPLACE FUNCTION public.get_effective_team_role(p_team_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role_override FROM public.team_members WHERE team_id = p_team_id AND user_id = p_user_id AND role_override IS NOT NULL LIMIT 1),
    (SELECT role FROM public.user_profiles WHERE id = p_user_id LIMIT 1)
  );
$$;

-- ============================================================
-- TRIGGER: auto-create user_profiles on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'viewer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- user_profiles: users manage own, admins manage all
DROP POLICY IF EXISTS "users_view_own_profile" ON public.user_profiles;
CREATE POLICY "users_view_own_profile"
ON public.user_profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
ON public.user_profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "admin_insert_profiles" ON public.user_profiles;
CREATE POLICY "admin_insert_profiles"
ON public.user_profiles FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_profiles" ON public.user_profiles;
CREATE POLICY "admin_delete_profiles"
ON public.user_profiles FOR DELETE TO authenticated
USING (public.is_admin());

-- role_permissions: all authenticated can read, only admins write
DROP POLICY IF EXISTS "all_read_role_permissions" ON public.role_permissions;
CREATE POLICY "all_read_role_permissions"
ON public.role_permissions FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "admin_manage_role_permissions" ON public.role_permissions;
CREATE POLICY "admin_manage_role_permissions"
ON public.role_permissions FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- teams: all authenticated can read, admins manage
DROP POLICY IF EXISTS "all_read_teams" ON public.teams;
CREATE POLICY "all_read_teams"
ON public.teams FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "admin_manage_teams" ON public.teams;
CREATE POLICY "admin_manage_teams"
ON public.teams FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- team_members: members can read their own, admins manage all
DROP POLICY IF EXISTS "users_view_own_team_memberships" ON public.team_members;
CREATE POLICY "users_view_own_team_memberships"
ON public.team_members FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "admin_manage_team_members" ON public.team_members;
CREATE POLICY "admin_manage_team_members"
ON public.team_members FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- rbac_audit_log: users see own logs, admins see all
DROP POLICY IF EXISTS "users_view_own_audit_log" ON public.rbac_audit_log;
CREATE POLICY "users_view_own_audit_log"
ON public.rbac_audit_log FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "system_insert_audit_log" ON public.rbac_audit_log;
CREATE POLICY "system_insert_audit_log"
ON public.rbac_audit_log FOR INSERT TO authenticated
WITH CHECK (true);

-- ============================================================
-- SEED: Default role permissions per SC-TPCRS blueprint
-- ============================================================
DO $$
BEGIN
  -- ADMIN: full access to everything
  INSERT INTO public.role_permissions (role, resource, action) VALUES
    ('admin', 'vendors',      'view'),
    ('admin', 'vendors',      'create'),
    ('admin', 'vendors',      'edit'),
    ('admin', 'vendors',      'delete'),
    ('admin', 'vendors',      'export'),
    ('admin', 'incidents',    'view'),
    ('admin', 'incidents',    'create'),
    ('admin', 'incidents',    'edit'),
    ('admin', 'incidents',    'delete'),
    ('admin', 'incidents',    'escalate'),
    ('admin', 'incidents',    'approve'),
    ('admin', 'alerts',       'view'),
    ('admin', 'alerts',       'create'),
    ('admin', 'alerts',       'edit'),
    ('admin', 'alerts',       'delete'),
    ('admin', 'alerts',       'escalate'),
    ('admin', 'dashboards',   'view'),
    ('admin', 'dashboards',   'create'),
    ('admin', 'dashboards',   'edit'),
    ('admin', 'dashboards',   'delete'),
    ('admin', 'compliance',   'view'),
    ('admin', 'compliance',   'create'),
    ('admin', 'compliance',   'edit'),
    ('admin', 'compliance',   'delete'),
    ('admin', 'compliance',   'approve'),
    ('admin', 'assessments',  'view'),
    ('admin', 'assessments',  'create'),
    ('admin', 'assessments',  'edit'),
    ('admin', 'assessments',  'delete'),
    ('admin', 'assessments',  'approve'),
    ('admin', 'reports',      'view'),
    ('admin', 'reports',      'create'),
    ('admin', 'reports',      'export'),
    ('admin', 'supply_chain', 'view'),
    ('admin', 'supply_chain', 'edit'),
    ('admin', 'monitoring',   'view'),
    ('admin', 'monitoring',   'edit'),
    ('admin', 'admin',        'view'),
    ('admin', 'admin',        'create'),
    ('admin', 'admin',        'edit'),
    ('admin', 'admin',        'delete'),
    -- RISK OFFICER: broad access, no delete, can escalate/approve
    ('risk_officer', 'vendors',      'view'),
    ('risk_officer', 'vendors',      'create'),
    ('risk_officer', 'vendors',      'edit'),
    ('risk_officer', 'vendors',      'export'),
    ('risk_officer', 'incidents',    'view'),
    ('risk_officer', 'incidents',    'create'),
    ('risk_officer', 'incidents',    'edit'),
    ('risk_officer', 'incidents',    'escalate'),
    ('risk_officer', 'incidents',    'approve'),
    ('risk_officer', 'alerts',       'view'),
    ('risk_officer', 'alerts',       'create'),
    ('risk_officer', 'alerts',       'edit'),
    ('risk_officer', 'alerts',       'escalate'),
    ('risk_officer', 'dashboards',   'view'),
    ('risk_officer', 'dashboards',   'create'),
    ('risk_officer', 'dashboards',   'edit'),
    ('risk_officer', 'compliance',   'view'),
    ('risk_officer', 'compliance',   'create'),
    ('risk_officer', 'compliance',   'edit'),
    ('risk_officer', 'compliance',   'approve'),
    ('risk_officer', 'assessments',  'view'),
    ('risk_officer', 'assessments',  'create'),
    ('risk_officer', 'assessments',  'edit'),
    ('risk_officer', 'assessments',  'approve'),
    ('risk_officer', 'reports',      'view'),
    ('risk_officer', 'reports',      'create'),
    ('risk_officer', 'reports',      'export'),
    ('risk_officer', 'supply_chain', 'view'),
    ('risk_officer', 'monitoring',   'view'),
    -- ANALYST: read + create/edit on core resources, no delete/approve
    ('analyst', 'vendors',      'view'),
    ('analyst', 'vendors',      'create'),
    ('analyst', 'vendors',      'edit'),
    ('analyst', 'vendors',      'export'),
    ('analyst', 'incidents',    'view'),
    ('analyst', 'incidents',    'create'),
    ('analyst', 'incidents',    'edit'),
    ('analyst', 'incidents',    'escalate'),
    ('analyst', 'alerts',       'view'),
    ('analyst', 'alerts',       'create'),
    ('analyst', 'alerts',       'edit'),
    ('analyst', 'dashboards',   'view'),
    ('analyst', 'compliance',   'view'),
    ('analyst', 'compliance',   'create'),
    ('analyst', 'compliance',   'edit'),
    ('analyst', 'assessments',  'view'),
    ('analyst', 'assessments',  'create'),
    ('analyst', 'assessments',  'edit'),
    ('analyst', 'reports',      'view'),
    ('analyst', 'reports',      'create'),
    ('analyst', 'reports',      'export'),
    ('analyst', 'supply_chain', 'view'),
    ('analyst', 'monitoring',   'view'),
    -- VIEWER: read-only access to non-admin resources
    ('viewer', 'vendors',      'view'),
    ('viewer', 'incidents',    'view'),
    ('viewer', 'alerts',       'view'),
    ('viewer', 'dashboards',   'view'),
    ('viewer', 'compliance',   'view'),
    ('viewer', 'assessments',  'view'),
    ('viewer', 'reports',      'view'),
    ('viewer', 'supply_chain', 'view'),
    ('viewer', 'monitoring',   'view')
  ON CONFLICT (role, resource, action) DO NOTHING;

  -- Seed default teams
  INSERT INTO public.teams (id, name, team_type, description) VALUES
    (gen_random_uuid(), 'Security Operations', 'security',          'Core security monitoring and incident response team'),
    (gen_random_uuid(), 'Compliance & Audit',  'compliance',        'Regulatory compliance and audit management team'),
    (gen_random_uuid(), 'Vendor Management',   'vendor_management', 'Third-party vendor onboarding and risk assessment team'),
    (gen_random_uuid(), 'Executive Risk',      'executive',         'Executive-level risk oversight and reporting team'),
    (gen_random_uuid(), 'Operations',          'operations',        'Day-to-day platform operations and monitoring team')
  ON CONFLICT (name) DO NOTHING;

  RAISE NOTICE 'RBAC seed data inserted successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'RBAC seed failed: %', SQLERRM;
END $$;

-- Seed demo users for all four roles
DO $$
DECLARE
  admin_uuid      UUID := gen_random_uuid();
  officer_uuid    UUID := gen_random_uuid();
  analyst_uuid    UUID := gen_random_uuid();
  viewer_uuid     UUID := gen_random_uuid();
  sec_team_id     UUID;
BEGIN
  -- Create auth users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@sctpcrs.io', crypt('Admin@1234', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Adaeze Okonkwo', 'role', 'admin', 'job_title', 'Platform Administrator', 'department', 'IT Security'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (officer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'riskofficer@sctpcrs.io', crypt('Risk@1234', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Emeka Nwosu', 'role', 'risk_officer', 'job_title', 'Chief Risk Officer', 'department', 'Risk Management'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (analyst_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'analyst@sctpcrs.io', crypt('Analyst@1234', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Fatima Bello', 'role', 'analyst', 'job_title', 'Security Analyst', 'department', 'Security Operations'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (viewer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'viewer@sctpcrs.io', crypt('Viewer@1234', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Chidi Obi', 'role', 'viewer', 'job_title', 'Risk Auditor', 'department', 'Compliance'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (id) DO NOTHING;

  -- Add demo users to Security Operations team
  SELECT id INTO sec_team_id FROM public.teams WHERE name = 'Security Operations' LIMIT 1;
  IF sec_team_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id) VALUES
      (sec_team_id, admin_uuid),
      (sec_team_id, officer_uuid),
      (sec_team_id, analyst_uuid),
      (sec_team_id, viewer_uuid)
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Demo users created: admin@sctpcrs.io, riskofficer@sctpcrs.io, analyst@sctpcrs.io, viewer@sctpcrs.io';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo user creation failed: %', SQLERRM;
END $$;
