'use client';

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  Ticket,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';

export interface VendorDetailData {
  id: string;
  legalName: string;
  registrationNo?: string;
  riskTier: string;
  vrs: number;
  vrsChange: number;
  lifecycleState: string;
  category: string;
  integrationType?: string;
  dataAccess?: string[];
  contractEnd?: string;
  lastAssessed: string;
  kevExposed?: boolean;
  country?: string;
  contact?: string;
  compliancePct: number;
}

interface VendorDetailModalProps {
  vendor: VendorDetailData | null;
  onClose: () => void;
}

// ── Mock data generators keyed by vendor id ──────────────────────────────────

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

const getQuestionnaireResponses = (id: string) => [
  { section: 'Data Governance', question: 'Do you maintain a data inventory of all PII processed?', response: 'Yes', compliant: true, evidence: 'Data Inventory v2.3 (2026-05)' },
  { section: 'Data Governance', question: 'Is data retention policy documented and enforced?', response: 'Partial', compliant: false, evidence: 'Policy exists but enforcement gaps noted' },
  { section: 'Access Control', question: 'Is MFA enforced for all privileged accounts?', response: 'No', compliant: false, evidence: 'MFA only on external-facing systems' },
  { section: 'Access Control', question: 'Are access reviews conducted quarterly?', response: 'Yes', compliant: true, evidence: 'Q1 2026 Access Review Report' },
  { section: 'Incident Response', question: 'Is an incident response plan documented?', response: 'Yes', compliant: true, evidence: 'IRP v1.8 (2026-01)' },
  { section: 'Incident Response', question: 'Were any security incidents reported in the last 12 months?', response: id === 'vendor-001' ? 'Yes — 2 incidents' : 'No', compliant: id !== 'vendor-001', evidence: id === 'vendor-001' ? 'Incident reports IR-2025-11, IR-2026-02' : 'No incidents on record' },
  { section: 'Third-Party Risk', question: 'Do you conduct due diligence on your sub-processors?', response: 'Partial', compliant: false, evidence: 'Annual review only; no continuous monitoring' },
  { section: 'Vulnerability Management', question: 'Is a vulnerability scanning programme in place?', response: 'Yes', compliant: true, evidence: 'Qualys scan reports (monthly)' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const tierBadge: Record<string, string> = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
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

const priorityColor: Record<string, string> = {
  P1: 'text-status-critical',
  P2: 'text-status-high',
  P3: 'text-status-medium',
};

const vrsColor = (vrs: number) => {
  if (vrs >= 70) return 'text-status-critical';
  if (vrs >= 50) return 'text-status-high';
  if (vrs >= 30) return 'text-status-medium';
  return 'text-status-low';
};

const controlStatusIcon = (status: string) => {
  if (status === 'CLOSED') return <CheckCircle2 size={13} className="text-status-low" />;
  if (status === 'IN_REMEDIATION') return <Clock size={13} className="text-status-info" />;
  return <XCircle size={13} className="text-status-critical" />;
};

type TabId = 'overview' | 'assessments' | 'gaps' | 'tickets' | 'questionnaire';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Activity size={13} /> },
  { id: 'assessments', label: 'Risk History', icon: <ShieldCheck size={13} /> },
  { id: 'gaps', label: 'Control Gaps', icon: <ShieldAlert size={13} /> },
  { id: 'tickets', label: 'Remediation', icon: <Ticket size={13} /> },
  { id: 'questionnaire', label: 'Questionnaire', icon: <ClipboardList size={13} /> },
];

