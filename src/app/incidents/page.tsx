'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import IncidentTimeline, { INCIDENTS } from './components/IncidentTimeline';
import ImpactAssessmentPanel from './components/ImpactAssessmentPanel';
import RemediationTasksPanel from './components/RemediationTasksPanel';
import EscalationWorkflowPanel from './components/EscalationWorkflowPanel';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Plus,
  ChevronRight,
} from 'lucide-react';

type RightPanel = 'timeline' | 'impact' | 'remediation' | 'escalation';

const severityConfig = {
  critical: { cls: 'bg-status-critical/10 text-status-critical border-status-critical/30', dot: 'bg-status-critical alert-pulse' },
  high: { cls: 'bg-status-high/10 text-status-high border-status-high/30', dot: 'bg-status-high' },
  medium: { cls: 'bg-status-medium/10 text-status-medium border-status-medium/30', dot: 'bg-status-medium' },
  low: { cls: 'bg-status-low/10 text-status-low border-status-low/30', dot: 'bg-status-low' },
};

const statusConfig = {
  open: { label: 'Open', cls: 'bg-status-critical/10 text-status-critical border-status-critical/30' },
  investigating: { label: 'Investigating', cls: 'bg-status-high/10 text-status-high border-status-high/30' },
  contained: { label: 'Contained', cls: 'bg-status-medium/10 text-status-medium border-status-medium/30' },
  resolved: { label: 'Resolved', cls: 'bg-status-low/10 text-status-low border-status-low/30' },
};

export default function IncidentsPage() {
  const [selectedId, setSelectedId] = useState<string>(INCIDENTS[0].id);
  const [activePanel, setActivePanel] = useState<RightPanel>('timeline');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const kpis = [
    { label: 'Open Incidents', value: INCIDENTS.filter((i) => i.status === 'open').length.toString(), sub: 'require triage', cls: 'text-status-critical', borderCls: 'border-status-critical/30', icon: <AlertTriangle size={16} className="text-status-critical" /> },
    { label: 'Investigating', value: INCIDENTS.filter((i) => i.status === 'investigating').length.toString(), sub: 'active response', cls: 'text-status-high', borderCls: 'border-status-high/30', icon: <ShieldAlert size={16} className="text-status-high" /> },
    { label: 'Contained', value: INCIDENTS.filter((i) => i.status === 'contained').length.toString(), sub: 'remediation active', cls: 'text-status-medium', borderCls: 'border-status-medium/30', icon: <Clock size={16} className="text-status-medium" /> },
    { label: 'Resolved', value: INCIDENTS.filter((i) => i.status === 'resolved').length.toString(), sub: 'this month', cls: 'text-status-low', borderCls: 'border-status-low/30', icon: <CheckCircle size={16} className="text-status-low" /> },
    { label: 'Critical Severity', value: INCIDENTS.filter((i) => i.severity === 'critical').length.toString(), sub: 'immediate action', cls: 'text-status-critical', borderCls: 'border-status-critical/30', icon: <AlertTriangle size={16} className="text-status-critical" /> },
    { label: 'Escalated', value: '3', sub: 'awaiting acknowledgement', cls: 'text-status-high', borderCls: 'border-status-high/30', icon: <ShieldAlert size={16} className="text-status-high" /> },
  ];

  const panels: { id: RightPanel; label: string }[] = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'impact', label: 'Impact Assessment' },
    { id: 'remediation', label: 'Remediation Tasks' },
    { id: 'escalation', label: 'Escalation Workflow' },
  ];

  const filteredIncidents = INCIDENTS.filter((inc) => {
    const matchSearch = search === '' || inc.title.toLowerCase().includes(search.toLowerCase()) || inc.vendor.toLowerCase().includes(search.toLowerCase()) || inc.id.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const selectedIncident = INCIDENTS.find((i) => i.id === selectedId) ?? INCIDENTS[0];

  return (
    <AppLayout>
      <div className="space-y-5 fade-in">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert size={20} className="text-primary" />
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Security Incidents</h1>
              {INCIDENTS.filter((i) => i.status === 'open' || i.status === 'investigating').length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-critical/10 border border-status-critical/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-critical alert-pulse" />
                  <span className="text-2xs font-semibold text-status-critical">
                    {INCIDENTS.filter((i) => i.status === 'open' || i.status === 'investigating').length} ACTIVE
                  </span>
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Log, triage, and track security incidents with timeline, impact assessment, and escalation workflows
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus size={15} />
            Log Incident
          </button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-6 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={`bg-card border ${kpi.borderCls} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                {kpi.icon}
              </div>
              <p className={`text-2xl font-bold font-mono-data ${kpi.cls}`}>{kpi.value}</p>
              <p className="text-xs font-medium text-foreground mt-1 leading-tight">{kpi.label}</p>
              <p className="text-2xs text-muted-foreground mt-0.5 leading-tight">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Main content: incident list + detail panel */}
        <div className="grid grid-cols-5 gap-4">
          {/* Left: Incident list */}
          <div className="col-span-2 space-y-3">
            {/* Search + filter */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search incidents..."
                  className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="relative">
                <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-card border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 appearance-none"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Incident cards */}
            <div className="space-y-2">
              {filteredIncidents.map((inc) => {
                const sev = severityConfig[inc.severity];
                const stat = statusConfig[inc.status];
                const isSelected = selectedId === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedId(inc.id)}
                    className={`bg-card border rounded-xl p-4 cursor-pointer transition-all duration-150 ${
                      isSelected ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-border/80 hover:bg-muted/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-mono-data text-muted-foreground">{inc.id}</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5 leading-snug line-clamp-2">{inc.title}</p>
                        </div>
                      </div>
                      <ChevronRight size={13} className={`flex-shrink-0 mt-1 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full border ${sev.cls}`}>
                        {inc.severity.toUpperCase()}
                      </span>
                      <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full border ${stat.cls}`}>
                        {stat.label}
                      </span>
                      <span className="text-2xs text-muted-foreground">{inc.vendor}</span>
                    </div>
                    <p className="text-2xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Clock size={10} /> {inc.detectedAt}
                    </p>
                  </div>
                );
              })}
              {filteredIncidents.length === 0 && (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-xs text-muted-foreground">No incidents match your filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Detail panels */}
          <div className="col-span-3 space-y-3">
            {/* Selected incident header */}
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono-data text-muted-foreground">{selectedIncident.id}</span>
                <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${severityConfig[selectedIncident.severity].cls}`}>
                  {selectedIncident.severity.toUpperCase()}
                </span>
                <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${statusConfig[selectedIncident.status].cls}`}>
                  {statusConfig[selectedIncident.status].label}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-1">{selectedIncident.title}</p>
            </div>

            {/* Panel tabs */}
            <div className="flex items-center gap-1 border-b border-border">
              {panels.map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all duration-150 -mb-px ${
                    activePanel === panel.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {panel.label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            {activePanel === 'timeline' && <IncidentTimeline selectedId={selectedId} />}
            {activePanel === 'impact' && <ImpactAssessmentPanel selectedId={selectedId} />}
            {activePanel === 'remediation' && <RemediationTasksPanel selectedId={selectedId} />}
            {activePanel === 'escalation' && <EscalationWorkflowPanel selectedId={selectedId} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
