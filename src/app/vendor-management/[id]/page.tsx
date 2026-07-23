'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  Ticket,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  PauseCircle,
  Send,
  Phone,
  ExternalLink,
  Calendar,
  Building2,
  Globe,
  User,
  Layers,
  FileSearch,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Shared vendor data (mirrors VendorDataTable) ─────────────────────────────
const vendorData = [
  { id: 'vendor-001', legalName: 'Paystack Integration Ltd', registrationNo: 'RC-1234567', riskTier: 'CRITICAL' as const, vrs: 82, vrsChange: +7, lifecycleState: 'ACTIVE', category: 'Payment Gateway', integrationType: 'API', dataAccess: ['Card_Data', 'PII', 'Credentials'], contractEnd: '2025-03-15', lastAssessed: '2026-07-14', kevExposed: true, country: 'NG', contact: 'Chidi Okafor', compliancePct: 61 },
  { id: 'vendor-002', legalName: 'Interswitch Cloud Services', registrationNo: 'RC-7654321', riskTier: 'CRITICAL' as const, vrs: 79, vrsChange: +18, lifecycleState: 'ACTIVE', category: 'Cloud Infra', integrationType: 'API', dataAccess: ['PII', 'Credentials', 'Banking_Data'], contractEnd: '2026-11-30', lastAssessed: '2026-07-16', kevExposed: false, country: 'NG', contact: 'Ngozi Adeyemi', compliancePct: 54 },
  { id: 'vendor-003', legalName: 'Flutterwave SDK Services', registrationNo: 'RC-9988776', riskTier: 'CRITICAL' as const, vrs: 76, vrsChange: +4, lifecycleState: 'ACTIVE', category: 'Payment Gateway', integrationType: 'SDK', dataAccess: ['Card_Data', 'PII'], contractEnd: '2025-08-20', lastAssessed: '2026-07-16', kevExposed: true, country: 'NG', contact: 'Emeka Nwosu', compliancePct: 68 },
  { id: 'vendor-004', legalName: 'CloudPay Africa Ltd', registrationNo: 'RC-5544332', riskTier: 'CRITICAL' as const, vrs: 74, vrsChange: +9, lifecycleState: 'ACTIVE', category: 'Payment Processor', integrationType: 'API', dataAccess: ['Card_Data', 'Banking_Data'], contractEnd: '2026-05-01', lastAssessed: '2026-07-15', kevExposed: true, country: 'NG', contact: 'Aisha Bello', compliancePct: 57 },
  { id: 'vendor-005', legalName: 'GTCo Digital Labs', registrationNo: 'RC-3322110', riskTier: 'HIGH' as const, vrs: 71, vrsChange: -3, lifecycleState: 'UNDER_REVIEW', category: 'KYC/AML', integrationType: 'API', dataAccess: ['PII', 'Identity_Data'], contractEnd: '2026-12-31', lastAssessed: '2026-07-07', kevExposed: false, country: 'NG', contact: 'Olumide Fashola', compliancePct: 72 },
  { id: 'vendor-006', legalName: 'RemitaNet Technologies', registrationNo: 'RC-6677889', riskTier: 'HIGH' as const, vrs: 68, vrsChange: +2, lifecycleState: 'ACTIVE', category: 'Payment Processor', integrationType: 'API', dataAccess: ['Banking_Data', 'PII'], contractEnd: '2025-10-15', lastAssessed: '2026-07-12', kevExposed: false, country: 'NG', contact: 'Fatima Aliyu', compliancePct: 76 },
  { id: 'vendor-007', legalName: 'Unified Payments Ltd', registrationNo: 'RC-1122334', riskTier: 'HIGH' as const, vrs: 65, vrsChange: -5, lifecycleState: 'ACTIVE', category: 'Payment Gateway', integrationType: 'API', dataAccess: ['Card_Data'], contractEnd: '2027-01-20', lastAssessed: '2026-07-10', kevExposed: false, country: 'NG', contact: 'Tunde Badmus', compliancePct: 81 },
  { id: 'vendor-008', legalName: 'Veritas KYC Solutions', registrationNo: 'RC-4455667', riskTier: 'HIGH' as const, vrs: 63, vrsChange: +1, lifecycleState: 'QUESTIONNAIRE_SENT', category: 'Identity Verification', integrationType: 'API', dataAccess: ['PII', 'Identity_Data', 'Biometrics'], contractEnd: '2026-09-30', lastAssessed: '2026-06-20', kevExposed: false, country: 'NG', contact: 'Chinwe Obi', compliancePct: 43 },
  { id: 'vendor-009', legalName: 'FinEdge Analytics', registrationNo: 'RC-8899001', riskTier: 'MEDIUM' as const, vrs: 48, vrsChange: -2, lifecycleState: 'ACTIVE', category: 'Analytics', integrationType: 'SaaS', dataAccess: ['Anonymised_Data'], contractEnd: '2026-06-30', lastAssessed: '2026-07-01', kevExposed: false, country: 'NG', contact: 'Bayo Adewale', compliancePct: 88 },
  { id: 'vendor-010', legalName: 'TrustID Africa Ltd', registrationNo: 'RC-2233445', riskTier: 'MEDIUM' as const, vrs: 44, vrsChange: 0, lifecycleState: 'ACTIVE', category: 'Identity Verification', integrationType: 'API', dataAccess: ['PII', 'Identity_Data'], contractEnd: '2026-08-15', lastAssessed: '2026-06-28', kevExposed: false, country: 'NG', contact: 'Yetunde Ojo', compliancePct: 79 },
  { id: 'vendor-011', legalName: 'NigeriaHost Cloud Ltd', registrationNo: 'RC-5566778', riskTier: 'MEDIUM' as const, vrs: 41, vrsChange: -4, lifecycleState: 'ACTIVE', category: 'Cloud Infra', integrationType: 'SaaS', dataAccess: ['System_Data'], contractEnd: '2027-03-01', lastAssessed: '2026-07-05', kevExposed: false, country: 'NG', contact: 'Ikenna Eze', compliancePct: 83 },
  { id: 'vendor-012', legalName: 'SecureSign Digital', registrationNo: 'RC-9900112', riskTier: 'LOW' as const, vrs: 22, vrsChange: +1, lifecycleState: 'ACTIVE', category: 'Document Management', integrationType: 'SaaS', dataAccess: ['Contract_Data'], contractEnd: '2026-12-01', lastAssessed: '2026-06-15', kevExposed: false, country: 'NG', contact: 'Amara Osei', compliancePct: 94 },
];