export default function VendorDetailModal({ vendor, onClose }: VendorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (!vendor) return null;

  const TrendIcon = vendor.vrsChange > 0 ? TrendingUp : vendor.vrsChange < 0 ? TrendingDown : Minus;
  const trendColor = vendor.vrsChange > 0 ? 'text-status-critical' : vendor.vrsChange < 0 ? 'text-status-low' : 'text-muted-foreground';

  const riskHistory = getRiskHistory(vendor.id);
  const controlGaps = getControlGaps(vendor.id);
  const remediationTickets = getRemediationTickets(vendor.id);
  const questionnaireResponses = getQuestionnaireResponses(vendor.id);

  const openGaps = controlGaps.filter((g) => g.status === 'OPEN').length;
  const openTickets = remediationTickets.filter((t) => t.status === 'OPEN' || t.status === 'OVERDUE').length;
  const compliantResponses = questionnaireResponses.filter((q) => q.compliant).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-card shadow-2xl slide-up overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(0,212,255,0.08), 0 25px 50px rgba(0,0,0,0.6)' }}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border bg-muted/20 flex-shrink-0">
          <div className="flex items-start gap-4">
            {/* VRS badge */}
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg border border-border bg-muted/40 flex-shrink-0">
              <span className={`font-mono-data font-bold text-xl leading-none ${vrsColor(vendor.vrs)}`}>{vendor.vrs}</span>
              <span className="text-2xs text-muted-foreground mt-0.5">VRS</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-foreground">{vendor.legalName}</h2>
                {vendor.kevExposed && (
                  <span className="flex items-center gap-1 text-2xs text-status-critical bg-status-critical/10 border border-status-critical/30 px-1.5 py-0.5 rounded">
                    <AlertTriangle size={10} className="alert-pulse" /> KEV Exposed
                  </span>
                )}
                <span className={`text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded ${tierBadge[vendor.riskTier] ?? ''}`}>
                  {vendor.riskTier}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                {vendor.registrationNo && <span className="font-mono-data">{vendor.registrationNo}</span>}
                <span>{vendor.category}</span>
                {vendor.integrationType && <span className="bg-muted px-1.5 py-0.5 rounded font-mono-data text-2xs">{vendor.integrationType}</span>}
                {vendor.country && <span>{vendor.country}</span>}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
                  <TrendIcon size={12} />
                  <span className="font-mono-data font-semibold">{vendor.vrsChange > 0 ? '+' : ''}{vendor.vrsChange} 30d</span>
                </div>
                <span className="text-2xs text-muted-foreground">Last assessed: <span className="font-mono-data text-foreground">{vendor.lastAssessed}</span></span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-0.5 px-6 pt-3 pb-0 border-b border-border flex-shrink-0 overflow-x-auto">
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

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'VRS Score', value: `${vendor.vrs}/100`, sub: `${vendor.vrsChange > 0 ? '+' : ''}${vendor.vrsChange} this month`, color: vrsColor(vendor.vrs) },
                  { label: 'Compliance', value: `${vendor.compliancePct}%`, sub: vendor.compliancePct >= 80 ? 'Satisfactory' : vendor.compliancePct >= 60 ? 'Needs improvement' : 'Critical gaps', color: vendor.compliancePct >= 80 ? 'text-status-low' : vendor.compliancePct >= 60 ? 'text-status-medium' : 'text-status-critical' },
                  { label: 'Open Control Gaps', value: String(openGaps), sub: `${controlGaps.length} total gaps`, color: openGaps > 2 ? 'text-status-critical' : openGaps > 0 ? 'text-status-high' : 'text-status-low' },
                  { label: 'Open Tickets', value: String(openTickets), sub: `${remediationTickets.length} total tickets`, color: openTickets > 2 ? 'text-status-critical' : openTickets > 0 ? 'text-status-high' : 'text-status-low' },
                ].map((kpi) => (
                  <div key={kpi.label} className="card-elevated p-4 space-y-1">
                    <p className="text-2xs text-muted-foreground uppercase tracking-wider font-semibold">{kpi.label}</p>
                    <p className={`font-mono-data font-bold text-2xl ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-2xs text-muted-foreground">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* Vendor details */}
              <div className="card-elevated p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <FileText size={13} className="text-primary" /> Vendor Profile
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-xs">
                  {[
                    { label: 'Legal Name', value: vendor.legalName },
                    { label: 'Registration No.', value: vendor.registrationNo ?? '—' },
                    { label: 'Country', value: vendor.country ?? '—' },
                    { label: 'Category', value: vendor.category },
                    { label: 'Integration Type', value: vendor.integrationType ?? '—' },
                    { label: 'Contact', value: vendor.contact ?? '—' },
                    { label: 'Lifecycle State', value: vendor.lifecycleState.replace(/_/g, ' ') },
                    { label: 'Contract End', value: vendor.contractEnd ?? '—' },
                    { label: 'Last Assessed', value: vendor.lastAssessed },
                  ].map((row) => (
                    <div key={row.label}>
                      <p className="text-2xs text-muted-foreground mb-0.5">{row.label}</p>
                      <p className="font-medium text-foreground font-mono-data text-xs">{row.value}</p>
                    </div>
                  ))}
                </div>
                {vendor.dataAccess && vendor.dataAccess.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-2xs text-muted-foreground mb-1.5">Data Access Scope</p>
                    <div className="flex flex-wrap gap-1.5">
                      {vendor.dataAccess.map((d) => (
                        <span key={d} className="text-2xs font-mono-data px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">
                          {d.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick summary of latest assessment */}
              <div className="card-elevated p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-primary" /> Latest Assessment Summary
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Date: <span className="text-foreground font-mono-data">{riskHistory[0]?.date}</span></span>
                  <ChevronRight size={12} />
                  <span>Event: <span className="text-foreground">{riskHistory[0]?.event}</span></span>
                  <ChevronRight size={12} />
                  <span>Assessor: <span className="text-foreground">{riskHistory[0]?.assessor}</span></span>
                </div>
                <div className="mt-3 flex items-center gap-2">
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

          {/* RISK ASSESSMENT HISTORY */}
          {activeTab === 'assessments' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Full assessment history for <span className="text-foreground font-medium">{vendor.legalName}</span></p>
              <div className="space-y-2">
                {riskHistory.map((h, i) => (
                  <div key={`hist-${i}`} className="card-elevated p-4 flex items-start gap-4">
                    {/* Timeline dot */}
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
                          <span className="text-2xs text-status-low bg-status-low/10 border border-status-low/30 px-1.5 py-0.5 rounded font-medium">
                            {h.status}
                          </span>
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

          {/* CONTROL GAPS */}
          {activeTab === 'gaps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{controlGaps.length} control gaps identified — {openGaps} open</p>
                <div className="flex items-center gap-2 text-2xs">
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
                          <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded border ${severityColor[gap.severity] ?? ''}`}>
                            {gap.severity}
                          </span>
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

          {/* REMEDIATION TICKETS */}
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
                            <span className={`text-2xs font-bold ${priorityColor[ticket.priority] ?? ''}`}>{ticket.priority}</span>
                          </div>
                          <p className="text-xs font-medium text-foreground mt-0.5">{ticket.title}</p>
                          <p className="text-2xs text-muted-foreground mt-1">Assignee: {ticket.assignee}</p>
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

          {/* COMPLIANCE QUESTIONNAIRE */}
          {activeTab === 'questionnaire' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {compliantResponses}/{questionnaireResponses.length} responses compliant
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${vendor.compliancePct >= 80 ? 'bg-status-low' : vendor.compliancePct >= 60 ? 'bg-status-medium' : 'bg-status-high'}`}
                      style={{ width: `${(compliantResponses / questionnaireResponses.length) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono-data text-xs text-foreground">
                    {Math.round((compliantResponses / questionnaireResponses.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Group by section */}
              {Array.from(new Set(questionnaireResponses.map((q) => q.section))).map((section) => (
                <div key={section} className="card-elevated overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                    <p className="text-xs font-semibold text-foreground">{section}</p>
                  </div>
                  <div className="divide-y divide-border/50">
                    {questionnaireResponses.filter((q) => q.section === section).map((q, i) => (
                      <div key={`q-${section}-${i}`} className="px-4 py-3 flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {q.compliant ? (
                            <CheckCircle2 size={14} className="text-status-low" />
                          ) : (
                            <XCircle size={14} className="text-status-critical" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground">{q.question}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded border ${q.compliant ? 'text-status-low bg-status-low/10 border-status-low/30' : 'text-status-critical bg-status-critical/10 border-status-critical/30'}`}>
                              {q.response}
                            </span>
                            <span className="text-2xs text-muted-foreground italic">{q.evidence}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
