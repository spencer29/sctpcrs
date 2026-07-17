'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
} from 'lucide-react';
import { AuditEntry } from './BulkAlertActions';

interface AuditTrailPanelProps {
  entries: AuditEntry[];
}

const actionConfig = {
  acknowledged: {
    label: 'Acknowledged',
    icon: <CheckCircle size={13} />,
    cls: 'text-status-low',
    bg: 'bg-status-low/10 border-status-low/30',
    dot: 'bg-status-low',
  },
  dismissed: {
    label: 'Dismissed',
    icon: <XCircle size={13} />,
    cls: 'text-muted-foreground',
    bg: 'bg-muted/20 border-border',
    dot: 'bg-muted-foreground',
  },
  escalated: {
    label: 'Escalated',
    icon: <ArrowUpCircle size={13} />,
    cls: 'text-status-high',
    bg: 'bg-status-high/10 border-status-high/30',
    dot: 'bg-status-high',
  },
};

const SAMPLE_ENTRIES: AuditEntry[] = [
  {
    id: 'audit-sample-1',
    timestamp: '2024-07-15 09:42',
    action: 'escalated',
    actor: 'Chidi Okonkwo',
    alertIds: ['alrt-001', 'alrt-002'],
    alertCount: 2,
    note: 'Escalated to CISO per CBN TPRMF §4.2 — critical KEV matches require immediate executive notification.',
    alerts: [
      { id: 'alrt-001', title: 'KEV CVE-2024-3094 — XZ Utils Backdoor in Paystack SBOM', vendor: 'Paystack Integration Ltd' },
      { id: 'alrt-002', title: 'KEV CVE-2024-3094 — XZ Utils Backdoor in Flutterwave SDK', vendor: 'Flutterwave SDK Services' },
    ],
  },
  {
    id: 'audit-sample-2',
    timestamp: '2024-07-14 17:30',
    action: 'acknowledged',
    actor: 'Amaka Eze',
    alertIds: ['alrt-004', 'alrt-005', 'alrt-007'],
    alertCount: 3,
    note: 'Acknowledged compliance cert expiry alerts. Renewal requests sent to respective vendors.',
    alerts: [
      { id: 'alrt-004', title: 'ISO 27001 certification expiry in 28 days', vendor: 'RemitaNet Technologies' },
      { id: 'alrt-005', title: 'PCI DSS AOC renewal overdue — 12 days past deadline', vendor: 'GTCo Digital Labs' },
      { id: 'alrt-007', title: 'SOC 2 Type II report expired — 3 months overdue', vendor: 'Interswitch Cloud Services' },
    ],
  },
  {
    id: 'audit-sample-3',
    timestamp: '2024-07-13 11:15',
    action: 'dismissed',
    actor: 'Security Analyst',
    alertIds: ['alrt-008'],
    alertCount: 1,
    note: 'PCI DSS AOC expiry in 47 days — vendor confirmed renewal in progress. Dismissed as non-urgent.',
    alerts: [
      { id: 'alrt-008', title: 'PCI DSS AOC expiry in 47 days', vendor: 'Unified Payments Ltd' },
    ],
  },
];

export default function AuditTrailPanel({ entries }: AuditTrailPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allEntries = [...entries, ...SAMPLE_ENTRIES];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield size={15} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Bulk Action Audit Trail</h3>
          <span className="text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded-full bg-muted/50 border border-border text-muted-foreground">
            {allEntries.length} entries
          </span>
        </div>
        <div className="flex items-center gap-1 text-2xs text-muted-foreground">
          <FileText size={11} />
          <span>Immutable log</span>
        </div>
      </div>

      {/* Empty state */}
      {allEntries.length === 0 && (
        <div className="p-10 text-center">
          <Shield size={24} className="text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No bulk actions recorded yet.</p>
          <p className="text-2xs text-muted-foreground mt-1">Select alerts above and perform a bulk action to create an audit entry.</p>
        </div>
      )}

      {/* Entries */}
      <div className="divide-y divide-border max-h-[340px] overflow-y-auto">
        {allEntries.map((entry, idx) => {
          const cfg = actionConfig[entry.action];
          const isExpanded = expandedId === entry.id;
          const isNew = idx < entries.length;

          return (
            <div key={entry.id} className={`transition-all duration-200 ${isNew ? 'bg-primary/5' : ''}`}>
              <div
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center flex-shrink-0 mt-1">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {idx < allEntries.length - 1 && <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1 text-2xs font-semibold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.cls}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    <span className="text-2xs font-semibold text-foreground">
                      {entry.alertCount} alert{entry.alertCount !== 1 ? 's' : ''}
                    </span>
                    {isNew && (
                      <span className="text-2xs font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-2xs text-muted-foreground mt-1 line-clamp-1">{entry.note}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                      <User size={9} /> {entry.actor}
                    </span>
                    <span className="flex items-center gap-1 text-2xs font-mono-data text-muted-foreground">
                      <Clock size={9} /> {entry.timestamp}
                    </span>
                  </div>
                </div>

                {/* Expand toggle */}
                <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1">
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="mx-4 mb-3 rounded-lg border border-border overflow-hidden">
                  {/* Note */}
                  <div className="px-3 py-2.5 bg-muted/20 border-b border-border">
                    <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Audit Note</p>
                    <p className="text-xs text-foreground">{entry.note}</p>
                  </div>
                  {/* Affected alerts */}
                  <div className="px-3 py-2.5">
                    <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Affected Alerts ({entry.alertCount})
                    </p>
                    <div className="space-y-1.5">
                      {entry.alerts.map((a) => (
                        <div key={a.id} className="flex items-start gap-2">
                          <span className="text-2xs font-mono-data text-muted-foreground flex-shrink-0 mt-0.5">{a.id}</span>
                          <div className="min-w-0">
                            <p className="text-2xs text-foreground leading-snug">{a.title}</p>
                            <p className="text-2xs text-muted-foreground">{a.vendor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Metadata footer */}
                  <div className="px-3 py-2 bg-muted/10 border-t border-border flex items-center gap-4">
                    <span className="text-2xs text-muted-foreground">
                      <span className="font-semibold">Actor:</span> {entry.actor}
                    </span>
                    <span className="text-2xs font-mono-data text-muted-foreground">
                      <span className="font-semibold">Time:</span> {entry.timestamp}
                    </span>
                    <span className="text-2xs font-mono-data text-muted-foreground">
                      <span className="font-semibold">Entry ID:</span> {entry.id}
                    </span>
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
