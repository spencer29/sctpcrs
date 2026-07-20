-- SC-TPCRS: Seed Primary Admin + Fix Demo Admin Credentials
-- Primary Admin: admin@sctpcrs.ng / SC-Admin#2026
-- Demo Admins:   admin1@sc-tpcrs.demo / Demo1234!
--                admin2@sc-tpcrs.demo / Demo1234!
--
-- This migration:
--   1. Inserts the primary admin into auth.users (idempotent via ON CONFLICT)
--   2. Creates the user_profiles row for the primary admin
--   3. Updates encrypted_password for demo admins to ensure correct hash
--   4. Ensures auth.identities rows exist for all three admin accounts

-- ============================================================
-- STEP 1: Insert primary admin into auth.users
-- ============================================================
DO $$
DECLARE
  v_admin_uuid UUID := gen_random_uuid();
  v_existing_id UUID;
BEGIN
  -- Check if primary admin already exists
  SELECT id INTO v_existing_id
  FROM auth.users
  WHERE email = 'admin@sctpcrs.ng'
  LIMIT 1;

  IF v_existing_id IS NULL THEN
    -- Insert primary admin
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
      is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
      recovery_token, recovery_sent_at, email_change_token_new, email_change,
      email_change_sent_at, email_change_token_current, email_change_confirm_status,
      reauthentication_token, reauthentication_sent_at, phone, phone_change,
      phone_change_token, phone_change_sent_at
    ) VALUES (
      v_admin_uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@sctpcrs.ng',
      crypt('SC-Admin#2026', gen_salt('bf', 10)),
      now(),
      now(),
      now(),
      jsonb_build_object(
        'full_name', 'SC-TPCRS Administrator',
        'role', 'admin',
        'job_title', 'Platform Administrator',
        'department', 'IT Security'
      ),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
      false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    );

    RAISE NOTICE 'Primary admin created: admin@sctpcrs.ng (id: %)', v_admin_uuid;
  ELSE
    -- Admin exists — update password to ensure it matches SC-Admin#2026
    UPDATE auth.users
    SET
      encrypted_password = crypt('SC-Admin#2026', gen_salt('bf', 10)),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now(),
      raw_user_meta_data = COALESCE(
        raw_user_meta_data,
        jsonb_build_object(
          'full_name', 'SC-TPCRS Administrator',
          'role', 'admin',
          'job_title', 'Platform Administrator',
          'department', 'IT Security'
        )
      )
    WHERE email = 'admin@sctpcrs.ng';

    v_admin_uuid := v_existing_id;
    RAISE NOTICE 'Primary admin password refreshed: admin@sctpcrs.ng (id: %)', v_admin_uuid;
  END IF;

  -- Ensure user_profiles row exists for primary admin
  INSERT INTO public.user_profiles (id, email, full_name, role)
  SELECT
    v_admin_uuid,
    'admin@sctpcrs.ng',
    'SC-TPCRS Administrator',
    'admin'::public.app_role
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = v_admin_uuid
  );

  RAISE NOTICE 'Primary admin setup complete.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Primary admin setup failed: %', SQLERRM;
END $$;

-- ============================================================
-- STEP 2: Refresh demo admin passwords (admin1 & admin2)
-- ============================================================
DO $$
BEGIN
  UPDATE auth.users
  SET
    encrypted_password = crypt('Demo1234!', gen_salt('bf', 10)),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
  WHERE email IN ('admin1@sc-tpcrs.demo', 'admin2@sc-tpcrs.demo');

  RAISE NOTICE 'Demo admin passwords refreshed.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo admin password refresh failed: %', SQLERRM;
END $$;

-- ============================================================
-- STEP 3: Ensure auth.identities rows exist for all three admins
-- ============================================================
DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN
    SELECT id, email, created_at
    FROM auth.users
    WHERE email IN ('admin@sctpcrs.ng', 'admin1@sc-tpcrs.demo', 'admin2@sc-tpcrs.demo')
      AND is_sso_user = false
      AND is_anonymous = false
      AND id NOT IN (
        SELECT user_id FROM auth.identities WHERE provider = 'email'
      )
  LOOP
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      u.id,
      u.email,
      'email',
      jsonb_build_object(
        'sub',            u.id::TEXT,
        'email',          u.email,
        'email_verified', true,
        'provider',       'email'
      ),
      u.created_at,
      u.created_at,
      now()
    )
    ON CONFLICT (provider, provider_id) DO NOTHING;

    RAISE NOTICE 'Identity ensured for: %', u.email;
  END LOOP;

  RAISE NOTICE 'auth.identities check complete for admin accounts.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'auth.identities fix failed: %', SQLERRM;
END $$;
