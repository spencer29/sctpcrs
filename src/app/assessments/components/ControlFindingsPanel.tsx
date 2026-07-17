'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Clock, AlertTriangle, Filter, ChevronDown } from 'lucide-react';

export interface ControlFinding {
  id: string;
  assessmentId: string;
  vendorName: string;
  control: string;
  framework: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_REMEDIATION' | 'CLOSED' | 'ACCEPTED';
  identified: string;
  dueDate: string;
  owner: string;
  description: string;
  recommendation: string;
}

const MOCK_FINDINGS: ControlFinding[] = [
  { id: 'CF-2026-001', assessmentId: 'ASM-2026-007', vendorName: 'Interswitch Group', control: 'MFA Enforcement', framework: 'ISO 27001 A.9.4', severity: 'CRITICAL', status: 'OPEN', identified: '2026-07-14', dueDate: '2026-07-28', owner: 'Vendor IT', description: 'Multi-factor authentication not enforced for privileged admin accounts on core banking integration portal.', recommendation: 'Deploy TOTP or hardware token MFA for all accounts with elevated privileges within 14 days.' },
  { id: 'CF-2026-002', assessmentId: 'ASM-2026-007', vendorName: 'Interswitch Group', control: 'Data Encryption at Rest', framework: 'NDPR §2.1', severity: 'HIGH', status: 'IN_REMEDIATION', identified: '2026-06-01', dueDate: '2026-08-01', owner: 'Vendor Security', description: 'PII data stores on legacy systems lack AES-256 encryption at rest.', recommendation: 'Migrate legacy data stores to encrypted volumes; provide encryption attestation report.' },
  { id: 'CF-2026-003', assessmentId: 'ASM-2026-006', vendorName: 'Flutterwave Inc.', control: 'Penetration Testing (Annual)', framework: 'PCI-DSS 11.3', severity: 'HIGH', status: 'OPEN', identified: '2026-05-20', dueDate: '2026-06-30', owner: 'Vendor CISO', description: 'Annual penetration test overdue by 47 days. No evidence of testing submitted.', recommendation: 'Engage accredited pen-test firm and submit report within 30 days.' },
  { id: 'CF-2026-004', assessmentId: 'ASM-2026-005', vendorName: 'MTN Nigeria', control: 'Third-Party Audit Report', framework: 'SOC 2 Type II', severity: 'HIGH', status: 'OPEN', identified: '2026-07-01', dueDate: '2026-09-01', owner: 'Compliance Team', description: 'SOC 2 Type II report not provided for current audit period. Previous report expired 2026-03.', recommendation: 'Obtain current SOC 2 Type II report from auditor and share with risk team.' },
  { id: 'CF-2026-005', assessmentId: 'ASM-2026-005', vendorName: 'MTN Nigeria', control: 'Incident Response Plan', framework: 'ISO 27001 A.16', severity: 'MEDIUM', status: 'CLOSED', identified: '2026-03-15', dueDate: '2026-04-30', owner: 'Vendor Ops', description: 'IRP lacked NDPR-specific breach notification procedures.', recommendation: 'Update IRP to include 72-hour NDPR notification SOP. Completed 2026-04-28.' },
  { id: 'CF-2026-006', assessmentId: 'ASM-2026-004', vendorName: 'Huawei Technologies', control: 'Supply Chain Security', framework: 'NIST CSF ID.SC-4', severity: 'CRITICAL', status: 'OPEN', identified: '2026-07-10', dueDate: '2026-07-31', owner: 'Risk Team', description: 'No evidence of security assessments conducted on Huawei sub-suppliers providing firmware components.', recommendation: 'Require Huawei to submit sub-supplier security attestations and conduct spot audits.' },
  { id: 'CF-2026-007', assessmentId: 'ASM-2026-003', vendorName: 'Paystack (Stripe)', control: 'Vulnerability Patch SLA', framework: 'PCI-DSS 6.3', severity: 'MEDIUM', status: 'IN_REMEDIATION', identified: '2026-06-15', dueDate: '2026-07-15', owner: 'Vendor DevSecOps', description: 'Critical CVE patches applied beyond 72-hour SLA in 22% of cases in H1 2026.', recommendation: 'Implement automated patch deployment pipeline; report monthly SLA compliance metrics.' },
  { id: 'CF-2026-008', assessmentId: 'ASM-2026-002', vendorName: 'Oracle Financial', control: 'Access Recertification', framework: 'ISO 27001 A.9.2', severity: 'LOW', status: 'ACCEPTED', identified: '2026-04-10', dueDate: '2026-05-10', owner: 'Vendor IAM', description: 'Quarterly access recertification delayed by 12 days due to system migration.', recommendation: 'Risk accepted with compensating control: manual review completed and documented.' },
];

const severityConfig: Record<string, string> = {
  CRITICAL: 'text-status-critical bg-status-critical/10 border-status-critical/30',
  HIGH: 'text-status-high bg-status-high/10 border-status-high/30',
  MEDIUM: 'text-status-medium bg-status-medium/10 border-status-medium/30',
  LOW: 'text-status-low bg-status-low/10 border-status-low/30',
};

