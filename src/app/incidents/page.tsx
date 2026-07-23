'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import IncidentTimeline, { INCIDENTS } from './components/IncidentTimeline';
import ImpactAssessmentPanel from './components/ImpactAssessmentPanel';
import RemediationTasksPanel from './components/RemediationTasksPanel';
import EscalationWorkflowPanel from './components/EscalationWorkflowPanel';
import BulkAlertActions from './components/BulkAlertActions';
import AuditTrailPanel from './components/AuditTrailPanel';
import { AuditEntry } from './components/BulkAlertActions';
import ProactiveRiskForecast from './components/ProactiveRiskForecast';
import { PermissionGate } from '@/components/rbac/PermissionGate';
import { useRoleFilter } from '@/lib/rbac/useRoleFilter';
import {
  useRealtimeIncidents,
  useRealtimeAlerts,
  useRealtimeCompliance,
} from '@/lib/supabase/realtimeDashboard';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Plus,
  ChevronRight,
  Layers,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

type RightPanel = 'timeline' | 'impact' | 'remediation' | 'escalation';
type MainTab = 'incidents' | 'bulk-alerts' | 'risk-forecast' | 'compliance-live';

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

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-status-low';
  if (score >= 60) return 'text-status-medium';
  if (score >= 40) return 'text-status-high';
  return 'text-status-critical';
};

