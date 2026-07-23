-- Security Events: live platform security event log
-- Covers vendor assessments, threat lookups, role changes, policy violations

-- ============================================================
-- TYPES
-- ============================================================
DROP TYPE IF EXISTS public.security_event_type CASCADE;
CREATE TYPE public.security_event_type AS ENUM (
  'vendor_assessment',
  'threat_lookup',
  'role_change',
  'policy_violation',
  'access_attempt',
  'config_change'
);

DROP TYPE IF EXISTS public.security_event_severity CASCADE;
CREATE TYPE public.security_event_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');

DROP TYPE IF EXISTS public.security_event_status CASCADE;
CREATE TYPE public.security_event_status AS ENUM ('new', 'acknowledged', 'resolved', 'dismissed');

-- ============================================================
-- TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type public.security_event_type NOT NULL,
  severity public.security_event_severity NOT NULL DEFAULT 'info',
  status public.security_event_status NOT NULL DEFAULT 'new',
  title TEXT NOT NULL,
  description TEXT,
  actor TEXT NOT NULL DEFAULT 'system',
  target TEXT,
  vendor TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_status ON public.security_events(status);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_vendor ON public.security_events(vendor);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_security_events_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_security_events_updated_at ON public.security_events;
CREATE TRIGGER trg_security_events_updated_at
  BEFORE UPDATE ON public.security_events
  FOR EACH ROW EXECUTE FUNCTION public.update_security_events_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "security_events_public_read" ON public.security_events;
CREATE POLICY "security_events_public_read"
  ON public.security_events
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "security_events_authenticated_write" ON public.security_events;
CREATE POLICY "security_events_authenticated_write"
  ON public.security_events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- SEED DATA
