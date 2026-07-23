-- SC-TPCRS: Extend signup to capture role, department, job_title
-- and allow new users to self-assign to a team during registration.

-- ============================================================
-- 1. Update handle_new_user trigger to capture extra profile fields
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role, department, job_title)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'viewer'),
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    COALESCE(NEW.raw_user_meta_data->>'job_title', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    role       = COALESCE(EXCLUDED.role, public.user_profiles.role),
    department = COALESCE(EXCLUDED.department, public.user_profiles.department),
    job_title  = COALESCE(EXCLUDED.job_title, public.user_profiles.job_title),
    updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Re-attach trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. Allow new users to insert their own team_members row
--    (so they can self-assign to a team during signup)
-- ============================================================
DROP POLICY IF EXISTS "users_self_join_team" ON public.team_members;
CREATE POLICY "users_self_join_team"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 3. Allow new users to read all teams (needed for team picker)
--    (already covered by "all_read_teams" policy — no-op guard)
-- ============================================================
-- teams SELECT policy already exists; nothing to add here.