export default function IncidentsPage() {
  const [selectedId, setSelectedId] = useState<string>(INCIDENTS[0].id);
  const [activePanel, setActivePanel] = useState<RightPanel>('timeline');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [mainTab, setMainTab] = useState<MainTab>('incidents');
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  const roleFilter = useRoleFilter();

  // ── Real-time subscriptions ──────────────────────────────────────────────
  const {
    incidents: liveIncidents,
    timelineEvents: liveEvents,
    loading: incLoading,
    error: incError,
  } = useRealtimeIncidents();

  const {
    alerts: liveAlerts,
    loading: alertLoading,
    error: alertError,
    updateAlertStatus,
  } = useRealtimeAlerts();

  const {
    frameworks: liveFrameworks,
    loading: compLoading,
    error: compError,
  } = useRealtimeCompliance();

  const isLive = liveIncidents.length > 0;

  // ── Derive incident list (live or static fallback) ───────────────────────
  const allDisplayIncidents =
    liveIncidents.length > 0
      ? liveIncidents.map((inc) => ({
          id: inc.id,
          title: inc.title,
          severity: inc.severity,
          status: inc.status,
          vendor: inc.vendor,
          detectedAt: inc.detected_at,
          assignee: inc.assignee,
        }))
      : INCIDENTS;

  // Scope incidents: Vendor Manager sees only their assigned incidents
  const displayIncidents =
    roleFilter.incidentScope === 'none'
      ? []
      : roleFilter.incidentScope === 'assigned'
      ? allDisplayIncidents.filter(
          (i) =>
            !i.assignee ||
            i.assignee.toLowerCase().includes((roleFilter.role ?? '').toLowerCase())
        )
      : allDisplayIncidents;

  const handleAuditEntry = (entry: AuditEntry) => {
    setAuditEntries((prev) => [entry, ...prev]);
  };

  const handleBulkStatusUpdate = async (
    ids: string[],
    status: 'acknowledged' | 'dismissed' | 'escalated'
  ) => {
    await updateAlertStatus(ids, status);
  };

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const openCount = displayIncidents.filter((i) => i.status === 'open').length;
  const investigatingCount = displayIncidents.filter((i) => i.status === 'investigating').length;
  const containedCount = displayIncidents.filter((i) => i.status === 'contained').length;
  const resolvedCount = displayIncidents.filter((i) => i.status === 'resolved').length;
  const criticalCount = displayIncidents.filter((i) => i.severity === 'critical').length;
  const activeAlertCount = liveAlerts.filter((a) => a.status === 'active').length;

  const kpis = [
    { label: 'Open Incidents', value: openCount.toString(), sub: 'require triage', cls: 'text-status-critical', borderCls: 'border-status-critical/30', icon: <AlertTriangle size={16} className="text-status-critical" /> },
    { label: 'Investigating', value: investigatingCount.toString(), sub: 'active response', cls: 'text-status-high', borderCls: 'border-status-high/30', icon: <ShieldAlert size={16} className="text-status-high" /> },
    { label: 'Contained', value: containedCount.toString(), sub: 'remediation active', cls: 'text-status-medium', borderCls: 'border-status-medium/30', icon: <Clock size={16} className="text-status-medium" /> },
    { label: 'Resolved', value: resolvedCount.toString(), sub: 'this month', cls: 'text-status-low', borderCls: 'border-status-low/30', icon: <CheckCircle size={16} className="text-status-low" /> },
    { label: 'Critical Severity', value: criticalCount.toString(), sub: 'immediate action', cls: 'text-status-critical', borderCls: 'border-status-critical/30', icon: <AlertTriangle size={16} className="text-status-critical" /> },
    {
      label: 'Active Alerts',
      value: alertLoading ? '—' : activeAlertCount.toString(),
      sub: isLive ? 'live count' : 'awaiting acknowledgement',
      cls: 'text-status-high',
      borderCls: 'border-status-high/30',
      icon: <ShieldAlert size={16} className="text-status-high" />,
    },
  ];

  // Restrict panel tabs: Escalation Workflow only for roles that can escalate
  const panels: { id: RightPanel; label: string }[] = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'impact', label: 'Impact Assessment' },
    { id: 'remediation', label: 'Remediation Tasks' },
    ...(roleFilter.canEscalate ? [{ id: 'escalation' as RightPanel, label: 'Escalation Workflow' }] : []),
  ];

  const filteredIncidents = displayIncidents.filter((inc) => {
    const matchSearch =
      search === '' ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.vendor.toLowerCase().includes(search.toLowerCase()) ||
      inc.id.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const selectedIncident = displayIncidents.find((i) => i.id === selectedId) ?? displayIncidents[0];

  return (
    <AppLayout>
      <div className="space-y-5 fade-in">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert size={20} className="text-primary" />
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Security Incidents</h1>
              {displayIncidents.filter((i) => i.status === 'open' || i.status === 'investigating').length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-critical/10 border border-status-critical/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-critical alert-pulse" />
                  <span className="text-2xs font-semibold text-status-critical">
                    {displayIncidents.filter((i) => i.status === 'open' || i.status === 'investigating').length} ACTIVE
                  </span>
                </span>
              )}
              {isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-low/10 border border-status-low/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-low animate-pulse" />
                  <span className="text-2xs font-semibold text-status-low">LIVE</span>
                </span>
              )}
              {roleFilter.incidentScope === 'assigned' && (
                <span className="text-2xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                  Scoped to your assignments
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Log, triage, and track security incidents with timeline, impact assessment, and escalation workflows
            </p>
          </div>
          <PermissionGate resource="incidents" action="create" silent>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Plus size={15} />
              Log Incident
            </button>
          </PermissionGate>
        </div>

        {/* Error banners */}
        {(incError || alertError || compError) && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-status-high/10 border border-status-high/30 text-xs text-status-high">
            <AlertTriangle size={13} />
            <span>Real-time connection issue — showing cached data. {incError || alertError || compError}</span>
          </div>
        )}

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

        {/* Main tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          <button
            onClick={() => setMainTab('incidents')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all duration-150 -mb-px ${
              mainTab === 'incidents' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert size={13} />
            Incident Management
          </button>
          {/* Bulk Alert Actions — restricted to roles that can edit alerts */}
          <PermissionGate resource="alerts" action="edit" silent>
            <button
              onClick={() => setMainTab('bulk-alerts')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all duration-150 -mb-px ${
                mainTab === 'bulk-alerts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers size={13} />
              Bulk Alert Actions
              {auditEntries.length > 0 && (
                <span className="text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {auditEntries.length} new
                </span>
              )}
            </button>
          </PermissionGate>
          <button
            onClick={() => setMainTab('risk-forecast')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all duration-150 -mb-px ${
              mainTab === 'risk-forecast' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap size={13} />
            Risk Forecast
          </button>
          <button
            onClick={() => setMainTab('compliance-live')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all duration-150 -mb-px ${
              mainTab === 'compliance-live' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle size={13} />
            Compliance Status
            {isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-status-low animate-pulse" />
            )}
          </button>
        </div>

        {/* Incident Management tab */}
        {mainTab === 'incidents' && (
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

              {/* Loading state */}
              {incLoading && (
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground animate-pulse">Loading incidents...</p>
                </div>
              )}

              {/* No access for Vendor Manager persona */}
              {roleFilter.incidentScope === 'none' && (
                <div className="bg-card border border-border rounded-xl p-8 text-center space-y-2">
                  <ShieldAlert size={28} className="text-muted-foreground mx-auto" />
                  <p className="text-xs font-medium text-foreground">Incident access not in your scope</p>
                  <p className="text-2xs text-muted-foreground">Contact your Risk Officer for incident details.</p>
                </div>
              )}

              {/* Incident cards */}
              {roleFilter.incidentScope !== 'none' && (
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
                  {filteredIncidents.length === 0 && !incLoading && (
                    <div className="bg-card border border-border rounded-xl p-8 text-center">
                      <p className="text-xs text-muted-foreground">No incidents match your filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Detail panels */}
            {roleFilter.incidentScope !== 'none' && (
              <div className="col-span-3 space-y-3">
                {/* Selected incident header */}
                {selectedIncident && (
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
                )}

                {/* Panel tabs */}
                <div className="flex items-center gap-1 border-b border-border">
                  {panels.map((panel) => (
                    <button
                      key={panel.id}
                      onClick={() => setActivePanel(panel.id)}
                      className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all duration-150 -mb-px ${
                        activePanel === panel.id
                          ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {panel.label}
                    </button>
                  ))}
                </div>

                {/* Panel content */}
                {activePanel === 'timeline' && (
                  <IncidentTimeline
                    selectedId={selectedId}
                    liveIncidents={liveIncidents}
                    liveEvents={liveEvents}
                    isLive={isLive}
                  />
                )}
                {activePanel === 'impact' && <ImpactAssessmentPanel selectedId={selectedId} />}
                {activePanel === 'remediation' && <RemediationTasksPanel selectedId={selectedId} />}
                {activePanel === 'escalation' && roleFilter.canEscalate && (
                  <EscalationWorkflowPanel selectedId={selectedId} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Bulk Alert Actions tab */}
        {mainTab === 'bulk-alerts' && (
          <div className="grid grid-cols-5 gap-4">
            {/* Left: Bulk alert selector */}
            <div className="col-span-3">
              <BulkAlertActions
                onAuditEntry={handleAuditEntry}
                liveAlerts={liveAlerts}
                isLive={!alertLoading && liveAlerts.length > 0}
                onBulkStatusUpdate={handleBulkStatusUpdate}
              />
            </div>
            {/* Right: Audit trail */}
            <div className="col-span-2">
              <AuditTrailPanel entries={auditEntries} />
            </div>
          </div>
        )}

        {/* Risk Forecast tab */}
        {mainTab === 'risk-forecast' && <ProactiveRiskForecast />}

        {/* Compliance Status tab — live from Supabase */}
        {mainTab === 'compliance-live' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Live Compliance Status</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Framework scores updated in real-time via Supabase subscriptions
                </p>
              </div>
              {isLive && (
                <span className="flex items-center gap-1.5 text-xs text-status-low font-semibold px-3 py-1.5 rounded-full bg-status-low/10 border border-status-low/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-low animate-pulse" />
                  Live
                </span>
              )}
            </div>

            {compLoading && (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-xs text-muted-foreground animate-pulse">Loading compliance data...</p>
              </div>
            )}

            {!compLoading && liveFrameworks.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {liveFrameworks.map((fw) => (
                  <div key={fw.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{fw.short_name}</p>
                        <p className="text-2xs text-muted-foreground mt-0.5">{fw.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {fw.trend === 'up' && <TrendingUp size={13} className="text-status-low" />}
                        {fw.trend === 'down' && <TrendingDown size={13} className="text-status-critical" />}
                        {fw.trend === 'stable' && <Minus size={13} className="text-muted-foreground" />}
                        <span className={`text-2xs font-semibold ${
                          fw.trend === 'up' ? 'text-status-low' :
                          fw.trend === 'down' ? 'text-status-critical' : 'text-muted-foreground'
                        }`}>
                          {fw.trend_delta > 0 ? `+${fw.trend_delta}` : fw.trend_delta}
                        </span>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xs text-muted-foreground">Overall Score</span>
                        <span className={`text-sm font-bold font-mono-data ${scoreColor(fw.overall_score)}`}>
                          {fw.overall_score}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            fw.overall_score >= 80 ? 'bg-status-low' :
                            fw.overall_score >= 60 ? 'bg-status-medium' :
                            fw.overall_score >= 40 ? 'bg-status-high' : 'bg-status-critical'
                          }`}
                          style={{ width: `${fw.overall_score}%` }}
                        />
                      </div>
                    </div>

                    {/* Vendor breakdown */}
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div>
                        <p className="text-xs font-bold font-mono-data text-status-low">{fw.compliant}</p>
                        <p className="text-2xs text-muted-foreground">OK</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold font-mono-data text-status-medium">{fw.partial}</p>
                        <p className="text-2xs text-muted-foreground">Partial</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold font-mono-data text-status-critical">{fw.non_compliant}</p>
                        <p className="text-2xs text-muted-foreground">NC</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold font-mono-data text-muted-foreground">{fw.pending}</p>
                        <p className="text-2xs text-muted-foreground">Pending</p>
                      </div>
                    </div>

                    <p className="text-2xs text-muted-foreground border-t border-border pt-2">
                      Next audit: <span className="font-mono-data text-foreground">{fw.next_audit}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!compLoading && liveFrameworks.length === 0 && (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-xs text-muted-foreground">No compliance data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
