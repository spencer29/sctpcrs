'use client';

import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertTriangle, ChevronRight, Building2, User, Plus } from 'lucide-react';

interface AuditEvent {
  id: string;
  framework: string;
  vendor: string;
  type: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  auditor: string;
  scheduledDate: string;
  completedDate?: string;
  scope: string;
  findings: number;
  criticalFindings: number;
  daysUntil?: number;
}

const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'AUD-2026-018', framework: 'CBN TPRMF', vendor: 'Interswitch Group', type: 'SCHEDULED', auditor: 'Olumide Fashola', scheduledDate: '2026-08-15', scope: 'Full Regulatory Audit', findings: 0, criticalFindings: 0, daysUntil: 29 },
  { id: 'AUD-2026-017', framework: 'NDPR', vendor: 'Flutterwave Inc.', type: 'OVERDUE', auditor: 'Ngozi Adeyemi', scheduledDate: '2026-07-10', scope: 'Data Privacy Review', findings: 0, criticalFindings: 0, daysUntil: -7 },
  { id: 'AUD-2026-016', framework: 'ISO 27001', vendor: 'Huawei Technologies', type: 'IN_PROGRESS', auditor: 'Chidi Okonkwo', scheduledDate: '2026-07-14', scope: 'Information Security Audit', findings: 4, criticalFindings: 2, daysUntil: 0 },
  { id: 'AUD-2026-015', framework: 'NIST CSF', vendor: 'MTN Nigeria', type: 'SCHEDULED', auditor: 'Fatima Aliyu', scheduledDate: '2026-09-30', scope: 'Cybersecurity Framework Review', findings: 0, criticalFindings: 0, daysUntil: 75 },
  { id: 'AUD-2026-014', framework: 'PCI-DSS', vendor: 'Paystack (Stripe)', type: 'SCHEDULED', auditor: 'Olumide Fashola', scheduledDate: '2026-10-01', scope: 'Payment Security Audit', findings: 0, criticalFindings: 0, daysUntil: 76 },
  { id: 'AUD-2026-013', framework: 'SOC 2', vendor: 'Microsoft Nigeria', type: 'SCHEDULED', auditor: 'Ngozi Adeyemi', scheduledDate: '2026-11-20', scope: 'Service Organization Controls', findings: 0, criticalFindings: 0, daysUntil: 126 },
  { id: 'AUD-2026-012', framework: 'ISO 27001', vendor: 'Oracle Financial', type: 'COMPLETED', auditor: 'Fatima Aliyu', scheduledDate: '2026-06-15', completedDate: '2026-06-18', scope: 'Annual Information Security', findings: 3, criticalFindings: 0 },
  { id: 'AUD-2026-011', framework: 'PCI-DSS', vendor: 'Interswitch Group', type: 'COMPLETED', auditor: 'Chidi Okonkwo', scheduledDate: '2026-05-20', completedDate: '2026-05-22', scope: 'Payment Card Industry Audit', findings: 2, criticalFindings: 1 },
  { id: 'AUD-2026-010', framework: 'NDPR', vendor: 'MTN Nigeria', type: 'COMPLETED', auditor: 'Olumide Fashola', scheduledDate: '2026-04-10', completedDate: '2026-04-14', scope: 'Data Protection Review', findings: 1, criticalFindings: 0 },
];

const typeConfig: Record<AuditEvent['type'], { label: string; cls: string; icon: React.ReactNode }> = {
  SCHEDULED: { label: 'Scheduled', cls: 'text-status-info bg-status-info/10 border-status-info/30', icon: <Calendar size={11} /> },
  IN_PROGRESS: { label: 'In Progress', cls: 'text-primary bg-primary/10 border-primary/30', icon: <Clock size={11} /> },
  COMPLETED: { label: 'Completed', cls: 'text-status-low bg-status-low/10 border-status-low/30', icon: <CheckCircle2 size={11} /> },
  OVERDUE: { label: 'Overdue', cls: 'text-status-critical bg-status-critical/10 border-status-critical/30', icon: <AlertTriangle size={11} /> },
  CANCELLED: { label: 'Cancelled', cls: 'text-muted-foreground bg-muted border-border', icon: <ChevronRight size={11} /> },
};