// ── Mock data generators ──────────────────────────────────────────────────────
const getRiskHistory = (id: string) => [
  { date: '2026-07-14', vrs: id === 'vendor-001' ? 82 : id === 'vendor-002' ? 79 : 76, event: 'Scheduled Re-Assessment', assessor: 'Risk Engine v3', status: 'COMPLETED' },
  { date: '2026-06-01', vrs: id === 'vendor-001' ? 75 : id === 'vendor-002' ? 61 : 72, event: 'Quarterly Assessment', assessor: 'Olumide Fashola', status: 'COMPLETED' },
  { date: '2026-03-15', vrs: id === 'vendor-001' ? 68 : id === 'vendor-002' ? 55 : 65, event: 'Onboarding Assessment', assessor: 'Ngozi Adeyemi', status: 'COMPLETED' },
  { date: '2025-12-10', vrs: id === 'vendor-001' ? 61 : id === 'vendor-002' ? 48 : 59, event: 'Annual Review', assessor: 'Fatima Aliyu', status: 'COMPLETED' },
];

const getControlGaps = (id: string) => [
  { control: 'MFA Enforcement', framework: 'ISO 27001 A.9.4', severity: 'CRITICAL', status: 'OPEN', identified: '2026-07-14', owner: 'Vendor IT' },
  { control: 'Data Encryption at Rest', framework: 'NDPR §2.1', severity: 'HIGH', status: 'IN_REMEDIATION', identified: '2026-06-01', owner: 'Vendor Security' },
  { control: 'Penetration Testing (Annual)', framework: 'PCI-DSS 11.3', severity: id === 'vendor-001' ? 'CRITICAL' : 'HIGH', status: 'OPEN', identified: '2026-05-20', owner: 'Vendor CISO' },
  { control: 'Incident Response Plan', framework: 'ISO 27001 A.16', severity: 'MEDIUM', status: 'CLOSED', identified: '2026-03-15', owner: 'Vendor Ops' },
  { control: 'Third-Party Audit Report', framework: 'SOC 2 Type II', severity: 'HIGH', status: 'OPEN', identified: '2026-07-01', owner: 'Compliance Team' },
];

