-- Team Invitations Migration
-- Allows admins to invite new team members with pre-assigned roles

-- 1. Create team_invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role public.app_role NOT NULL DEFAULT 'viewer'::public.app_role,
    invited_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invited_by ON public.team_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON public.team_invitations(status);

-- 3. Function: check if current user is admin (using auth metadata to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
)
$$;

-- 4. Function: auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_team_invitations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "admins_manage_invitations" ON public.team_invitations;
CREATE POLICY "admins_manage_invitations"
ON public.team_invitations
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "invitees_view_own_invitation" ON public.team_invitations;
CREATE POLICY "invitees_view_own_invitation"
ON public.team_invitations
FOR SELECT
TO anon
USING (status = 'pending' AND expires_at > NOW());

DROP POLICY IF EXISTS "authenticated_view_own_invitation" ON public.team_invitations;
CREATE POLICY "authenticated_view_own_invitation"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
    public.is_admin_user()
    OR email = (SELECT email FROM public.user_profiles WHERE id = auth.uid() LIMIT 1)
);

-- 7. Trigger for updated_at
DROP TRIGGER IF EXISTS team_invitations_updated_at ON public.team_invitations;
CREATE TRIGGER team_invitations_updated_at
    BEFORE UPDATE ON public.team_invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_team_invitations_updated_at();
