'use client';

import React, { useState, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  AlertTriangle,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Square,
  CheckSquare,
  MinusSquare,
  Filter,
  Zap,
  FileText,
} from 'lucide-react';

export interface Alert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'KEV_MATCH' | 'COMPLIANCE' | 'CVE_MATCH' | 'CERT_EXPIRY' | 'VRS_SPIKE' | 'QUESTIONNAIRE_OVERDUE';
  title: string;
  vendor: string;
  time: string;
  status: 'active' | 'acknowledged' | 'dismissed' | 'escalated';
  cveId?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'acknowledged' | 'dismissed' | 'escalated';
  actor: string;
  alertIds: string[];
  alertCount: number;
  note: string;
  alerts: { id: string; title: string; vendor: string }[];
}

const INITIAL_ALERTS: Alert[] = [
  { id: 'alrt-001', severity: 'CRITICAL', type: 'KEV_MATCH', title: 'KEV CVE-2024-3094 — XZ Utils Backdoor in Paystack SBOM', vendor: 'Paystack Integration Ltd', time: '14m ago', status: 'active', cveId: 'CVE-2024-3094' },
  { id: 'alrt-002', severity: 'CRITICAL', type: 'KEV_MATCH', title: 'KEV CVE-2024-3094 — XZ Utils Backdoor in Flutterwave SDK', vendor: 'Flutterwave SDK Services', time: '14m ago', status: 'active', cveId: 'CVE-2024-3094' },
  { id: 'alrt-003', severity: 'CRITICAL', type: 'KEV_MATCH', title: 'KEV CVE-2024-21762 — Fortinet SSL-VPN in CloudPay SBOM', vendor: 'CloudPay Africa Ltd', time: '1h ago', status: 'active', cveId: 'CVE-2024-21762' },
  { id: 'alrt-004', severity: 'HIGH', type: 'COMPLIANCE', title: 'ISO 27001 certification expiry in 28 days', vendor: 'RemitaNet Technologies', time: '4h ago', status: 'active' },
  { id: 'alrt-005', severity: 'HIGH', type: 'COMPLIANCE', title: 'PCI DSS AOC renewal overdue — 12 days past deadline', vendor: 'GTCo Digital Labs', time: '1d ago', status: 'active' },
  { id: 'alrt-006', severity: 'HIGH', type: 'CVE_MATCH', title: 'CVE-2024-21626 (CVSS 8.6) — runc container escape in vendor SBOM', vendor: 'CloudPay Africa Ltd', time: '8h ago', status: 'active', cveId: 'CVE-2024-21626' },
  { id: 'alrt-007', severity: 'HIGH', type: 'COMPLIANCE', title: 'SOC 2 Type II report expired — 3 months overdue', vendor: 'Interswitch Cloud Services', time: '2d ago', status: 'active' },
  { id: 'alrt-008', severity: 'MEDIUM', type: 'CERT_EXPIRY', title: 'PCI DSS AOC expiry in 47 days', vendor: 'Unified Payments Ltd', time: '6h ago', status: 'active' },
  { id: 'alrt-009', severity: 'MEDIUM', type: 'VRS_SPIKE', title: 'VRS increased +18 pts — external posture degradation', vendor: 'Interswitch Cloud Services', time: '2h ago', status: 'active' },
  { id: 'alrt-010', severity: 'MEDIUM', type: 'QUESTIONNAIRE_OVERDUE', title: 'Security questionnaire overdue — 9 days past due', vendor: 'GTCo Digital Labs', time: '1d ago', status: 'active' },
];

const severityConfig = {
  CRITICAL: { dot: 'bg-status-critical alert-pulse', badge: 'bg-status-critical/10 text-status-critical border-status-critical/30', label: 'CRIT' },
  HIGH: { dot: 'bg-status-high', badge: 'bg-status-high/10 text-status-high border-status-high/30', label: 'HIGH' },
  MEDIUM: { dot: 'bg-status-medium', badge: 'bg-status-medium/10 text-status-medium border-status-medium/30', label: 'MED' },
  LOW: { dot: 'bg-status-low', badge: 'bg-status-low/10 text-status-low border-status-low/30', label: 'LOW' },
};

const typeConfig: Record<Alert['type'], { label: string; icon: React.ReactNode }> = {
  KEV_MATCH: { label: 'KEV', icon: <Zap size={10} /> },
  COMPLIANCE: { label: 'COMPLIANCE', icon: <Shield size={10} /> },
  CVE_MATCH: { label: 'CVE', icon: <AlertTriangle size={10} /> },
  CERT_EXPIRY: { label: 'CERT', icon: <FileText size={10} /> },
  VRS_SPIKE: { label: 'VRS', icon: <ArrowUpCircle size={10} /> },
  QUESTIONNAIRE_OVERDUE: { label: 'QUESTIONNAIRE', icon: <Clock size={10} /> },
};