const getRemediationTickets = (id: string) => [
  { ticketId: `REM-${id.slice(-3).toUpperCase()}-001`, title: 'Enforce MFA across all admin accounts', priority: 'P1', status: 'OPEN', created: '2026-07-14', due: '2026-07-28', assignee: 'Vendor IT Lead' },
  { ticketId: `REM-${id.slice(-3).toUpperCase()}-002`, title: 'Encrypt PII data stores with AES-256', priority: 'P2', status: 'IN_PROGRESS', created: '2026-06-01', due: '2026-08-01', assignee: 'Vendor Security' },
  { ticketId: `REM-${id.slice(-3).toUpperCase()}-003`, title: 'Submit annual penetration test report', priority: 'P1', status: 'OVERDUE', created: '2026-05-20', due: '2026-06-30', assignee: 'Vendor CISO' },
  { ticketId: `REM-${id.slice(-3).toUpperCase()}-004`, title: 'Update incident response runbook', priority: 'P3', status: 'CLOSED', created: '2026-03-15', due: '2026-04-30', assignee: 'Vendor Ops' },
];

const getComplianceMappings = (id: string) => [
  { framework: 'ISO 27001', version: '2022', controls: 114, mapped: id === 'vendor-001' ? 70 : id === 'vendor-002' ? 62 : 85, status: 'PARTIAL' as const },
  { framework: 'NDPR', version: '2019', controls: 28, mapped: id === 'vendor-001' ? 18 : id === 'vendor-002' ? 15 : 24, status: 'PARTIAL' as const },
  { framework: 'PCI-DSS', version: 'v4.0', controls: 64, mapped: id === 'vendor-001' ? 38 : id === 'vendor-002' ? 35 : 55, status: 'PARTIAL' as const },
  { framework: 'SOC 2 Type II', version: '2017', controls: 61, mapped: id === 'vendor-001' ? 30 : id === 'vendor-002' ? 28 : 50, status: 'PARTIAL' as const },
  { framework: 'CBN Cybersecurity', version: '2023', controls: 22, mapped: id === 'vendor-001' ? 14 : id === 'vendor-002' ? 12 : 20, status: 'PARTIAL' as const },
];

// ── Style helpers ─────────────────────────────────────────────────────────────
const tierBadge: Record<string, string> = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
};

const tierBg: Record<string, string> = {
  CRITICAL: 'border-status-critical/40 bg-status-critical/5',
  HIGH: 'border-status-high/40 bg-status-high/5',
  MEDIUM: 'border-status-medium/40 bg-status-medium/5',
  LOW: 'border-status-low/40 bg-status-low/5',
};

const severityColor: Record<string, string> = {
  CRITICAL: 'text-status-critical bg-status-critical/10 border-status-critical/30',
  HIGH: 'text-status-high bg-status-high/10 border-status-high/30',
  MEDIUM: 'text-status-medium bg-status-medium/10 border-status-medium/30',
  LOW: 'text-status-low bg-status-low/10 border-status-low/30',
};

const ticketStatusColor: Record<string, string> = {
  OPEN: 'text-status-high bg-status-high/10 border-status-high/30',
  IN_PROGRESS: 'text-status-info bg-status-info/10 border-status-info/30',
  OVERDUE: 'text-status-critical bg-status-critical/10 border-status-critical/30',
  CLOSED: 'text-status-low bg-status-low/10 border-status-low/30',
};

