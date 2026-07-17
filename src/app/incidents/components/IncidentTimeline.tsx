'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MessageSquare,
  Shield,
  ArrowUpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'detected' | 'triaged' | 'escalated' | 'assigned' | 'update' | 'resolved' | 'comment';
  actor: string;
  title: string;
  detail?: string;
}

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  vendor: string;
  detectedAt: string;
  assignee: string;
  timeline: TimelineEvent[];
}

const INCIDENTS: Incident[] = [
  {
    id: 'INC-2024-001',
    title: 'Unauthorized API Access — Interswitch Gateway',
    severity: 'critical',
    status: 'investigating',
    vendor: 'Interswitch',
    detectedAt: '2024-07-15 09:14',
    assignee: 'Chidi Okonkwo',
    timeline: [
      { id: 't1', timestamp: '2024-07-15 09:14', type: 'detected', actor: 'System', title: 'Anomaly detected via KEV feed', detail: 'Unusual API call pattern flagged — 340 requests/min from unrecognized IP block 185.220.x.x' },
      { id: 't2', timestamp: '2024-07-15 09:22', type: 'triaged', actor: 'SOC Analyst', title: 'Incident triaged as Critical', detail: 'Confirmed unauthorized access attempt. Scope: payment gateway API. Potential data exposure risk.' },
      { id: 't3', timestamp: '2024-07-15 09:35', type: 'escalated', actor: 'Chidi Okonkwo', title: 'Escalated to CISO', detail: 'Escalation triggered per CBN TPRMF §4.2 — critical vendor incident protocol.' },
      { id: 't4', timestamp: '2024-07-15 09:40', type: 'assigned', actor: 'CISO', title: 'Assigned remediation task to Interswitch IR Team', detail: 'Task: Rotate API credentials, block IP range, provide access logs within 2h.' },
      { id: 't5', timestamp: '2024-07-15 11:05', type: 'update', actor: 'Interswitch IR', title: 'API credentials rotated', detail: 'New credentials issued. IP block applied at gateway level. Log extraction in progress.' },
      { id: 't6', timestamp: '2024-07-15 13:30', type: 'comment', actor: 'Chidi Okonkwo', title: 'Awaiting forensic log review', detail: 'Logs received. Forensic analysis underway to determine if data exfiltration occurred.' },
    ],
  },
  {
    id: 'INC-2024-002',
    title: 'SSL Certificate Expiry — NigeriaCloud Storage',
    severity: 'high',
    status: 'contained',
    vendor: 'NigeriaCloud',
    detectedAt: '2024-07-14 16:00',
    assignee: 'Amaka Eze',
    timeline: [
      { id: 't1', timestamp: '2024-07-14 16:00', type: 'detected', actor: 'System', title: 'SSL cert expiry alert triggered', detail: 'Certificate for storage.nigeriacloud.ng expired. TLS handshake failures reported.' },
      { id: 't2', timestamp: '2024-07-14 16:15', type: 'triaged', actor: 'Amaka Eze', title: 'Triaged as High — service degradation', detail: 'Downstream services affected: 3 internal integrations. No data breach confirmed.' },
      { id: 't3', timestamp: '2024-07-14 17:00', type: 'assigned', actor: 'Amaka Eze', title: 'Remediation task assigned to NigeriaCloud Ops', detail: 'Task: Renew and deploy SSL certificate within 1h SLA.' },
      { id: 't4', timestamp: '2024-07-14 17:45', type: 'resolved', actor: 'NigeriaCloud Ops', title: 'Certificate renewed and deployed', detail: 'New cert valid until 2025-07-14. All TLS handshakes restored. Incident contained.' },
    ],
  },
  {
    id: 'INC-2024-003',
    title: 'Phishing Campaign Targeting Vendor Employees',
    severity: 'high',
    status: 'open',
    vendor: 'Flutterwave',
    detectedAt: '2024-07-16 08:30',
    assignee: 'Unassigned',
    timeline: [
      { id: 't1', timestamp: '2024-07-16 08:30', type: 'detected', actor: 'Threat Intel Feed', title: 'Phishing domain registered mimicking vendor', detail: 'Domain flutterwav3.com registered 6h ago. Spoofed login page identified.' },
      { id: 't2', timestamp: '2024-07-16 09:00', type: 'triaged', actor: 'SOC Analyst', title: 'Triaged as High — credential theft risk', detail: 'Vendor employees may be targeted. Risk of compromised vendor admin credentials.' },
    ],
  },
  {
    id: 'INC-2024-004',
    title: 'Data Residency Violation — CloudSystems NG',
    severity: 'medium',
    status: 'investigating',
    vendor: 'CloudSystems NG',
    detectedAt: '2024-07-13 11:00',
    assignee: 'Tunde Adeyemi',
    timeline: [
      { id: 't1', timestamp: '2024-07-13 11:00', type: 'detected', actor: 'Compliance Scan', title: 'Data residency check failed', detail: 'Customer PII records detected in EU-West-1 region. NDPR requires Nigeria-only storage.' },
      { id: 't2', timestamp: '2024-07-13 11:30', type: 'triaged', actor: 'Tunde Adeyemi', title: 'Triaged as Medium — NDPR compliance gap', detail: 'No active breach. Residency misconfiguration. Regulatory notification may be required.' },
      { id: 't3', timestamp: '2024-07-13 12:00', type: 'assigned', actor: 'Tunde Adeyemi', title: 'Remediation task: migrate data to NG region', detail: 'Deadline: 72h per NDPR incident response guidelines.' },
    ],
  },
  {
    id: 'INC-2024-005',
    title: 'Dependency Vulnerability — CVE-2024-3094 (XZ Utils)',
    severity: 'critical',
    status: 'resolved',
    vendor: 'TechBridge Solutions',
    detectedAt: '2024-07-10 07:00',
    assignee: 'Ngozi Obi',
    timeline: [
      { id: 't1', timestamp: '2024-07-10 07:00', type: 'detected', actor: 'KEV Scanner', title: 'CVE-2024-3094 matched in vendor SBOM', detail: 'XZ Utils 5.6.0 found in TechBridge production build. CVSS 10.0 — backdoor in SSH.' },
      { id: 't2', timestamp: '2024-07-10 07:20', type: 'escalated', actor: 'Ngozi Obi', title: 'Immediate escalation to CISO and vendor CISO', detail: 'Critical supply chain backdoor. Vendor isolation protocol initiated.' },
      { id: 't3', timestamp: '2024-07-10 09:00', type: 'assigned', actor: 'CISO', title: 'Emergency patch task assigned', detail: 'Downgrade to XZ Utils 5.4.6. Audit all SSH access logs for anomalies.' },
      { id: 't4', timestamp: '2024-07-10 14:00', type: 'update', actor: 'TechBridge IR', title: 'Patch deployed to all production nodes', detail: 'XZ Utils downgraded. SSH audit complete — no unauthorized access detected.' },
      { id: 't5', timestamp: '2024-07-10 15:30', type: 'resolved', actor: 'Ngozi Obi', title: 'Incident resolved — post-mortem scheduled', detail: 'All systems clean. Post-mortem set for 2024-07-17.' },
    ],
  },
];

