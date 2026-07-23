-- Real-time dashboard tables: incidents, alerts, compliance_frameworks
-- Preview mode (public access) since no auth is required for this module

-- ============================================================
-- TYPES
-- ============================================================
DROP TYPE IF EXISTS public.incident_severity CASCADE;
CREATE TYPE public.incident_severity AS ENUM ('critical', 'high', 'medium', 'low');

DROP TYPE IF EXISTS public.incident_status CASCADE;
CREATE TYPE public.incident_status AS ENUM ('open', 'investigating', 'contained', 'resolved');

DROP TYPE IF EXISTS public.timeline_event_type CASCADE;
CREATE TYPE public.timeline_event_type AS ENUM ('detected', 'triaged', 'escalated', 'assigned', 'update', 'resolved', 'comment');

DROP TYPE IF EXISTS public.alert_severity CASCADE;
CREATE TYPE public.alert_severity AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

DROP TYPE IF EXISTS public.alert_type CASCADE;
CREATE TYPE public.alert_type AS ENUM ('KEV_MATCH', 'COMPLIANCE', 'CVE_MATCH', 'CERT_EXPIRY', 'VRS_SPIKE', 'QUESTIONNAIRE_OVERDUE');

DROP TYPE IF EXISTS public.alert_status CASCADE;
CREATE TYPE public.alert_status AS ENUM ('active', 'acknowledged', 'dismissed', 'escalated');

DROP TYPE IF EXISTS public.compliance_trend CASCADE;
CREATE TYPE public.compliance_trend AS ENUM ('up', 'down', 'stable');

-- ============================================================
-- TABLES
-- ============================================================

-- Incidents
CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  severity public.incident_severity NOT NULL DEFAULT 'medium',
  status public.incident_status NOT NULL DEFAULT 'open',
  vendor TEXT NOT NULL,
  detected_at TEXT NOT NULL,
  assignee TEXT NOT NULL DEFAULT 'Unassigned',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Incident timeline events
CREATE TABLE IF NOT EXISTS public.incident_timeline_events (
  id TEXT NOT NULL,
  incident_id TEXT NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  event_timestamp TEXT NOT NULL,
  event_type public.timeline_event_type NOT NULL,
  actor TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, incident_id)
);

-- Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY,
  severity public.alert_severity NOT NULL DEFAULT 'MEDIUM',
  alert_type public.alert_type NOT NULL DEFAULT 'COMPLIANCE',
  title TEXT NOT NULL,
  vendor TEXT NOT NULL,
  time_label TEXT NOT NULL DEFAULT 'just now',
  status public.alert_status NOT NULL DEFAULT 'active',
  cve_id TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Compliance frameworks
