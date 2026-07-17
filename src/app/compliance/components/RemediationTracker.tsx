'use client';

import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle2, ChevronDown, ChevronRight, Building2, Calendar, User, ArrowRight, ShieldCheck } from 'lucide-react';

interface RemediationItem {
  id: string;
  vendor: string;
  framework: string;
  control: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';
  owner: string;
  dueDate: string;
  openedDate: string;
  description: string;
  progress: number;
  daysOverdue?: number;
}

const REMEDIATIONS: RemediationItem[] = [
  { id: 'REM-2026-024', vendor: 'Huawei Technologies', framework: 'ISO 27001', control: 'A.12.6.1 – Patch Management', severity: 'CRITICAL', status: 'IN_PROGRESS', owner: 'Chidi Okonkwo', dueDate: '2026-07-25', openedDate: '2026-07-01', description: 'Critical firmware vulnerabilities unpatched across 14 network devices. Vendor must provide patch schedule and evidence of remediation.', progress: 35 },
  { id: 'REM-2026-023', vendor: 'Flutterwave Inc.', framework: 'NDPR', control: 'Art. 2.1 – Data Subject Rights', severity: 'CRITICAL', status: 'OPEN', owner: 'Ngozi Adeyemi', dueDate: '2026-07-20', openedDate: '2026-06-28', description: 'No documented process for handling data subject access requests. NDPR compliance requires formal DSAR procedure within 72 hours.', progress: 0, daysOverdue: 3 },
  { id: 'REM-2026-022', vendor: 'Flutterwave Inc.', framework: 'PCI-DSS', control: 'Req. 8.3 – MFA for Admin Access', severity: 'HIGH', status: 'IN_PROGRESS', owner: 'Ngozi Adeyemi', dueDate: '2026-08-01', openedDate: '2026-07-05', description: 'Multi-factor authentication not enforced for all administrative access to cardholder data environment. Partial rollout in progress.', progress: 60 },
  { id: 'REM-2026-021', vendor: 'Interswitch Group', framework: 'CBN TPRMF', control: 'Sec. 4.2 – Incident Response Plan', severity: 'HIGH', status: 'PENDING_REVIEW', owner: 'Olumide Fashola', dueDate: '2026-07-30', openedDate: '2026-06-15', description: 'Incident response plan does not meet CBN TPRMF minimum requirements. Updated IRP submitted for review.', progress: 90 },
  { id: 'REM-2026-020', vendor: 'MTN Nigeria', framework: 'NIST CSF', control: 'PR.AC-4 – Access Permissions', severity: 'MEDIUM', status: 'IN_PROGRESS', owner: 'Fatima Aliyu', dueDate: '2026-08-15', openedDate: '2026-07-01', description: 'Privileged access management controls require strengthening. Least-privilege review underway for 340 accounts.', progress: 55 },
  { id: 'REM-2026-019', vendor: 'Huawei Technologies', framework: 'NIST CSF', control: 'DE.CM-7 – Monitoring for Unauthorized Activity', severity: 'CRITICAL', status: 'OPEN', owner: 'Chidi Okonkwo', dueDate: '2026-07-31', openedDate: '2026-07-08', description: 'No SIEM integration or centralized log monitoring. Unauthorized activity detection capability absent.', progress: 10 },
  { id: 'REM-2026-018', vendor: 'Interswitch Group', framework: 'ISO 27001', control: 'A.9.4.2 – Secure Log-on Procedures', severity: 'MEDIUM', status: 'CLOSED', owner: 'Olumide Fashola', dueDate: '2026-06-30', openedDate: '2026-05-20', description: 'Secure log-on procedures implemented and verified. Evidence of MFA rollout provided.', progress: 100 },
  { id: 'REM-2026-017', vendor: 'Paystack (Stripe)', framework: 'PCI-DSS', control: 'Req. 6.4 – Web Application Firewall', severity: 'MEDIUM', status: 'CLOSED', owner: 'Olumide Fashola', dueDate: '2026-06-15', openedDate: '2026-05-01', description: 'WAF deployed and configured for all public-facing payment endpoints. Penetration test evidence provided.', progress: 100 },
];

const severityConfig: Record<RemediationItem['severity'], { cls: string; dot: string }> = {
  CRITICAL: { cls: 'text-status-critical bg-status-critical/10 border-status-critical/30', dot: 'bg-status-critical' },
  HIGH: { cls: 'text-status-high bg-status-high/10 border-status-high/30', dot: 'bg-status-high' },
  MEDIUM: { cls: 'text-status-medium bg-status-medium/10 border-status-medium/20', dot: 'bg-status-medium' },
  LOW: { cls: 'text-status-low bg-status-low/10 border-status-low/20', dot: 'bg-status-low' },
};

