'use client';

import React, { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, User, ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface RemediationTask {
  id: string;
  incidentId: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  description: string;
  progress: number;
}

const TASKS: RemediationTask[] = [
  { id: 'T-001', incidentId: 'INC-2024-001', title: 'Rotate all API credentials', assignee: 'Interswitch IR', dueDate: '2024-07-15 11:00', priority: 'critical', status: 'completed', description: 'Rotate gateway API keys, OAuth tokens, and service account credentials. Invalidate all active sessions.', progress: 100 },
  { id: 'T-002', incidentId: 'INC-2024-001', title: 'Block malicious IP ranges', assignee: 'Interswitch IR', dueDate: '2024-07-15 11:00', priority: 'critical', status: 'completed', description: 'Apply firewall rules to block 185.220.0.0/16 and associated ASN at gateway level.', progress: 100 },
  { id: 'T-003', incidentId: 'INC-2024-001', title: 'Forensic log analysis', assignee: 'Chidi Okonkwo', dueDate: '2024-07-16 17:00', priority: 'high', status: 'in_progress', description: 'Analyze extracted API access logs for data exfiltration indicators. Document findings for regulatory report.', progress: 60 },
  { id: 'T-004', incidentId: 'INC-2024-001', title: 'CBN TPRMF incident notification', assignee: 'Chidi Okonkwo', dueDate: '2024-07-16 09:14', priority: 'critical', status: 'overdue', description: 'Submit mandatory incident notification to CBN within 24h of detection per TPRMF §4.2.', progress: 20 },
  { id: 'T-005', incidentId: 'INC-2024-002', title: 'Renew SSL certificate', assignee: 'NigeriaCloud Ops', dueDate: '2024-07-14 17:00', priority: 'high', status: 'completed', description: 'Renew and deploy SSL certificate for storage.nigeriacloud.ng. Verify all TLS handshakes.', progress: 100 },
  { id: 'T-006', incidentId: 'INC-2024-003', title: 'Report phishing domain to registrar', assignee: 'SOC Analyst', dueDate: '2024-07-17 09:00', priority: 'high', status: 'in_progress', description: 'Submit abuse report to domain registrar and CERT-NG. Request takedown of flutterwav3.com.', progress: 40 },
  { id: 'T-007', incidentId: 'INC-2024-003', title: 'Notify Flutterwave employees', assignee: 'Amaka Eze', dueDate: '2024-07-16 12:00', priority: 'high', status: 'pending', description: 'Coordinate with Flutterwave security team to alert employees about phishing campaign.', progress: 0 },
  { id: 'T-008', incidentId: 'INC-2024-004', title: 'Migrate PII to NG region', assignee: 'Tunde Adeyemi', dueDate: '2024-07-16 11:00', priority: 'high', status: 'in_progress', description: 'Migrate 8,700 customer PII records from EU-West-1 to Lagos (af-south-1) region. Verify residency compliance.', progress: 75 },
  { id: 'T-009', incidentId: 'INC-2024-005', title: 'Downgrade XZ Utils to 5.4.6', assignee: 'TechBridge IR', dueDate: '2024-07-10 12:00', priority: 'critical', status: 'completed', description: 'Emergency downgrade of XZ Utils across all production nodes. Rebuild affected packages.', progress: 100 },
  { id: 'T-010', incidentId: 'INC-2024-005', title: 'SSH access log audit', assignee: 'Ngozi Obi', dueDate: '2024-07-10 15:00', priority: 'critical', status: 'completed', description: 'Audit all SSH access logs for the past 30 days for unauthorized access patterns.', progress: 100 },
];

const priorityConfig = {
  critical: { cls: 'bg-status-critical/10 text-status-critical border-status-critical/30', dot: 'bg-status-critical' },
  high: { cls: 'bg-status-high/10 text-status-high border-status-high/30', dot: 'bg-status-high' },
  medium: { cls: 'bg-status-medium/10 text-status-medium border-status-medium/30', dot: 'bg-status-medium' },
  low: { cls: 'bg-status-low/10 text-status-low border-status-low/30', dot: 'bg-status-low' },
};

const statusConfig = {
  pending: { label: 'Pending', icon: <Clock size={12} />, cls: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: <Clock size={12} />, cls: 'text-status-info' },
  completed: { label: 'Completed', icon: <CheckCircle size={12} />, cls: 'text-status-low' },
  overdue: { label: 'Overdue', icon: <AlertTriangle size={12} />, cls: 'text-status-critical' },
};

const progressColor = (pct: number, status: string) => {
  if (status === 'overdue') return 'bg-status-critical';
  if (pct === 100) return 'bg-status-low';
  if (pct >= 60) return 'bg-status-info';
  return 'bg-status-medium';
};

export default function RemediationTasksPanel({ selectedId }: { selectedId: string | null }) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'overdue' | 'completed'>('all');

  const incidentId = selectedId ?? 'INC-2024-001';
  const tasks = TASKS.filter((t) => t.incidentId === incidentId);
  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const filterBtns: { key: typeof filter; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'overdue', label: `Overdue (${counts.overdue})` },
    { key: 'in_progress', label: `In Progress (${counts.in_progress})` },
    { key: 'pending', label: `Pending (${counts.pending})` },
    { key: 'completed', label: `Completed (${counts.completed})` },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Remediation Tasks</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
          <Plus size={12} />
          Add Task
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {filterBtns.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`px-2.5 py-1 rounded-full text-2xs font-semibold border transition-colors ${
              filter === btn.key
                ? 'bg-primary text-white border-primary' :'bg-muted text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No tasks in this category</p>
        )}
        {filtered.map((task) => {
          const pCfg = priorityConfig[task.priority];
          const sCfg = statusConfig[task.status];
          const expanded = expandedTask === task.id;
          return (
            <div
              key={task.id}
              className="border border-border/60 rounded-lg overflow-hidden"
            >
              <div
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedTask(expanded ? null : task.id)}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${pCfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-data text-muted-foreground">{task.id}</span>
                    <span className="text-xs font-medium text-foreground truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor(task.progress, task.status)}`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-2xs font-mono-data text-muted-foreground w-8 text-right">{task.progress}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`flex items-center gap-1 text-2xs font-semibold ${sCfg.cls}`}>
                    {sCfg.icon}
                    {sCfg.label}
                  </span>
                  <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full border ${pCfg.cls}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  {expanded ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
                </div>
              </div>
              {expanded && (
                <div className="px-3 pb-3 pt-0 border-t border-border/50 bg-muted/20">
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">{task.description}</p>
                  <div className="flex items-center gap-4 mt-2.5 text-2xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User size={10} /> {task.assignee}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> Due: {task.dueDate}</span>
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
