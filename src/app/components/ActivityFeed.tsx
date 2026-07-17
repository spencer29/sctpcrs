import React from 'react';
import { Building2, ShieldCheck, AlertTriangle, FileText, Activity, GitBranch, Clock } from 'lucide-react';

// Backend integration point: GET /api/v1/vendors/activity?limit=8
const activities = [
  {
    id: 'act-001',
    type: 'kev_alert',
    text: 'KEV alert triggered for Paystack Integration Ltd',
    time: '14m ago',
    icon: <AlertTriangle size={13} />,
    color: 'text-status-critical bg-status-critical/20',
  },
  {
    id: 'act-002',
    type: 'vrs_spike',
    text: 'VRS re-scored: Interswitch Cloud +18 pts → 79',
    time: '2h ago',
    icon: <Activity size={13} />,
    color: 'text-status-high bg-status-high/20',
  },
  {
    id: 'act-003',
    type: 'sbom_submitted',
    text: 'SBOM submitted by CloudPay Africa Ltd (CycloneDX)',
    time: '3h ago',
    icon: <GitBranch size={13} />,
    color: 'text-status-info bg-status-info/20',
  },
  {
    id: 'act-004',
    type: 'questionnaire',
    text: 'Questionnaire reviewed: Unified Payments Ltd — APPROVED',
    time: '5h ago',
    icon: <FileText size={13} />,
    color: 'text-status-low bg-status-low/20',
  },
  {
    id: 'act-005',
    type: 'vendor_active',
    text: 'Vendor onboarded: FinEdge Analytics → ACTIVE',
    time: '8h ago',
    icon: <Building2 size={13} />,
    color: 'text-status-low bg-status-low/20',
  },
  {
    id: 'act-006',
    type: 'compliance',
    text: 'CBN control CBN-TPRM-04 evidenced: GTCo Digital',
    time: '1d ago',
    icon: <ShieldCheck size={13} />,
    color: 'text-primary bg-primary/20',
  },
  {
    id: 'act-007',
    type: 'cert_expiry',
    text: 'ISO 27001 cert expiry alert: RemitaNet (28d)',
    time: '1d ago',
    icon: <AlertTriangle size={13} />,
    color: 'text-status-medium bg-status-medium/20',
  },
  {
    id: 'act-008',
    type: 'incident',
    text: 'Incident #INC-2024-014 closed — VRS updated',
    time: '2d ago',
    icon: <AlertTriangle size={13} />,
    color: 'text-muted-foreground bg-muted',
  },
];

export default function ActivityFeed() {
  return (
    <div className="card-elevated p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">System Activity</h3>
        <button className="text-2xs text-primary hover:text-primary/80 font-medium transition-colors">
          Full log →
        </button>
      </div>
      <div className="space-y-3 overflow-y-auto">
        {activities?.map((act) => (
          <div key={act?.id} className="flex items-start gap-2.5 group">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${act?.color}`}>
              {act?.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/80 leading-snug">{act?.text}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock size={9} className="text-muted-foreground" />
                <span className="text-2xs font-mono-data text-muted-foreground">{act?.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}