const statusConfig = {
  active: { label: 'Active', cls: 'text-foreground' },
  acknowledged: { label: 'Acknowledged', cls: 'text-status-low line-through opacity-60' },
  dismissed: { label: 'Dismissed', cls: 'text-muted-foreground line-through opacity-50' },
  escalated: { label: 'Escalated', cls: 'text-status-high' },
};

interface BulkAlertActionsProps {
  onAuditEntry: (entry: AuditEntry) => void;
}

export default function BulkAlertActions({ onAuditEntry }: BulkAlertActionsProps) {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showActionModal, setShowActionModal] = useState<'acknowledge' | 'dismiss' | 'escalate' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const filteredAlerts = alerts.filter((a) => {
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchSev = severityFilter === 'all' || a.severity === severityFilter;
    return matchType && matchSev;
  });

  const filteredActive = filteredAlerts.filter((a) => a.status === 'active');
  const allActiveSelected = filteredActive.length > 0 && filteredActive.every((a) => selected.has(a.id));
  const someSelected = filteredActive.some((a) => selected.has(a.id));
  const selectedCount = selected.size;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allActiveSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredActive.forEach((a) => next.delete(a.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredActive.forEach((a) => next.add(a.id));
        return next;
      });
    }
  };

  const buildAuditEntry = useCallback(
    (action: 'acknowledged' | 'dismissed' | 'escalated', note: string): AuditEntry => {
      const affected = alerts.filter((a) => selected.has(a.id));
      const now = new Date();
      const ts = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
      return {
        id: `audit-${Date.now()}`,
        timestamp: ts,
        action,
        actor: 'Security Analyst',
        alertIds: affected.map((a) => a.id),
        alertCount: affected.length,
        note: note || `Bulk ${action} — no additional notes`,
        alerts: affected.map((a) => ({ id: a.id, title: a.title, vendor: a.vendor })),
      };
    },
    [alerts, selected]
  );

  const applyBulkAction = (action: 'acknowledged' | 'dismissed' | 'escalated') => {
    const entry = buildAuditEntry(action, actionNote);
    onAuditEntry(entry);
    setAlerts((prev) =>
      prev.map((a) => (selected.has(a.id) ? { ...a, status: action } : a))
    );
    setSelected(new Set());
    setActionNote('');
    setShowActionModal(null);
  };

  const actionMeta = {
    acknowledge: {
      label: 'Acknowledge',
      icon: <CheckCircle size={14} />,
      color: 'text-status-low',
      bg: 'bg-status-low/10 hover:bg-status-low/20 border-status-low/30 text-status-low',
      confirmBg: 'bg-status-low hover:bg-status-low/90',
      description: 'Mark selected alerts as reviewed and acknowledged.',
    },
    dismiss: {
      label: 'Dismiss',
      icon: <XCircle size={14} />,
      color: 'text-muted-foreground',
      bg: 'bg-muted/30 hover:bg-muted/50 border-border text-foreground',
      confirmBg: 'bg-muted hover:bg-muted/80',
      description: 'Dismiss selected alerts as non-actionable or false positives.',
    },
    escalate: {
      label: 'Escalate',
      icon: <ArrowUpCircle size={14} />,
      color: 'text-status-high',
      bg: 'bg-status-high/10 hover:bg-status-high/20 border-status-high/30 text-status-high',
      confirmBg: 'bg-status-high hover:bg-status-high/90',
      description: 'Escalate selected alerts to CISO / incident response team.',
    },
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-status-critical" />
          <h3 className="text-sm font-semibold text-foreground">KEV &amp; Compliance Alerts</h3>
          <span className="text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded-full bg-status-critical text-white">
            {activeAlerts.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Type filter */}
          <div className="relative">
            <Filter size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-muted/30 border border-border rounded-md pl-6 pr-2 py-1 text-2xs text-foreground focus:outline-none focus:border-primary/50 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="KEV_MATCH">KEV</option>
              <option value="COMPLIANCE">Compliance</option>
              <option value="CVE_MATCH">CVE</option>
              <option value="CERT_EXPIRY">Cert Expiry</option>
              <option value="VRS_SPIKE">VRS Spike</option>
            </select>
          </div>
          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-muted/30 border border-border rounded-md px-2 py-1 text-2xs text-foreground focus:outline-none focus:border-primary/50 appearance-none"
          >
            <option value="all">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Bulk action toolbar */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-border transition-all duration-200 ${selectedCount > 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/10'}`}>
        {/* Select all checkbox */}
        <button onClick={toggleSelectAll} className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
          {allActiveSelected ? (
            <CheckSquare size={15} className="text-primary" />
          ) : someSelected ? (
            <MinusSquare size={15} className="text-primary" />
          ) : (
            <Square size={15} />
          )}
        </button>
        {selectedCount > 0 ? (
          <>
            <span className="text-xs font-semibold text-primary">{selectedCount} alert{selectedCount !== 1 ? 's' : ''} selected</span>
            <div className="flex items-center gap-1.5 ml-2">
              {(['acknowledge', 'dismiss', 'escalate'] as const).map((action) => {
                const meta = actionMeta[action];
                return (
                  <button
                    key={action}
                    onClick={() => setShowActionModal(action)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-2xs font-semibold transition-all duration-150 ${meta.bg}`}
                  >
                    {meta.icon}
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto text-2xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </>
        ) : (
          <span className="text-2xs text-muted-foreground">Select alerts to perform bulk actions</span>
        )}
      </div>

      {/* Alert list */}
      <div className="divide-y divide-border max-h-[380px] overflow-y-auto">
        {filteredAlerts.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-xs text-muted-foreground">No alerts match your filters</p>
          </div>
        )}
        {filteredAlerts.map((alert) => {
          const sev = severityConfig[alert.severity];
          const typ = typeConfig[alert.type];
          const isActive = alert.status === 'active';
          const isSelected = selected.has(alert.id);
          const isExpanded = expandedId === alert.id;

          return (
            <div
              key={alert.id}
              className={`transition-all duration-150 ${isSelected ? 'bg-primary/5' : isActive ? 'hover:bg-muted/20' : 'opacity-60'}`}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                {/* Checkbox */}
                <button
                  onClick={() => isActive && toggleSelect(alert.id)}
                  disabled={!isActive}
                  className={`flex-shrink-0 mt-0.5 transition-colors ${isActive ? 'text-muted-foreground hover:text-primary cursor-pointer' : 'text-muted-foreground/30 cursor-default'}`}
                >
                  {isSelected ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} />}
                </button>

                {/* Severity dot */}
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${sev.dot}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 ${sev.badge}`}>
                      {sev.label}
                    </span>
                    <span className="flex items-center gap-0.5 text-2xs font-semibold px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border flex-shrink-0">
                      {typ.icon}
                      <span className="ml-0.5">{typ.label}</span>
                    </span>
                    <p className={`text-xs leading-snug flex-1 ${statusConfig[alert.status].cls}`}>
                      {alert.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-2xs text-muted-foreground">{alert.vendor}</span>
                    <span className="text-2xs text-muted-foreground">·</span>
                    <span className="text-2xs font-mono-data text-muted-foreground flex items-center gap-0.5">
                      <Clock size={9} /> {alert.time}
                    </span>
                    {alert.status !== 'active' && (
                      <>
                        <span className="text-2xs text-muted-foreground">·</span>
                        <span className={`text-2xs font-semibold ${
                          alert.status === 'acknowledged' ? 'text-status-low' :
                          alert.status === 'escalated' ? 'text-status-high' : 'text-muted-foreground'
                        }`}>
                          {statusConfig[alert.status].label}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Expand toggle */}
                {alert.cveId && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}
              </div>

              {/* Expanded CVE detail */}
              {isExpanded && alert.cveId && (
                <div className="mx-4 mb-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border text-2xs text-muted-foreground">
                  <span className="font-semibold text-foreground font-mono-data">{alert.cveId}</span>
                  {' '}— CISA KEV-listed vulnerability. Immediate remediation required per CBN TPRMF §4.2.
                  Affected vendor must provide patch confirmation within 4 hours.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action confirmation modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                showActionModal === 'acknowledge' ? 'bg-status-low/10' :
                showActionModal === 'escalate' ? 'bg-status-high/10' : 'bg-muted/30'
              }`}>
                {actionMeta[showActionModal].icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {actionMeta[showActionModal].label} {selectedCount} Alert{selectedCount !== 1 ? 's' : ''}
                </h3>
                <p className="text-2xs text-muted-foreground mt-0.5">
                  {actionMeta[showActionModal].description}
                </p>
              </div>
            </div>

            {/* Selected alert preview */}
            <div className="bg-muted/20 border border-border rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
              {alerts.filter((a) => selected.has(a.id)).map((a) => (
                <div key={a.id} className="flex items-center gap-2 py-1">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${severityConfig[a.severity].dot}`} />
                  <span className="text-2xs text-foreground truncate">{a.title}</span>
                </div>
              ))}
            </div>

            {/* Note input */}
            <div className="mb-4">
              <label className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Audit Note (optional)
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder={`Add a note for the audit trail...`}
                rows={3}
                className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowActionModal(null); setActionNote(''); }}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => applyBulkAction(
                  showActionModal === 'acknowledge' ? 'acknowledged' :
                  showActionModal === 'dismiss' ? 'dismissed' : 'escalated'
                )}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors ${actionMeta[showActionModal].confirmBg}`}
              >
                Confirm {actionMeta[showActionModal].label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