const statusConfig: Record<RemediationItem['status'], { label: string; cls: string; icon: React.ReactNode }> = {
  OPEN: { label: 'Open', cls: 'text-status-critical bg-status-critical/10 border-status-critical/30', icon: <AlertTriangle size={11} /> },
  IN_PROGRESS: { label: 'In Progress', cls: 'text-status-info bg-status-info/10 border-status-info/30', icon: <Clock size={11} /> },
  PENDING_REVIEW: { label: 'Pending Review', cls: 'text-status-medium bg-status-medium/10 border-status-medium/20', icon: <ArrowRight size={11} /> },
  CLOSED: { label: 'Closed', cls: 'text-status-low bg-status-low/10 border-status-low/20', icon: <CheckCircle2 size={11} /> },
};

const progressColor = (p: number) => {
  if (p >= 80) return 'bg-status-low';
  if (p >= 50) return 'bg-status-medium';
  if (p >= 20) return 'bg-status-high';
  return 'bg-status-critical';
};

interface RemediationTrackerProps {
  canClose?: boolean;
}

export default function RemediationTracker({ canClose = false }: RemediationTrackerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = REMEDIATIONS.filter((r) => {
    if (statusFilter === 'open') return r.status === 'OPEN';
    if (statusFilter === 'in_progress') return r.status === 'IN_PROGRESS';
    if (statusFilter === 'pending') return r.status === 'PENDING_REVIEW';
    if (statusFilter === 'closed') return r.status === 'CLOSED';
    return true;
  });

  const openCount = REMEDIATIONS.filter((r) => r.status === 'OPEN').length;
  const inProgCount = REMEDIATIONS.filter((r) => r.status === 'IN_PROGRESS').length;
  const criticalOpen = REMEDIATIONS.filter((r) => r.severity === 'CRITICAL' && r.status !== 'CLOSED').length;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Remediation Tracker</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="text-status-critical font-mono-data">{criticalOpen} critical</span>
              {' · '}
              <span className="text-status-info font-mono-data">{inProgCount} in progress</span>
              {' · '}
              <span className="text-muted-foreground font-mono-data">{openCount} open</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'closed', label: 'Closed' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors duration-100 ${
                statusFilter === f.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {filtered.map((item) => {
          const sc = severityConfig[item.severity];
          const stc = statusConfig[item.status];
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id} className="transition-colors duration-100">
              <div
                className="px-5 py-3.5 hover:bg-muted/20 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${sc.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono-data text-muted-foreground">{item.id}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-2xs font-semibold ${sc.cls}`}>
                        {item.severity}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-2xs font-semibold ${stc.cls}`}>
                        {stc.icon}{stc.label}
                      </span>
                      {item.daysOverdue && (
                        <span className="text-2xs text-status-critical font-mono-data">{item.daysOverdue}d overdue</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Building2 size={11} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{item.vendor}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{item.framework}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{item.control}</div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1 max-w-48">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-2xs text-muted-foreground">Progress</span>
                          <span className="text-2xs font-mono-data text-foreground">{item.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${progressColor(item.progress)}`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User size={10} />{item.owner}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} />Due {item.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-muted-foreground mt-1">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="px-5 pb-4 bg-muted/10 border-t border-border/30">
                  <div className="pt-3 pl-5">
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Opened: <span className="text-foreground font-mono-data">{item.openedDate}</span></span>
                      <span>Due: <span className={`font-mono-data ${item.daysOverdue ? 'text-status-critical' : 'text-foreground'}`}>{item.dueDate}</span></span>
                      <span>Owner: <span className="text-foreground">{item.owner}</span></span>
                    </div>
                    {/* Close/Approve remediation — restricted to Risk Officer / Admin */}
                    {canClose && item.status !== 'CLOSED' && (
                      <div className="mt-3 flex items-center gap-2">
                        {item.status === 'PENDING_REVIEW' && (
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-status-low/10 border border-status-low/30 text-xs font-semibold text-status-low hover:bg-status-low/20 transition-colors">
                            <ShieldCheck size={12} />
                            Approve &amp; Close
                          </button>
                        )}
                        {item.status !== 'PENDING_REVIEW' && (
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                            <ArrowRight size={12} />
                            Mark Pending Review
                          </button>
                        )}
                      </div>
                    )}
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