const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  OPEN: { label: 'Open', cls: 'text-status-high bg-status-high/10 border-status-high/30', icon: <AlertTriangle size={12} /> },
  IN_REMEDIATION: { label: 'In Remediation', cls: 'text-status-medium bg-status-medium/10 border-status-medium/30', icon: <Clock size={12} /> },
  CLOSED: { label: 'Closed', cls: 'text-status-low bg-status-low/10 border-status-low/30', icon: <CheckCircle2 size={12} /> },
  ACCEPTED: { label: 'Risk Accepted', cls: 'text-muted-foreground bg-muted border-border', icon: <ShieldAlert size={12} /> },
};

interface ControlFindingsPanelProps {
  filterVendor?: string;
}

export default function ControlFindingsPanel({ filterVendor }: ControlFindingsPanelProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  const findings = MOCK_FINDINGS.filter((f) => {
    if (filterVendor && f.vendorName !== filterVendor) return false;
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    CRITICAL: MOCK_FINDINGS.filter((f) => f.severity === 'CRITICAL' && f.status !== 'CLOSED').length,
    HIGH: MOCK_FINDINGS.filter((f) => f.severity === 'HIGH' && f.status !== 'CLOSED').length,
    MEDIUM: MOCK_FINDINGS.filter((f) => f.severity === 'MEDIUM' && f.status !== 'CLOSED').length,
    OPEN: MOCK_FINDINGS.filter((f) => f.status === 'OPEN').length,
    IN_REMEDIATION: MOCK_FINDINGS.filter((f) => f.status === 'IN_REMEDIATION').length,
  };

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Critical Open', value: counts.CRITICAL, cls: 'text-status-critical border-status-critical/30 bg-status-critical/5' },
          { label: 'High Open', value: counts.HIGH, cls: 'text-status-high border-status-high/30 bg-status-high/5' },
          { label: 'Medium Open', value: counts.MEDIUM, cls: 'text-status-medium border-status-medium/30 bg-status-medium/5' },
          { label: 'In Remediation', value: counts.IN_REMEDIATION, cls: 'text-status-info border-status-info/30 bg-status-info/5' },
          { label: 'Total Findings', value: MOCK_FINDINGS.length, cls: 'text-foreground border-border bg-muted/50' },
        ].map((m) => (
          <div key={m.label} className={`border rounded-lg p-3 text-center ${m.cls}`}>
            <p className="text-xl font-bold font-mono-data">{m.value}</p>
            <p className="text-2xs text-muted-foreground mt-0.5 uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter size={13} />
          <span>Filter:</span>
        </div>
        <div className="flex gap-1.5">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150 ${
                severityFilter === s
                  ? 'bg-primary/20 border-primary text-primary' :'bg-muted border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'ALL' ? 'All Severity' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {['ALL', 'OPEN', 'IN_REMEDIATION', 'CLOSED', 'ACCEPTED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150 ${
                statusFilter === s
                  ? 'bg-primary/20 border-primary text-primary' :'bg-muted border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'ALL' ? 'All Status' : s === 'IN_REMEDIATION' ? 'In Remediation' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground font-mono-data">{findings.length} findings</span>
      </div>

      {/* Findings list */}
      <div className="space-y-2">
        {findings.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">No findings match the current filters.</div>
        )}
        {findings.map((f) => {
          const sc = statusConfig[f.status];
          const isOpen = expanded === f.id;
          return (
            <div key={f.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : f.id)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/40 transition-colors text-left"
              >
                <div className="flex-1 min-w-0 grid grid-cols-12 gap-3 items-center">
                  <span className="col-span-2 text-xs font-mono-data text-muted-foreground">{f.id}</span>
                  <span className="col-span-3 text-sm font-medium text-foreground truncate">{f.control}</span>
                  <span className="col-span-2 text-xs text-muted-foreground truncate">{f.vendorName}</span>
                  <span className="col-span-1 text-xs font-mono-data text-muted-foreground">{f.identified}</span>
                  <span className={`col-span-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium border w-fit ${severityConfig[f.severity]}`}>
                    {f.severity}
                  </span>
                  <span className={`col-span-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium border w-fit ${sc.cls}`}>
                    {sc.icon}{sc.label}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 py-4 bg-background/60 border-t border-border space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xs text-muted-foreground uppercase tracking-wider mb-1">Framework / Control</p>
                      <p className="text-sm text-foreground">{f.framework}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-muted-foreground uppercase tracking-wider mb-1">Owner</p>
                      <p className="text-sm text-foreground">{f.owner}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-muted-foreground uppercase tracking-wider mb-1">Assessment ID</p>
                      <p className="text-sm font-mono-data text-primary">{f.assessmentId}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-muted-foreground uppercase tracking-wider mb-1">Due Date</p>
                      <p className={`text-sm font-mono-data ${new Date(f.dueDate) < new Date() && f.status === 'OPEN' ? 'text-status-critical' : 'text-foreground'}`}>{f.dueDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xs text-muted-foreground uppercase tracking-wider mb-1">Finding Description</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{f.description}</p>
                  </div>
                  <div>
                    <p className="text-2xs text-muted-foreground uppercase tracking-wider mb-1">Recommendation</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{f.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
