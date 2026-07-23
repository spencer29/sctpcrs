-- Fix: Insert missing auth.identities rows for all existing auth.users
-- Root cause: Users were seeded directly into auth.users via SQL without
-- corresponding auth.identities rows, causing signInWithPassword to fail.
-- Supabase requires an identity record for email/password authentication.

DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN
    SELECT id, email, created_at
    FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM auth.identities WHERE provider = 'email')
      AND is_sso_user = false
      AND is_anonymous = false
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

    RAISE NOTICE 'Created identity for user: %', u.email;
  END LOOP;

  RAISE NOTICE 'auth.identities fix complete.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'auth.identities fix failed: %', SQLERRM;
END $$;