const typeConfig: Record<TimelineEvent['type'], { icon: React.ReactNode; color: string; label: string }> = {
  detected: { icon: <AlertTriangle size={13} />, color: 'text-status-critical bg-status-critical/10 border-status-critical/30', label: 'Detected' },
  triaged: { icon: <Shield size={13} />, color: 'text-status-high bg-status-high/10 border-status-high/30', label: 'Triaged' },
  escalated: { icon: <ArrowUpCircle size={13} />, color: 'text-status-critical bg-status-critical/10 border-status-critical/30', label: 'Escalated' },
  assigned: { icon: <User size={13} />, color: 'text-status-info bg-status-info/10 border-status-info/30', label: 'Assigned' },
  update: { icon: <FileText size={13} />, color: 'text-status-medium bg-status-medium/10 border-status-medium/30', label: 'Update' },
  resolved: { icon: <CheckCircle size={13} />, color: 'text-status-low bg-status-low/10 border-status-low/30', label: 'Resolved' },
  comment: { icon: <MessageSquare size={13} />, color: 'text-muted-foreground bg-muted border-border', label: 'Comment' },
};

const severityConfig = {
  critical: { label: 'CRITICAL', cls: 'bg-status-critical/10 text-status-critical border-status-critical/30' },
  high: { label: 'HIGH', cls: 'bg-status-high/10 text-status-high border-status-high/30' },
  medium: { label: 'MEDIUM', cls: 'bg-status-medium/10 text-status-medium border-status-medium/30' },
  low: { label: 'LOW', cls: 'bg-status-low/10 text-status-low border-status-low/30' },
};

const statusConfig = {
  open: { label: 'Open', cls: 'bg-status-critical/10 text-status-critical border-status-critical/30' },
  investigating: { label: 'Investigating', cls: 'bg-status-high/10 text-status-high border-status-high/30' },
  contained: { label: 'Contained', cls: 'bg-status-medium/10 text-status-medium border-status-medium/30' },
  resolved: { label: 'Resolved', cls: 'bg-status-low/10 text-status-low border-status-low/30' },
};

export { INCIDENTS };
export type { Incident };

export default function IncidentTimeline({ selectedId }: { selectedId: string | null }) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set(['t1', 't2']));

  const incident = INCIDENTS.find((i) => i.id === selectedId) ?? INCIDENTS[0];

  const toggleEvent = (id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sev = severityConfig[incident.severity];
  const stat = statusConfig[incident.status];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      {/* Incident header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono-data text-muted-foreground">{incident.id}</span>
            <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${sev.cls}`}>{sev.label}</span>
            <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${stat.cls}`}>{stat.label}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mt-1 leading-snug">{incident.title}</h3>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock size={11} /> {incident.detectedAt}</span>
            <span className="flex items-center gap-1"><User size={11} /> {incident.assignee}</span>
            <span>{incident.vendor}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Incident Timeline</p>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-1">
            {incident.timeline.map((event, idx) => {
              const cfg = typeConfig[event.type];
              const expanded = expandedEvents.has(event.id);
              const isLast = idx === incident.timeline.length - 1;
              return (
                <div key={event.id} className={`relative pl-10 ${isLast ? '' : 'pb-1'}`}>
                  {/* Dot */}
                  <div className={`absolute left-2 top-2.5 w-4 h-4 rounded-full border flex items-center justify-center ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div
                    className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => event.detail && toggleEvent(event.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded border ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs font-medium text-foreground truncate">{event.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-2xs font-mono-data text-muted-foreground">{event.timestamp.split(' ')[1]}</span>
                        <span className="text-2xs text-muted-foreground">{event.actor}</span>
                        {event.detail && (
                          expanded ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {expanded && event.detail && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed border-t border-border/50 pt-2">{event.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
