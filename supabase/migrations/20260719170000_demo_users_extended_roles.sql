-- SC-TPCRS Demo Users: Extended Roles + 8 Demo Accounts
-- Adds compliance_manager and ciso to app_role enum
-- Seeds 8 demo users (2 per role: risk_officer, compliance_manager, ciso, admin)
-- Password for all: Demo1234!

-- ============================================================
-- STEP 1: Extend app_role enum with new values
-- ============================================================
-- PostgreSQL does not support DROP/CREATE for enums that are in use.
-- We use ALTER TYPE ... ADD VALUE IF NOT EXISTS instead.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'compliance_manager'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'compliance_manager';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'ciso'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'ciso';
  END IF;
END $$;

-- ============================================================
-- STEP 2: Update handle_new_user trigger to support new roles
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role public.app_role;
  v_raw_role TEXT;
BEGIN
  v_raw_role := NEW.raw_user_meta_data->>'role';
  BEGIN
    v_role := v_raw_role::public.app_role;
  EXCEPTION WHEN invalid_text_representation THEN
    v_role := 'viewer'::public.app_role;
  END;

  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(v_role, 'viewer'::public.app_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ============================================================
-- STEP 3: Seed role_permissions for compliance_manager and ciso
-- ============================================================
DO $$
BEGIN
  -- COMPLIANCE MANAGER: full compliance access, broad read, can approve
  INSERT INTO public.role_permissions (role, resource, action) VALUES
    ('compliance_manager', 'vendors',      'view'),
    ('compliance_manager', 'vendors',      'create'),
    ('compliance_manager', 'vendors',      'edit'),
    ('compliance_manager', 'vendors',      'export'),
    ('compliance_manager', 'incidents',    'view'),
    ('compliance_manager', 'incidents',    'create'),
    ('compliance_manager', 'incidents',    'edit'),
    ('compliance_manager', 'incidents',    'escalate'),
    ('compliance_manager', 'alerts',       'view'),
    ('compliance_manager', 'alerts',       'create'),
    ('compliance_manager', 'alerts',       'edit'),
    ('compliance_manager', 'dashboards',   'view'),
    ('compliance_manager', 'dashboards',   'create'),
    ('compliance_manager', 'dashboards',   'edit'),
    ('compliance_manager', 'compliance',   'view'),
    ('compliance_manager', 'compliance',   'create'),
    ('compliance_manager', 'compliance',   'edit'),
    ('compliance_manager', 'compliance',   'delete'),
    ('compliance_manager', 'compliance',   'approve'),
    ('compliance_manager', 'assessments',  'view'),
    ('compliance_manager', 'assessments',  'create'),
    ('compliance_manager', 'assessments',  'edit'),
    ('compliance_manager', 'assessments',  'approve'),
    ('compliance_manager', 'reports',      'view'),
    ('compliance_manager', 'reports',      'create'),
    ('compliance_manager', 'reports',      'export'),
    ('compliance_manager', 'supply_chain', 'view'),
    ('compliance_manager', 'monitoring',   'view'),
    -- CISO: near-admin access, strategic oversight, can approve/escalate all
    ('ciso', 'vendors',      'view'),
    ('ciso', 'vendors',      'create'),
    ('ciso', 'vendors',      'edit'),
    ('ciso', 'vendors',      'delete'),
    ('ciso', 'vendors',      'export'),
    ('ciso', 'incidents',    'view'),
    ('ciso', 'incidents',    'create'),
    ('ciso', 'incidents',    'edit'),
    ('ciso', 'incidents',    'delete'),
    ('ciso', 'incidents',    'escalate'),
    ('ciso', 'incidents',    'approve'),
    ('ciso', 'alerts',       'view'),
    ('ciso', 'alerts',       'create'),
    ('ciso', 'alerts',       'edit'),
    ('ciso', 'alerts',       'delete'),
    ('ciso', 'alerts',       'escalate'),
    ('ciso', 'dashboards',   'view'),
    ('ciso', 'dashboards',   'create'),
    ('ciso', 'dashboards',   'edit'),
    ('ciso', 'dashboards',   'delete'),
    ('ciso', 'compliance',   'view'),
    ('ciso', 'compliance',   'create'),
    ('ciso', 'compliance',   'edit'),
    ('ciso', 'compliance',   'delete'),
    ('ciso', 'compliance',   'approve'),
    ('ciso', 'assessments',  'view'),
    ('ciso', 'assessments',  'create'),
    ('ciso', 'assessments',  'edit'),
    ('ciso', 'assessments',  'delete'),
    ('ciso', 'assessments',  'approve'),
    ('ciso', 'reports',      'view'),
    ('ciso', 'reports',      'create'),
    ('ciso', 'reports',      'export'),
    ('ciso', 'supply_chain', 'view'),
    ('ciso', 'supply_chain', 'edit'),
    ('ciso', 'monitoring',   'view'),
    ('ciso', 'monitoring',   'edit')
  ON CONFLICT (role, resource, action) DO NOTHING;

  RAISE NOTICE 'Role permissions seeded for compliance_manager and ciso';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Role permissions seed failed: %', SQLERRM;
END $$;

-- ============================================================
-- STEP 4: Create 8 demo users (2 per role)
-- All share password: Demo1234!
-- ============================================================
DO $$
DECLARE
  ro1_uuid  UUID := gen_random_uuid();
  ro2_uuid  UUID := gen_random_uuid();
  cm1_uuid  UUID := gen_random_uuid();
  cm2_uuid  UUID := gen_random_uuid();
  ci1_uuid  UUID := gen_random_uuid();
  ci2_uuid  UUID := gen_random_uuid();
  ad1_uuid  UUID := gen_random_uuid();
  ad2_uuid  UUID := gen_random_uuid();
  sec_team_id UUID;
BEGIN
  -- Insert all 8 demo users into auth.users
  -- The handle_new_user trigger will auto-create user_profiles rows
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    -- Risk Officers
    (ro1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'risk.officer1@sc-tpcrs.demo', crypt('Demo1234!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Amara Osei', 'role', 'risk_officer', 'job_title', 'Senior Risk Officer', 'department', 'Risk Management'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (ro2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'risk.officer2@sc-tpcrs.demo', crypt('Demo1234!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Kwame Asante', 'role', 'risk_officer', 'job_title', 'Risk Officer', 'department', 'Risk Management'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    -- Compliance Managers
    (cm1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'compliance1@sc-tpcrs.demo', crypt('Demo1234!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Ngozi Adeyemi', 'role', 'compliance_manager', 'job_title', 'Head of Compliance', 'department', 'Compliance'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (cm2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'compliance2@sc-tpcrs.demo', crypt('Demo1234!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Tunde Fashola', 'role', 'compliance_manager', 'job_title', 'Compliance Manager', 'department', 'Compliance'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    -- CISOs
    (ci1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'ciso1@sc-tpcrs.demo', crypt('Demo1234!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Chioma Eze', 'role', 'ciso', 'job_title', 'Chief Information Security Officer', 'department', 'Executive'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (ci2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'ciso2@sc-tpcrs.demo', crypt('Demo1234!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Babatunde Okafor', 'role', 'ciso', 'job_title', 'Deputy CISO', 'department', 'Executive'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    -- Admins
    (ad1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin1@sc-tpcrs.demo', crypt('Demo1234!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Ifeoma Chukwu', 'role', 'admin', 'job_title', 'Platform Administrator', 'department', 'IT Security'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (ad2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin2@sc-tpcrs.demo', crypt('Demo1234!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Emeka Obiora', 'role', 'admin', 'job_title', 'System Administrator', 'department', 'IT Security'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (email) DO NOTHING;

  -- Add demo users to Security Operations team
  SELECT id INTO sec_team_id FROM public.teams WHERE name = 'Security Operations' LIMIT 1;
  IF sec_team_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id) VALUES
      (sec_team_id, ro1_uuid),
      (sec_team_id, ro2_uuid),
      (sec_team_id, cm1_uuid),
      (sec_team_id, cm2_uuid),
      (sec_team_id, ci1_uuid),
      (sec_team_id, ci2_uuid),
      (sec_team_id, ad1_uuid),
      (sec_team_id, ad2_uuid)
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Demo users created successfully. Password for all: Demo1234!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo user creation failed: %', SQLERRM;
END $$;