const fwColor: Record<string, string> = {
  'ISO 27001': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'NDPR': 'bg-green-500/20 text-green-400 border-green-500/30',
  'PCI-DSS': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'SOC 2': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'CBN TPRMF': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'NIST CSF': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

type FilterType = 'all' | 'upcoming' | 'in_progress' | 'overdue' | 'completed';

interface AuditSchedulePanelProps {
  canSchedule?: boolean;
}

export default function AuditSchedulePanel({ canSchedule = false }: AuditSchedulePanelProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = AUDIT_EVENTS.filter((e) => {
    if (filter === 'upcoming') return e.type === 'SCHEDULED';
    if (filter === 'in_progress') return e.type === 'IN_PROGRESS';
    if (filter === 'overdue') return e.type === 'OVERDUE';
    if (filter === 'completed') return e.type === 'COMPLETED';
    return true;
  });

  const upcoming = AUDIT_EVENTS.filter((e) => e.type === 'SCHEDULED').length;
  const inProg = AUDIT_EVENTS.filter((e) => e.type === 'IN_PROGRESS').length;
  const overdue = AUDIT_EVENTS.filter((e) => e.type === 'OVERDUE').length;

  const filters: { id: FilterType; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: AUDIT_EVENTS.length },
    { id: 'upcoming', label: 'Upcoming', count: upcoming },
    { id: 'in_progress', label: 'In Progress', count: inProg },
    { id: 'overdue', label: 'Overdue', count: overdue },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Audit Schedule</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Upcoming, active, and historical compliance audits</p>
          </div>
          <div className="flex items-center gap-2">
            {overdue > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-status-critical/10 border border-status-critical/30">
                <AlertTriangle size={12} className="text-status-critical" />
                <span className="text-xs font-semibold text-status-critical">{overdue} Overdue</span>
              </div>
            )}
            {canSchedule && (
              <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
                <Plus size={12} />
                Schedule
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors duration-100 ${
                filter === f.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
              }`}
            >
              {f.label}
              {f.count !== undefined && (
                <span className={`text-2xs font-mono-data px-1 rounded ${filter === f.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {filtered.map((audit) => {
          const tc = typeConfig[audit.type];
          return (
            <div key={audit.id} className="px-5 py-3.5 hover:bg-muted/20 transition-colors duration-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-2xs font-semibold ${fwColor[audit.framework] || 'bg-muted text-muted-foreground border-border'}`}>
                      {audit.framework}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-data text-muted-foreground">{audit.id}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-2xs font-semibold ${tc.cls}`}>
                        {tc.icon}{tc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Building2 size={11} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">{audit.vendor}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{audit.scope}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User size={10} />{audit.auditor}</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {audit.type === 'COMPLETED' ? `Completed ${audit.completedDate}` : `Scheduled ${audit.scheduledDate}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  {audit.type === 'SCHEDULED' && audit.daysUntil !== undefined && (
                    <div className="text-xs font-mono-data text-status-info">
                      in {audit.daysUntil}d
                    </div>
                  )}
                  {audit.type === 'OVERDUE' && audit.daysUntil !== undefined && (
                    <div className="text-xs font-mono-data text-status-critical">
                      {Math.abs(audit.daysUntil)}d overdue
                    </div>
                  )}
                  {audit.type === 'IN_PROGRESS' && (
                    <div className="text-xs font-mono-data text-primary">Active</div>
                  )}
                  {(audit.findings > 0 || audit.criticalFindings > 0) && (
                    <div className="mt-1 text-2xs text-muted-foreground">
                      {audit.criticalFindings > 0 && (
                        <span className="text-status-critical font-mono-data">{audit.criticalFindings} critical</span>
                      )}
                      {audit.criticalFindings > 0 && audit.findings > audit.criticalFindings && <span className="mx-1">·</span>}
                      {audit.findings > 0 && (
                        <span className="font-mono-data">{audit.findings} findings</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
