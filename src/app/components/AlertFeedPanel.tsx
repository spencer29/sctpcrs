'use client';

import React, { useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';

// Backend integration point: GET /api/v1/monitoring/alerts?status=unacknowledged&limit=8
const alerts = [
  {
    id: 'alert-001',
    severity: 'CRITICAL' as const,
    title: 'KEV CVE-2024-3094 in Paystack Integration SBOM',
    vendor: 'Paystack Integration Ltd',
    time: '14m ago',
    type: 'KEV_MATCH',
    acked: false,
  },
  {
    id: 'alert-002',
    severity: 'CRITICAL' as const,
    title: 'KEV CVE-2024-3094 in Flutterwave SDK SBOM',
    vendor: 'Flutterwave SDK Services',
    time: '14m ago',
    type: 'KEV_MATCH',
    acked: false,
  },
  {
    id: 'alert-003',
    severity: 'HIGH' as const,
    title: 'VRS increased +18 pts — Interswitch Cloud',
    vendor: 'Interswitch Cloud Services',
    time: '2h ago',
    type: 'VRS_SPIKE',
    acked: false,
  },
  {
    id: 'alert-004',
    severity: 'HIGH' as const,
    title: 'ISO 27001 cert expiry in 28 days',
    vendor: 'RemitaNet Technologies',
    time: '4h ago',
    type: 'CERT_EXPIRY',
    acked: false,
  },
  {
    id: 'alert-005',
    severity: 'HIGH' as const,
    title: 'Questionnaire overdue — 9 days past due',
    vendor: 'GTCo Digital Labs',
    time: '1d ago',
    type: 'QUESTIONNAIRE_OVERDUE',
    acked: false,
  },
  {
    id: 'alert-006',
    severity: 'MEDIUM' as const,
    title: 'PCI DSS AOC expiry in 47 days',
    vendor: 'Unified Payments Ltd',
    time: '6h ago',
    type: 'CERT_EXPIRY',
    acked: false,
  },
  {
    id: 'alert-007',
    severity: 'MEDIUM' as const,
    title: 'New CVE-2024-21626 (CVSS 8.6) in vendor SBOM',
    vendor: 'CloudPay Africa Ltd',
    time: '8h ago',
    type: 'CVE_MATCH',
    acked: false,
  },
  {
    id: 'alert-008',
    severity: 'LOW' as const,
    title: 'External posture score degraded 3 pts',
    vendor: 'FinEdge Analytics',
    time: '1d ago',
    type: 'POSTURE_CHANGE',
    acked: true,
  },
];

const severityConfig = {
  CRITICAL: { label: 'CRIT', class: 'badge-critical', dot: 'bg-status-critical alert-pulse' },
  HIGH: { label: 'HIGH', class: 'badge-high', dot: 'bg-status-high' },
  MEDIUM: { label: 'MED', class: 'badge-medium', dot: 'bg-status-medium' },
  LOW: { label: 'LOW', class: 'badge-low', dot: 'bg-status-low' },
};

export default function AlertFeedPanel() {
  const [acknowledged, setAcknowledged] = useState<Set<string>>(
    new Set(alerts.filter((a) => a.acked).map((a) => a.id))
  );

  const handleAck = (id: string) => {
    setAcknowledged((prev) => new Set([...prev, id]));
  };

  const unackedCount = alerts.filter((a) => !acknowledged.has(a.id)).length;

  return (
    <div className="card-elevated p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
          <span className="text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded-full bg-status-critical text-white">
            {unackedCount}
          </span>
        </div>
        <button className="text-2xs text-primary hover:text-primary/80 font-medium transition-colors">
          View All →
        </button>
      </div>

      <div className="space-y-1 overflow-y-auto max-h-[280px]">
        {alerts.map((alert) => {
          const cfg = severityConfig[alert.severity];
          const isAcked = acknowledged.has(alert.id);

          return (
            <div
              key={alert.id}
              className={`flex items-start gap-2.5 p-2.5 rounded-md transition-all duration-150 group ${
                isAcked ? 'opacity-50' : 'hover:bg-muted/50 cursor-pointer'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className={`text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${cfg.class}`}>
                    {cfg.label}
                  </span>
                  <p className={`text-xs leading-snug truncate flex-1 ${isAcked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {alert.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xs text-muted-foreground truncate">{alert.vendor}</span>
                  <span className="text-2xs text-muted-foreground">·</span>
                  <span className="text-2xs font-mono-data text-muted-foreground flex items-center gap-0.5">
                    <Clock size={9} />
                    {alert.time}
                  </span>
                </div>
              </div>
              {!isAcked && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleAck(alert.id); }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-muted-foreground hover:text-status-low hover:bg-status-low/10"
                  title="Acknowledge alert"
                >
                  <CheckCircle size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}