-- ============================================================
DO $$
BEGIN
  INSERT INTO public.security_events (id, event_type, severity, status, title, description, actor, target, vendor, ip_address, metadata, created_at) VALUES
    (gen_random_uuid(), 'vendor_assessment', 'high', 'new', 'Vendor Risk Assessment Initiated', 'Automated risk assessment triggered for Acme Corp following CVE-2024-1234 disclosure', 'system', 'Acme Corp', 'Acme Corp', NULL, '{"cve": "CVE-2024-1234", "score": 7.8}'::jsonb, NOW() - INTERVAL '2 minutes'),
    (gen_random_uuid(), 'threat_lookup', 'critical', 'new', 'Malicious IP Detected in Vendor Traffic', 'Threat intelligence lookup matched known C2 server IP 185.220.101.45 in vendor API calls', 'threat-intel-engine', 'API Gateway', 'TechVendor Inc', '185.220.101.45', '{"feed": "MISP", "confidence": 95}'::jsonb, NOW() - INTERVAL '5 minutes'),
    (gen_random_uuid(), 'role_change', 'medium', 'acknowledged', 'Privilege Escalation: Vendor Manager → Admin', 'User jsmith@acme.com role elevated from vendor_manager to platform_admin by super_admin', 'admin@platform.com', 'jsmith@acme.com', NULL, '10.0.1.42', '{"old_role": "vendor_manager", "new_role": "platform_admin"}'::jsonb, NOW() - INTERVAL '12 minutes'),
    (gen_random_uuid(), 'policy_violation', 'high', 'new', 'SOC 2 Control Failure: Encryption at Rest', 'Vendor DataSync LLC found storing PII in unencrypted S3 bucket, violating SOC 2 CC6.1', 'compliance-scanner', 'S3 Bucket: datasync-prod-pii', 'DataSync LLC', NULL, '{"framework": "SOC2", "control": "CC6.1", "bucket": "datasync-prod-pii"}'::jsonb, NOW() - INTERVAL '18 minutes'),
    (gen_random_uuid(), 'threat_lookup', 'high', 'new', 'CVE-2024-3094 Match in Vendor Dependency', 'XZ Utils backdoor CVE-2024-3094 detected in CloudBase vendor software stack v5.6.0', 'sbom-scanner', 'CloudBase Platform v5.6.0', 'CloudBase Solutions', NULL, '{"cve": "CVE-2024-3094", "cvss": 10.0, "package": "xz-utils@5.6.0"}'::jsonb, NOW() - INTERVAL '25 minutes'),
    (gen_random_uuid(), 'access_attempt', 'critical', 'new', 'Brute Force Attack on Vendor Portal', '47 failed login attempts from IP 203.0.113.99 targeting vendor portal in 3 minutes', 'auth-monitor', 'Vendor Portal Login', NULL, '203.0.113.99', '{"attempts": 47, "window_minutes": 3, "blocked": true}'::jsonb, NOW() - INTERVAL '31 minutes'),
    (gen_random_uuid(), 'vendor_assessment', 'medium', 'resolved', 'Quarterly Assessment Completed: SecureNet', 'Quarterly vendor risk assessment for SecureNet Ltd completed. Score improved from 62 to 78', 'assessment-engine', 'SecureNet Ltd', 'SecureNet Ltd', NULL, '{"prev_score": 62, "new_score": 78, "assessor": "alice@platform.com"}'::jsonb, NOW() - INTERVAL '45 minutes'),
    (gen_random_uuid(), 'config_change', 'low', 'acknowledged', 'MFA Policy Updated: Vendor Accounts', 'MFA enforcement policy updated to require TOTP for all vendor-tier accounts effective immediately', 'admin@platform.com', 'Auth Policy: vendor_mfa', NULL, '10.0.1.42', '{"policy": "vendor_mfa", "change": "enforce_totp", "affected_accounts": 23}'::jsonb, NOW() - INTERVAL '1 hour'),
    (gen_random_uuid(), 'policy_violation', 'critical', 'new', 'Data Residency Violation: EU Data in US Region', 'GDPR-scoped EU customer data detected in us-east-1 region for vendor GlobalData Corp', 'data-classifier', 'AWS us-east-1', 'GlobalData Corp', NULL, '{"regulation": "GDPR", "data_type": "PII", "region": "us-east-1", "records": 1240}'::jsonb, NOW() - INTERVAL '1 hour 15 minutes'),
    (gen_random_uuid(), 'role_change', 'low', 'resolved', 'Vendor Analyst Role Assigned', 'New vendor analyst account created for contractor bob@vendor.com with read-only access', 'admin@platform.com', 'bob@vendor.com', 'Acme Corp', '10.0.1.42', '{"role": "vendor_analyst", "access": "read_only"}'::jsonb, NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), 'threat_lookup', 'medium', 'acknowledged', 'Suspicious Domain in Vendor Webhook', 'Vendor webhook callback URL matches newly registered domain flagged by threat intel', 'webhook-monitor', 'Webhook: payment-callback', 'PayFlow Inc', NULL, '{"domain": "payflow-secure-api.xyz", "age_days": 3, "registrar": "NameCheap"}'::jsonb, NOW() - INTERVAL '2 hours 30 minutes'),
    (gen_random_uuid(), 'vendor_assessment', 'info', 'resolved', 'Automated Questionnaire Sent: ISO 27001', 'ISO 27001 compliance questionnaire automatically dispatched to 8 vendors for annual review', 'assessment-engine', '8 Vendors', NULL, NULL, '{"framework": "ISO27001", "vendors": 8, "due_date": "2026-08-15"}'::jsonb, NOW() - INTERVAL '3 hours'),
    (gen_random_uuid(), 'access_attempt', 'high', 'new', 'Anomalous API Access Pattern Detected', 'Vendor API key used from 3 different countries within 20 minutes — possible credential theft', 'anomaly-detector', 'API Key: vnd_k_7f3a9b', 'TechVendor Inc', NULL, '{"countries": ["US", "RU", "CN"], "window_minutes": 20}'::jsonb, NOW() - INTERVAL '4 hours'),
    (gen_random_uuid(), 'config_change', 'medium', 'new', 'IP Allowlist Modified for Vendor Integration', 'Vendor integration IP allowlist expanded to include 10.20.0.0/16 subnet without change ticket', 'devops@platform.com', 'Firewall Rule: vendor-integration', 'DataSync LLC', '10.0.1.55', '{"added_range": "10.20.0.0/16", "change_ticket": null}'::jsonb, NOW() - INTERVAL '5 hours'),
    (gen_random_uuid(), 'policy_violation', 'medium', 'dismissed', 'SLA Breach: Incident Response Time', 'Vendor SecureNet Ltd exceeded 4-hour critical incident response SLA by 2.3 hours', 'sla-monitor', 'Incident INC-2024-089', 'SecureNet Ltd', NULL, '{"sla_hours": 4, "actual_hours": 6.3, "incident": "INC-2024-089"}'::jsonb, NOW() - INTERVAL '6 hours')
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data insertion failed: %', SQLERRM;
END $$;