const stateColor: Record<string, string> = {
  ACTIVE: 'text-status-low bg-status-low/10 border-status-low/30',
  UNDER_REVIEW: 'text-status-info bg-status-info/10 border-status-info/30',
  QUESTIONNAIRE_SENT: 'text-primary bg-primary/10 border-primary/30',
  SUSPENDED: 'text-status-high bg-status-high/10 border-status-high/30',
  OFFBOARDING: 'text-status-medium bg-status-medium/10 border-status-medium/30',
  TERMINATED: 'text-status-critical bg-status-critical/10 border-status-critical/30',
};

const dataAccessColor: Record<string, string> = {
  Card_Data: 'badge-critical',
  PII: 'badge-high',
  Credentials: 'badge-critical',
  Banking_Data: 'badge-high',
  Identity_Data: 'badge-medium',
  Biometrics: 'badge-high',
  Anonymised_Data: 'badge-low',
  System_Data: 'badge-info',
  Contract_Data: 'badge-info',
};

const vrsColor = (vrs: number) => {
  if (vrs >= 70) return 'text-status-critical';
  if (vrs >= 50) return 'text-status-high';
  if (vrs >= 30) return 'text-status-medium';
  return 'text-status-low';
};

const vrsBarColor = (vrs: number) => {
  if (vrs >= 70) return 'bg-status-critical';
  if (vrs >= 50) return 'bg-status-high';
  if (vrs >= 30) return 'bg-status-medium';
  return 'bg-status-low';
};

const isContractExpired = (dateStr: string) => new Date(dateStr) < new Date('2026-07-17');
const isContractExpiringSoon = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date('2026-07-17');
  const diff = Math.floor((d.getTime() - now.getTime()) / 86400000);
  return diff >= 0 && diff <= 90;
};

const controlStatusIcon = (status: string) => {
  if (status === 'CLOSED') return <CheckCircle2 size={13} className="text-status-low" />;
  if (status === 'IN_REMEDIATION') return <Clock size={13} className="text-status-info" />;
  return <XCircle size={13} className="text-status-critical" />;
};

type TabId = 'overview' | 'assessments' | 'compliance' | 'gaps' | 'tickets';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Activity size={13} /> },
  { id: 'assessments', label: 'Assessment History', icon: <ShieldCheck size={13} /> },
  { id: 'compliance', label: 'Compliance Mappings', icon: <ClipboardList size={13} /> },
  { id: 'gaps', label: 'Control Gaps', icon: <ShieldAlert size={13} /> },
  { id: 'tickets', label: 'Remediation', icon: <Ticket size={13} /> },
];

