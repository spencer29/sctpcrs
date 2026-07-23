-- Notifications table for real-time dropdown
-- Notification types: incident_update, alert_status, escalation, team_action

DROP TYPE IF EXISTS public.notification_type CASCADE;
CREATE TYPE public.notification_type AS ENUM (
  'incident_update',
  'alert_status',
  'escalation',
  'team_action'
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  notification_type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  entity_id UUID,
  entity_table TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_notifications_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_updated_at ON public.notifications;
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_notifications_updated_at();

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_notifications" ON public.notifications;
CREATE POLICY "users_manage_own_notifications"
  ON public.notifications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow all authenticated users to read all notifications (broadcast style for this app)
DROP POLICY IF EXISTS "authenticated_read_notifications" ON public.notifications;
CREATE POLICY "authenticated_read_notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert notifications for any user
DROP POLICY IF EXISTS "service_insert_notifications" ON public.notifications;
CREATE POLICY "service_insert_notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed sample notifications
DO $$
DECLARE
  existing_user_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;

    IF existing_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (id, user_id, notification_type, title, body, is_read, created_at)
      VALUES
        (gen_random_uuid(), existing_user_id, 'incident_update', 'Incident #INC-0042 Updated', 'Status changed from Investigating to Contained by Alex Rivera', false, now() - interval '3 minutes'),
        (gen_random_uuid(), existing_user_id, 'alert_status', 'Critical Alert Acknowledged', 'KEV match on CVE-2024-3400 for Vendor Acme Corp acknowledged by SOC team', false, now() - interval '11 minutes'),
        (gen_random_uuid(), existing_user_id, 'escalation', 'Incident Escalated to P1', 'Supply chain breach at TechVendor Inc. escalated to Priority 1 by Jordan Kim', false, now() - interval '28 minutes'),
        (gen_random_uuid(), existing_user_id, 'team_action', 'Remediation Task Assigned', 'You have been assigned: Patch OpenSSL on vendor gateway nodes', false, now() - interval '45 minutes'),
        (gen_random_uuid(), existing_user_id, 'alert_status', 'Alert Dismissed', 'VRS spike alert for DataCorp dismissed — false positive confirmed', true, now() - interval '2 hours'),
        (gen_random_uuid(), existing_user_id, 'incident_update', 'Incident #INC-0039 Resolved', 'Compliance gap at FinanceVendor LLC marked as resolved after remediation', true, now() - interval '5 hours')
      ON CONFLICT (id) DO NOTHING;
    ELSE
      RAISE NOTICE 'No users found in user_profiles — skipping notification seed data';
    END IF;
  ELSE
    RAISE NOTICE 'Table user_profiles does not exist — skipping notification seed data';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Notification seed failed: %', SQLERRM;
END $$;