CREATE TABLE IF NOT EXISTS public.compliance_frameworks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  category TEXT NOT NULL,
  total_vendors INT NOT NULL DEFAULT 0,
  compliant INT NOT NULL DEFAULT 0,
  partial INT NOT NULL DEFAULT 0,
  non_compliant INT NOT NULL DEFAULT 0,
  pending INT NOT NULL DEFAULT 0,
  overall_score INT NOT NULL DEFAULT 0,
  trend public.compliance_trend NOT NULL DEFAULT 'stable',
  trend_delta INT NOT NULL DEFAULT 0,
  next_audit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_timeline_incident_id ON public.incident_timeline_events(incident_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_score ON public.compliance_frameworks(overall_score);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS incidents_updated_at ON public.incidents;
CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS alerts_updated_at ON public.alerts;
CREATE TRIGGER alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS compliance_updated_at ON public.compliance_frameworks;
CREATE TRIGGER compliance_updated_at
  BEFORE UPDATE ON public.compliance_frameworks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RLS (public preview access)
-- ============================================================
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "preview_open_incidents" ON public.incidents;
CREATE POLICY "preview_open_incidents" ON public.incidents FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "preview_open_timeline" ON public.incident_timeline_events;
CREATE POLICY "preview_open_timeline" ON public.incident_timeline_events FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "preview_open_alerts" ON public.alerts;
CREATE POLICY "preview_open_alerts" ON public.alerts FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "preview_open_compliance" ON public.compliance_frameworks;
CREATE POLICY "preview_open_compliance" ON public.compliance_frameworks FOR ALL TO public USING (true) WITH CHECK (true);

-- ============================================================
-- MOCK DATA
-- ============================================================
DO $$
BEGIN
  -- Incidents
  INSERT INTO public.incidents (id, title, severity, status, vendor, detected_at, assignee) VALUES
    ('INC-2024-001', 'Unauthorized API Access — Interswitch Gateway', 'critical', 'investigating', 'Interswitch', '2024-07-15 09:14', 'Chidi Okonkwo'),
    ('INC-2024-002', 'SSL Certificate Expiry — NigeriaCloud Storage', 'high', 'contained', 'NigeriaCloud', '2024-07-14 16:00', 'Amaka Eze'),
    ('INC-2024-003', 'Phishing Campaign Targeting Vendor Employees', 'high', 'open', 'Flutterwave', '2024-07-16 08:30', 'Unassigned'),
    ('INC-2024-004', 'Data Residency Violation — CloudSystems NG', 'medium', 'investigating', 'CloudSystems NG', '2024-07-13 11:00', 'Tunde Adeyemi'),
    ('INC-2024-005', 'Dependency Vulnerability — CVE-2024-3094 (XZ Utils)', 'critical', 'resolved', 'TechBridge Solutions', '2024-07-10 07:00', 'Ngozi Obi')
  ON CONFLICT (id) DO NOTHING;

  -- Timeline events for INC-2024-001
  INSERT INTO public.incident_timeline_events (id, incident_id, event_timestamp, event_type, actor, title, detail) VALUES
    ('t1', 'INC-2024-001', '2024-07-15 09:14', 'detected', 'System', 'Anomaly detected via KEV feed', 'Unusual API call pattern flagged — 340 requests/min from unrecognized IP block 185.220.x.x'),
    ('t2', 'INC-2024-001', '2024-07-15 09:22', 'triaged', 'SOC Analyst', 'Incident triaged as Critical', 'Confirmed unauthorized access attempt. Scope: payment gateway API. Potential data exposure risk.'),
    ('t3', 'INC-2024-001', '2024-07-15 09:35', 'escalated', 'Chidi Okonkwo', 'Escalated to CISO', 'Escalation triggered per CBN TPRMF §4.2 — critical vendor incident protocol.'),
    ('t4', 'INC-2024-001', '2024-07-15 09:40', 'assigned', 'CISO', 'Assigned remediation task to Interswitch IR Team', 'Task: Rotate API credentials, block IP range, provide access logs within 2h.'),
    ('t5', 'INC-2024-001', '2024-07-15 11:05', 'update', 'Interswitch IR', 'API credentials rotated', 'New credentials issued. IP block applied at gateway level. Log extraction in progress.'),
    ('t6', 'INC-2024-001', '2024-07-15 13:30', 'comment', 'Chidi Okonkwo', 'Awaiting forensic log review', 'Logs received. Forensic analysis underway to determine if data exfiltration occurred.')
  ON CONFLICT (id, incident_id) DO NOTHING;

  -- Timeline events for INC-2024-002
  INSERT INTO public.incident_timeline_events (id, incident_id, event_timestamp, event_type, actor, title, detail) VALUES
    ('t1', 'INC-2024-002', '2024-07-14 16:00', 'detected', 'System', 'SSL cert expiry alert triggered', 'Certificate for storage.nigeriacloud.ng expired. TLS handshake failures reported.'),
    ('t2', 'INC-2024-002', '2024-07-14 16:15', 'triaged', 'Amaka Eze', 'Triaged as High — service degradation', 'Downstream services affected: 3 internal integrations. No data breach confirmed.'),
    ('t3', 'INC-2024-002', '2024-07-14 17:00', 'assigned', 'Amaka Eze', 'Remediation task assigned to NigeriaCloud Ops', 'Task: Renew and deploy SSL certificate within 1h SLA.'),
    ('t4', 'INC-2024-002', '2024-07-14 17:45', 'resolved', 'NigeriaCloud Ops', 'Certificate renewed and deployed', 'New cert valid until 2025-07-14. All TLS handshakes restored. Incident contained.')
  ON CONFLICT (id, incident_id) DO NOTHING;

  -- Timeline events for INC-2024-003
  INSERT INTO public.incident_timeline_events (id, incident_id, event_timestamp, event_type, actor, title, detail) VALUES
    ('t1', 'INC-2024-003', '2024-07-16 08:30', 'detected', 'Threat Intel Feed', 'Phishing domain registered mimicking vendor', 'Domain flutterwav3.com registered 6h ago. Spoofed login page identified.'),
    ('t2', 'INC-2024-003', '2024-07-16 09:00', 'triaged', 'SOC Analyst', 'Triaged as High — credential theft risk', 'Vendor employees may be targeted. Risk of compromised vendor admin credentials.')
  ON CONFLICT (id, incident_id) DO NOTHING;

  -- Timeline events for INC-2024-004
  INSERT INTO public.incident_timeline_events (id, incident_id, event_timestamp, event_type, actor, title, detail) VALUES
    ('t1', 'INC-2024-004', '2024-07-13 11:00', 'detected', 'Compliance Scan', 'Data residency check failed', 'Customer PII records detected in EU-West-1 region. NDPR requires Nigeria-only storage.'),
    ('t2', 'INC-2024-004', '2024-07-13 11:30', 'triaged', 'Tunde Adeyemi', 'Triaged as Medium — NDPR compliance gap', 'No active breach. Residency misconfiguration. Regulatory notification may be required.'),
    ('t3', 'INC-2024-004', '2024-07-13 12:00', 'assigned', 'Tunde Adeyemi', 'Remediation task: migrate data to NG region', 'Deadline: 72h per NDPR incident response guidelines.')
  ON CONFLICT (id, incident_id) DO NOTHING;

  -- Timeline events for INC-2024-005
  INSERT INTO public.incident_timeline_events (id, incident_id, event_timestamp, event_type, actor, title, detail) VALUES
    ('t1', 'INC-2024-005', '2024-07-10 07:00', 'detected', 'KEV Scanner', 'CVE-2024-3094 matched in vendor SBOM', 'XZ Utils 5.6.0 found in TechBridge production build. CVSS 10.0 — backdoor in SSH.'),
    ('t2', 'INC-2024-005', '2024-07-10 07:20', 'escalated', 'Ngozi Obi', 'Immediate escalation to CISO and vendor CISO', 'Critical supply chain backdoor. Vendor isolation protocol initiated.'),
    ('t3', 'INC-2024-005', '2024-07-10 09:00', 'assigned', 'CISO', 'Emergency patch task assigned', 'Downgrade to XZ Utils 5.4.6. Audit all SSH access logs for anomalies.'),
    ('t4', 'INC-2024-005', '2024-07-10 14:00', 'update', 'TechBridge IR', 'Patch deployed to all production nodes', 'XZ Utils downgraded. SSH audit complete — no unauthorized access detected.'),
    ('t5', 'INC-2024-005', '2024-07-10 15:30', 'resolved', 'Ngozi Obi', 'Incident resolved — post-mortem scheduled', 'All systems clean. Post-mortem set for 2024-07-17.')
  ON CONFLICT (id, incident_id) DO NOTHING;

  -- Alerts
  INSERT INTO public.alerts (id, severity, alert_type, title, vendor, time_label, status, cve_id) VALUES
    ('alrt-001', 'CRITICAL', 'KEV_MATCH', 'KEV CVE-2024-3094 — XZ Utils Backdoor in Paystack SBOM', 'Paystack Integration Ltd', '14m ago', 'active', 'CVE-2024-3094'),
    ('alrt-002', 'CRITICAL', 'KEV_MATCH', 'KEV CVE-2024-3094 — XZ Utils Backdoor in Flutterwave SDK', 'Flutterwave SDK Services', '14m ago', 'active', 'CVE-2024-3094'),
    ('alrt-003', 'CRITICAL', 'KEV_MATCH', 'KEV CVE-2024-21762 — Fortinet SSL-VPN in CloudPay SBOM', 'CloudPay Africa Ltd', '1h ago', 'active', 'CVE-2024-21762'),
    ('alrt-004', 'HIGH', 'COMPLIANCE', 'ISO 27001 certification expiry in 28 days', 'RemitaNet Technologies', '4h ago', 'active', NULL),
    ('alrt-005', 'HIGH', 'COMPLIANCE', 'PCI DSS AOC renewal overdue — 12 days past deadline', 'GTCo Digital Labs', '1d ago', 'active', NULL),
    ('alrt-006', 'HIGH', 'CVE_MATCH', 'CVE-2024-21626 (CVSS 8.6) — runc container escape in vendor SBOM', 'CloudPay Africa Ltd', '8h ago', 'active', 'CVE-2024-21626'),
    ('alrt-007', 'HIGH', 'COMPLIANCE', 'SOC 2 Type II report expired — 3 months overdue', 'Interswitch Cloud Services', '2d ago', 'active', NULL),
    ('alrt-008', 'MEDIUM', 'CERT_EXPIRY', 'PCI DSS AOC expiry in 47 days', 'Unified Payments Ltd', '6h ago', 'active', NULL),
    ('alrt-009', 'MEDIUM', 'VRS_SPIKE', 'VRS increased +18 pts — external posture degradation', 'Interswitch Cloud Services', '2h ago', 'active', NULL),
    ('alrt-010', 'MEDIUM', 'QUESTIONNAIRE_OVERDUE', 'Security questionnaire overdue — 9 days past due', 'GTCo Digital Labs', '1d ago', 'active', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Compliance frameworks
  INSERT INTO public.compliance_frameworks (id, name, short_name, category, total_vendors, compliant, partial, non_compliant, pending, overall_score, trend, trend_delta, next_audit) VALUES
    ('iso27001', 'ISO/IEC 27001:2022', 'ISO 27001', 'Information Security', 12, 7, 3, 2, 0, 74, 'up', 4, '2026-09-15'),
    ('ndpr', 'Nigeria Data Protection Regulation', 'NDPR', 'Data Privacy', 12, 5, 4, 2, 1, 62, 'up', 7, '2026-08-30'),
    ('pcidss', 'PCI DSS v4.0', 'PCI-DSS', 'Payment Security', 8, 4, 2, 2, 0, 69, 'down', -2, '2026-10-01'),
    ('soc2', 'SOC 2 Type II', 'SOC 2', 'Service Organization', 9, 6, 2, 1, 0, 81, 'up', 3, '2026-11-20'),
    ('cbn', 'CBN Third-Party Risk Management Framework', 'CBN TPRMF', 'Regulatory', 12, 4, 5, 3, 0, 58, 'stable', 0, '2026-08-15'),
    ('nist', 'NIST Cybersecurity Framework 2.0', 'NIST CSF', 'Cybersecurity', 10, 5, 3, 2, 0, 71, 'up', 5, '2026-09-30')
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