export default function VendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [suspended, setSuspended] = useState(false);

  const vendor = vendorData.find((v) => v.id === params.id);

  if (!vendor) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <ShieldAlert size={48} className="text-muted-foreground" />
          <p className="text-base font-semibold text-foreground">Vendor not found</p>
          <p className="text-sm text-muted-foreground">No vendor with ID <span className="font-mono-data">{String(params.id)}</span> exists.</p>
          <button
            onClick={() => router.push('/vendor-management')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
          >
            <ArrowLeft size={14} /> Back to Registry
          </button>
        </div>
      </AppLayout>
    );
  }

  const TrendIcon = vendor.vrsChange > 0 ? TrendingUp : vendor.vrsChange < 0 ? TrendingDown : Minus;
  const trendColor = vendor.vrsChange > 0 ? 'text-status-critical' : vendor.vrsChange < 0 ? 'text-status-low' : 'text-muted-foreground';

  const riskHistory = getRiskHistory(vendor.id);
  const controlGaps = getControlGaps(vendor.id);
  const remediationTickets = getRemediationTickets(vendor.id);
  const complianceMappings = getComplianceMappings(vendor.id);

  const openGaps = controlGaps.filter((g) => g.status === 'OPEN').length;
  const openTickets = remediationTickets.filter((t) => t.status === 'OPEN' || t.status === 'OVERDUE').length;
  const contractExpired = isContractExpired(vendor.contractEnd);
  const contractExpiringSoon = isContractExpiringSoon(vendor.contractEnd);

  const handleAssess = () => toast.success(`Assessment triggered for ${vendor.legalName}`);
  const handleSuspend = () => {
    setSuspended(true);
    toast.warning(`${vendor.legalName} flagged for suspension review`);
  };
  const handleContact = () => toast.success(`Contact request sent to ${vendor.contact} at ${vendor.legalName}`);

  return (
    <AppLayout>
      <div className="space-y-5 fade-in">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            onClick={() => router.push('/vendor-management')}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            Vendor Registry
          </button>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium truncate max-w-[240px]">{vendor.legalName}</span>
        </div>

        {/* ── Hero header ── */}
        <div className={`rounded-xl border p-5 ${tierBg[vendor.riskTier] ?? 'border-border bg-card'}`}>
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">

            {/* VRS gauge */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-xl border border-border bg-card/60 gap-0.5">
              <span className={`font-mono-data font-black text-3xl leading-none ${vrsColor(vendor.vrs)}`}>{vendor.vrs}</span>
              <span className="text-2xs text-muted-foreground font-semibold tracking-widest uppercase">VRS</span>
              <div className="w-12 h-1 bg-muted rounded-full overflow-hidden mt-1">
                <div className={`h-full rounded-full ${vrsBarColor(vendor.vrs)}`} style={{ width: `${vendor.vrs}%` }} />
              </div>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">{vendor.legalName}</h1>
                <span className={`text-2xs font-mono-data font-bold px-2 py-0.5 rounded ${tierBadge[vendor.riskTier] ?? ''}`}>
                  {vendor.riskTier}
                </span>
                {vendor.kevExposed && (
                  <span className="flex items-center gap-1 text-2xs text-status-critical bg-status-critical/10 border border-status-critical/30 px-1.5 py-0.5 rounded">
                    <AlertTriangle size={10} className="alert-pulse" /> KEV Exposed
                  </span>
                )}
                {suspended && (
                  <span className="flex items-center gap-1 text-2xs text-status-high bg-status-high/10 border border-status-high/30 px-1.5 py-0.5 rounded">
                    <PauseCircle size={10} /> Suspension Pending
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 size={11} />{vendor.registrationNo}</span>
                <span className="flex items-center gap-1"><Layers size={11} />{vendor.category} · {vendor.integrationType}</span>
                <span className="flex items-center gap-1"><Globe size={11} />{vendor.country}</span>
                <span className="flex items-center gap-1"><User size={11} />{vendor.contact}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
                <span className={`flex items-center gap-1 font-mono-data font-semibold ${trendColor}`}>
                  <TrendIcon size={12} />
                  {vendor.vrsChange > 0 ? '+' : ''}{vendor.vrsChange} VRS (30d)
                </span>
                <span className="text-muted-foreground">Last assessed: <span className="font-mono-data text-foreground">{vendor.lastAssessed}</span></span>
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-2xs font-medium ${stateColor[vendor.lifecycleState] ?? 'text-muted-foreground bg-muted border-border'}`}>
                  {vendor.lifecycleState.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
              <button
                onClick={handleAssess}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all active:scale-95 whitespace-nowrap"
              >
                <FileSearch size={13} /> Assess
              </button>
              <button
                onClick={handleSuspend}
                disabled={suspended}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-status-high/10 border border-status-high/30 text-status-high text-xs font-semibold hover:bg-status-high/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <PauseCircle size={13} /> Suspend
              </button>
              <button
                onClick={handleContact}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-xs font-semibold hover:bg-secondary transition-all active:scale-95 whitespace-nowrap"
              >
                <Phone size={13} /> Contact
              </button>
            </div>
          </div>

          {/* Contract status bar */}
          <div className={`mt-4 flex items-center gap-3 px-3 py-2 rounded-lg border text-xs ${
            contractExpired
              ? 'bg-status-critical/10 border-status-critical/30 text-status-critical'
              : contractExpiringSoon
              ? 'bg-status-medium/10 border-status-medium/30 text-status-medium' :'bg-muted/40 border-border text-muted-foreground'
          }`}>
            <Calendar size={13} className="flex-shrink-0" />
            <span className="font-semibold">Contract End:</span>
            <span className="font-mono-data">{vendor.contractEnd}</span>
            {contractExpired && <span className="font-bold ml-1">— EXPIRED</span>}
            {!contractExpired && contractExpiringSoon && <span className="font-semibold ml-1">— Expiring within 90 days</span>}
            <div className="ml-auto flex items-center gap-1.5 text-2xs">
              <span className="text-muted-foreground">Compliance:</span>
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${vendor.compliancePct >= 80 ? 'bg-status-low' : vendor.compliancePct >= 60 ? 'bg-status-medium' : 'bg-status-high'}`}
                  style={{ width: `${vendor.compliancePct}%` }}
                />
              </div>
              <span className="font-mono-data font-semibold text-foreground">{vendor.compliancePct}%</span>
            </div>
          </div>
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'VRS Score', value: `${vendor.vrs}/100`, sub: `${vendor.vrsChange > 0 ? '+' : ''}${vendor.vrsChange} this month`, color: vrsColor(vendor.vrs) },
            { label: 'Compliance', value: `${vendor.compliancePct}%`, sub: vendor.compliancePct >= 80 ? 'Satisfactory' : vendor.compliancePct >= 60 ? 'Needs improvement' : 'Critical gaps', color: vendor.compliancePct >= 80 ? 'text-status-low' : vendor.compliancePct >= 60 ? 'text-status-medium' : 'text-status-critical' },
            { label: 'Open Control Gaps', value: String(openGaps), sub: `${controlGaps.length} total`, color: openGaps > 2 ? 'text-status-critical' : openGaps > 0 ? 'text-status-high' : 'text-status-low' },
            { label: 'Open Tickets', value: String(openTickets), sub: `${remediationTickets.length} total`, color: openTickets > 2 ? 'text-status-critical' : openTickets > 0 ? 'text-status-high' : 'text-status-low' },
          ].map((kpi) => (
            <div key={kpi.label} className="card-elevated p-4 space-y-1">
              <p className="text-2xs text-muted-foreground uppercase tracking-wider font-semibold">{kpi.label}</p>
              <p className={`font-mono-data font-black text-2xl ${kpi.color}`}>{kpi.value}</p>
              <p className="text-2xs text-muted-foreground">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="card-elevated overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center gap-0.5 px-4 pt-3 pb-0 border-b border-border overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-primary bg-primary/5' :'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'gaps' && openGaps > 0 && (
                  <span className="ml-0.5 text-2xs font-mono-data bg-status-critical text-white px-1 rounded-full">{openGaps}</span>
                )}
                {tab.id === 'tickets' && openTickets > 0 && (
                  <span className="ml-0.5 text-2xs font-mono-data bg-status-high text-white px-1 rounded-full">{openTickets}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Vendor profile details */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <FileText size={13} className="text-primary" /> Vendor Profile
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-xs">
                    {[
                      { label: 'Legal Name', value: vendor.legalName },
                      { label: 'Registration No.', value: vendor.registrationNo },
                      { label: 'Country', value: vendor.country },
                      { label: 'Category', value: vendor.category },
                      { label: 'Integration Type', value: vendor.integrationType },
                      { label: 'Contact Person', value: vendor.contact },
                      { label: 'Lifecycle State', value: vendor.lifecycleState.replace(/_/g, ' ') },
                      { label: 'Contract End', value: vendor.contractEnd },
                      { label: 'Last Assessed', value: vendor.lastAssessed },
                    ].map((row) => (
                      <div key={row.label}>
                        <p className="text-2xs text-muted-foreground mb-0.5">{row.label}</p>
                        <p className="font-medium text-foreground font-mono-data text-xs">{row.value ?? '—'}</p>
                      </div>
                    ))}
                  </div>
                  {vendor.dataAccess && vendor.dataAccess.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-2xs text-muted-foreground mb-2">Data Access Scope</p>
                      <div className="flex flex-wrap gap-1.5">
                        {vendor.dataAccess.map((d) => (
                          <span key={d} className={`text-2xs font-mono-data px-1.5 py-0.5 rounded ${dataAccessColor[d] ?? 'badge-info'}`}>
                            {d.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Latest assessment summary */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-primary" /> Latest Assessment Summary
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span>Date: <span className="text-foreground font-mono-data">{riskHistory[0]?.date}</span></span>
                    <ChevronRight size={12} />
                    <span>Event: <span className="text-foreground">{riskHistory[0]?.event}</span></span>
                    <ChevronRight size={12} />
                    <span>Assessor: <span className="text-foreground">{riskHistory[0]?.assessor}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-muted-foreground">Questionnaire compliance:</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[200px]">
                      <div
                        className={`h-full rounded-full ${vendor.compliancePct >= 80 ? 'bg-status-low' : vendor.compliancePct >= 60 ? 'bg-status-medium' : 'bg-status-high'}`}
                        style={{ width: `${vendor.compliancePct}%` }}
                      />
                    </div>
                    <span className="font-mono-data text-xs text-foreground">{vendor.compliancePct}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── ASSESSMENT HISTORY ── */}
            {activeTab === 'assessments' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Full assessment history for <span className="text-foreground font-medium">{vendor.legalName}</span></p>
                <div className="space-y-2">
                  {riskHistory.map((h, i) => (
                    <div key={`hist-${i}`} className="card-elevated p-4 flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                        {i < riskHistory.length - 1 && <div className="w-px h-8 bg-border" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-xs font-semibold text-foreground">{h.event}</p>
                            <p className="text-2xs text-muted-foreground mt-0.5">Assessor: {h.assessor}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <p className={`font-mono-data font-bold text-lg leading-none ${vrsColor(h.vrs)}`}>{h.vrs}</p>
                              <p className="text-2xs text-muted-foreground">VRS</p>
                            </div>
                            <span className="text-2xs font-mono-data text-muted-foreground bg-muted px-2 py-1 rounded">{h.date}</span>
                            <span className="text-2xs text-status-low bg-status-low/10 border border-status-low/30 px-1.5 py-0.5 rounded font-medium">{h.status}</span>
                          </div>
                        </div>
                        {i > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 text-2xs text-muted-foreground">
                            <span>VRS change from previous:</span>
                            <span className={`font-mono-data font-semibold ${h.vrs < riskHistory[i - 1].vrs ? 'text-status-low' : 'text-status-critical'}`}>
                              {h.vrs < riskHistory[i - 1].vrs ? '' : '+'}{h.vrs - riskHistory[i - 1].vrs}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── COMPLIANCE MAPPINGS ── */}
            {activeTab === 'compliance' && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">{complianceMappings.length} frameworks mapped for <span className="text-foreground font-medium">{vendor.legalName}</span></p>
                <div className="space-y-3">
                  {complianceMappings.map((fw) => {
                    const pct = Math.round((fw.mapped / fw.controls) * 100);
                    return (
                      <div key={fw.framework} className="card-elevated p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-foreground">{fw.framework}</p>
                              <span className="text-2xs font-mono-data text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{fw.version}</span>
                            </div>
                            <p className="text-2xs text-muted-foreground mt-0.5">{fw.mapped} of {fw.controls} controls mapped</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`font-mono-data font-bold text-lg leading-none ${pct >= 80 ? 'text-status-low' : pct >= 60 ? 'text-status-medium' : 'text-status-critical'}`}>{pct}%</p>
                            <p className="text-2xs text-muted-foreground">coverage</p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-status-low' : pct >= 60 ? 'bg-status-medium' : 'bg-status-high'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-2xs text-muted-foreground">
                          <span>{fw.controls - fw.mapped} controls not yet mapped</span>
                          <span className={`font-semibold ${pct >= 80 ? 'text-status-low' : pct >= 60 ? 'text-status-medium' : 'text-status-critical'}`}>
                            {pct >= 80 ? 'Satisfactory' : pct >= 60 ? 'Partial' : 'Critical gaps'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── CONTROL GAPS ── */}
            {activeTab === 'gaps' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-muted-foreground">{controlGaps.length} control gaps identified — {openGaps} open</p>
                  <div className="flex items-center gap-3 text-2xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-critical" />Open</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-info" />In Remediation</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-low" />Closed</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[640px]">
                    <thead>
                      <tr className="border-b border-border">
                        {['Control', 'Framework', 'Severity', 'Status', 'Identified', 'Owner'].map((h) => (
                          <th key={h} className="text-left text-2xs font-semibold tracking-widest uppercase text-muted-foreground pb-2.5 pr-4 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {controlGaps.map((gap, i) => (
                        <tr key={`gap-${i}`} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="py-3 pr-4 font-medium text-foreground">{gap.control}</td>
                          <td className="py-3 pr-4 font-mono-data text-muted-foreground text-2xs">{gap.framework}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded border ${severityColor[gap.severity] ?? ''}`}>{gap.severity}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1.5">
                              {controlStatusIcon(gap.status)}
                              <span className="text-2xs text-muted-foreground">{gap.status.replace(/_/g, ' ')}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 font-mono-data text-muted-foreground text-2xs whitespace-nowrap">{gap.identified}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{gap.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── REMEDIATION TICKETS ── */}
            {activeTab === 'tickets' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{remediationTickets.length} remediation tickets — {openTickets} requiring action</p>
                <div className="space-y-2">
                  {remediationTickets.map((ticket, i) => (
                    <div key={`ticket-${i}`} className="card-elevated p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {ticket.status === 'CLOSED' ? (
                              <CheckCircle2 size={16} className="text-status-low" />
                            ) : ticket.status === 'OVERDUE' ? (
                              <AlertCircle size={16} className="text-status-critical alert-pulse" />
                            ) : ticket.status === 'IN_PROGRESS' ? (
                              <Clock size={16} className="text-status-info" />
                            ) : (
                              <AlertCircle size={16} className="text-status-high" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono-data text-2xs text-muted-foreground">{ticket.ticketId}</span>
                              <span className={`text-2xs font-bold ${ticket.priority === 'P1' ? 'text-status-critical' : ticket.priority === 'P2' ? 'text-status-high' : 'text-status-medium'}`}>{ticket.priority}</span>
                            </div>
                            <p className="text-xs font-medium text-foreground mt-0.5">{ticket.title}</p>
                            <p className="text-2xs text-muted-foreground mt-1">Assignee: {ticket.assignee} · Created: {ticket.created}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-2xs text-muted-foreground">Due</p>
                            <p className={`font-mono-data text-xs font-semibold ${ticket.status === 'OVERDUE' ? 'text-status-critical' : 'text-foreground'}`}>{ticket.due}</p>
                          </div>
                          <span className={`text-2xs font-medium px-1.5 py-0.5 rounded border ${ticketStatusColor[ticket.status] ?? ''}`}>
                            {ticket.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Bottom action bar ── */}
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink size={13} />
            <span>Vendor ID: <span className="font-mono-data text-foreground">{vendor.id}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleContact}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-medium text-foreground hover:bg-secondary transition-all"
            >
              <Phone size={12} /> Contact Vendor
            </button>
            <button
              onClick={handleSuspend}
              disabled={suspended}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-high/10 border border-status-high/30 text-status-high text-xs font-semibold hover:bg-status-high/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PauseCircle size={12} /> {suspended ? 'Suspension Pending' : 'Suspend Vendor'}
            </button>
            <button
              onClick={handleAssess}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all active:scale-95"
            >
              <Send size={12} /> Trigger Assessment
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
