'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckSquare,
  Square,
  RefreshCw,
  Building2,
  UserCog,
  AlertTriangle,
  Eye,
  Settings,
  Lock,
  ChevronDown,
  X,
  CheckCheck,
  Clock,
  Info,
  Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType =
  | 'vendor_assessment'
  | 'threat_lookup' |'role_change' |'policy_violation' |'access_attempt' |'config_change';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type EventStatus = 'new' | 'acknowledged' | 'resolved' | 'dismissed';

interface SecurityEvent {
  id: string;
  event_type: EventType;
  severity: Severity;
  status: EventStatus;
  title: string;
  description: string | null;
  actor: string;
  target: string | null;
  vendor: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Config maps ──────────────────────────────────────────────────────────────

const severityConfig: Record<Severity, { cls: string; dot: string; label: string }> = {
  critical: { cls: 'bg-status-critical/10 text-status-critical border-status-critical/30', dot: 'bg-status-critical alert-pulse', label: 'Critical' },
  high:     { cls: 'bg-status-high/10 text-status-high border-status-high/30',             dot: 'bg-status-high',             label: 'High' },
  medium:   { cls: 'bg-status-medium/10 text-status-medium border-status-medium/30',       dot: 'bg-status-medium',           label: 'Medium' },
  low:      { cls: 'bg-status-low/10 text-status-low border-status-low/30',                dot: 'bg-status-low',              label: 'Low' },
  info:     { cls: 'bg-status-info/10 text-status-info border-status-info/30',             dot: 'bg-status-info',             label: 'Info' },
};

const statusConfig: Record<EventStatus, { cls: string; label: string }> = {
  new:          { cls: 'bg-status-critical/10 text-status-critical border-status-critical/30', label: 'New' },
  acknowledged: { cls: 'bg-status-medium/10 text-status-medium border-status-medium/30',       label: 'Acknowledged' },
  resolved:     { cls: 'bg-status-low/10 text-status-low border-status-low/30',                label: 'Resolved' },
  dismissed:    { cls: 'bg-muted text-muted-foreground border-border',                         label: 'Dismissed' },
};

const eventTypeConfig: Record<EventType, { label: string; icon: React.ReactNode; color: string }> = {
  vendor_assessment: { label: 'Vendor Assessment', icon: <Building2 size={13} />,  color: 'text-status-info' },
  threat_lookup:     { label: 'Threat Lookup',     icon: <Zap size={13} />,        color: 'text-status-critical' },
  role_change:       { label: 'Role Change',       icon: <UserCog size={13} />,    color: 'text-status-medium' },
  policy_violation:  { label: 'Policy Violation',  icon: <AlertTriangle size={13} />, color: 'text-status-high' },
  access_attempt:    { label: 'Access Attempt',    icon: <Lock size={13} />,       color: 'text-status-high' },
  config_change:     { label: 'Config Change',     icon: <Settings size={13} />,   color: 'text-status-low' },
};

const EVENT_TYPES: EventType[] = ['vendor_assessment', 'threat_lookup', 'role_change', 'policy_violation', 'access_attempt', 'config_change'];
const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState('Just now');
  const [showFilters, setShowFilters] = useState(false);
  const [times, setTimes] = useState<Record<string, string>>({});
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error: err } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (err) throw err;
      setEvents(data ?? []);
      setLastRefresh('Just now');
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    fetchEvents();
    const supabase = createClient();
    const ch = supabase
      .channel('security_events_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'security_events' }, () => {
        fetchEvents();
      })
      .subscribe();
    channelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
    };
  }, [fetchEvents]);

  // ── Relative times (client-only, updated every minute) ────────────────────
  useEffect(() => {
    const compute = () => {
      const map: Record<string, string> = {};
      events.forEach((e) => { map[e.id] = relativeTime(e.created_at); });
      setTimes(map);
    };
    compute();
    const interval = setInterval(compute, 60000);
    return () => clearInterval(interval);
  }, [events]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = events.filter((e) => {
    if (typeFilter !== 'all' && e.event_type !== typeFilter) return false;
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (e.description ?? '').toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        (e.vendor ?? '').toLowerCase().includes(q) ||
        (e.target ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Selection helpers ──────────────────────────────────────────────────────
  const allNewIds = filtered.filter((e) => e.status === 'new').map((e) => e.id);
  const allSelected = allNewIds.length > 0 && allNewIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allNewIds));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Bulk acknowledge ───────────────────────────────────────────────────────
  const bulkAcknowledge = async () => {
    if (!someSelected) return;
    setBulkLoading(true);
    const supabase = createClient();
    try {
      const ids = Array.from(selected);
      const { error: err } = await supabase
        .from('security_events')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: 'current_user',
        })
        .in('id', ids);
      if (err) throw err;
      setSelected(new Set());
      await fetchEvents();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Bulk acknowledge failed');
    } finally {
      setBulkLoading(false);
    }
  };

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const newCount      = events.filter((e) => e.status === 'new').length;
  const criticalCount = events.filter((e) => e.severity === 'critical' && e.status === 'new').length;
  const highCount     = events.filter((e) => e.severity === 'high' && e.status === 'new').length;
  const ackCount      = events.filter((e) => e.status === 'acknowledged').length;

  const kpis = [
    { label: 'New Events',       value: newCount,      cls: 'text-status-critical', border: 'border-status-critical/30', icon: <AlertTriangle size={15} className="text-status-critical" /> },
    { label: 'Critical',         value: criticalCount, cls: 'text-status-critical', border: 'border-status-critical/30', icon: <Zap size={15} className="text-status-critical" /> },
    { label: 'High Severity',    value: highCount,     cls: 'text-status-high',     border: 'border-status-high/30',     icon: <ShieldAlert size={15} className="text-status-high" /> },
    { label: 'Acknowledged',     value: ackCount,      cls: 'text-status-medium',   border: 'border-status-medium/30',   icon: <CheckCheck size={15} className="text-status-medium" /> },
    { label: 'Total Events',     value: events.length, cls: 'text-foreground',      border: 'border-border',             icon: <Eye size={15} className="text-muted-foreground" /> },
  ];

  return (
    <AppLayout>
      <div className="space-y-5 fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert size={20} className="text-primary" />
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Security Events</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-low/10 border border-status-low/30">
                <span className="w-1.5 h-1.5 rounded-full bg-status-low animate-pulse" />
                <span className="text-2xs font-semibold text-status-low">LIVE</span>
              </span>
              {newCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-critical/10 border border-status-critical/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-critical alert-pulse" />
                  <span className="text-2xs font-semibold text-status-critical">{newCount} NEW</span>
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live platform security event log — vendor assessments, threat lookups, role changes, policy violations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted border border-border text-xs text-muted-foreground">
              <RefreshCw size={12} />
              <span>{lastRefresh}</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-status-high/10 border border-status-high/30 text-xs text-status-high">
            <AlertTriangle size={13} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X size={13} /></button>
          </div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-5 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className={`bg-card border ${k.border} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">{k.icon}</div>
              <p className={`text-2xl font-bold font-mono-data ${k.cls}`}>{k.value}</p>
              <p className="text-xs font-medium text-foreground mt-1 leading-tight">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events, actors, vendors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters || typeFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all' ?'bg-primary/10 border-primary/30 text-primary' :'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Filter size={14} />
            Filters
            {(typeFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all') && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-2xs flex items-center justify-center font-bold">
                {[typeFilter !== 'all', severityFilter !== 'all', statusFilter !== 'all'].filter(Boolean).length}
              </span>
            )}
            <ChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Bulk acknowledge */}
          {someSelected && (
            <button
              onClick={bulkAcknowledge}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <CheckCheck size={14} />
              {bulkLoading ? 'Acknowledging…' : `Acknowledge ${selected.size}`}
            </button>
          )}

          <span className="ml-auto text-xs text-muted-foreground font-mono-data">
            {filtered.length} / {events.length} events
          </span>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="flex items-center gap-4 flex-wrap px-4 py-3 bg-card border border-border rounded-xl">
            {/* Event type */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Type:</span>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${typeFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`}
                >
                  All
                </button>
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${typeFilter === t ? 'bg-primary text-white border-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    {eventTypeConfig[t].icon}
                    {eventTypeConfig[t].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Severity:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSeverityFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${severityFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`}
                >
                  All
                </button>
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverityFilter(s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${severityFilter === s ? `${severityConfig[s].cls} border-current` : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    {severityConfig[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
              <div className="flex items-center gap-1">
                {(['all', 'new', 'acknowledged', 'resolved', 'dismissed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    {s === 'all' ? 'All' : statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setTypeFilter('all'); setSeverityFilter('all'); setStatusFilter('all'); }}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X size={12} /> Clear all
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
            <button onClick={toggleAll} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              {allSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
            </button>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">Event</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28 hidden lg:block">Type</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Severity</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Status</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28 hidden md:block">Actor</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20 text-right">Time</span>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
              <RefreshCw size={15} className="animate-spin" />
              Loading security events…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <ShieldAlert size={28} className="opacity-30" />
              <span className="text-sm">No events match your filters</span>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((event) => {
                const sev = severityConfig[event.severity];
                const stat = statusConfig[event.status];
                const evType = eventTypeConfig[event.event_type];
                const isSelected = selected.has(event.id);
                const isNew = event.status === 'new';

                return (
                  <li
                    key={event.id}
                    className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                  >
                    {/* Checkbox — only for new events */}
                    <button
                      onClick={() => isNew && toggleOne(event.id)}
                      className={`flex-shrink-0 transition-colors ${isNew ? 'text-muted-foreground hover:text-primary cursor-pointer' : 'text-transparent cursor-default'}`}
                    >
                      {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                    </button>

                    {/* Severity dot + title */}
                    <div className="flex-1 min-w-0 flex items-start gap-2.5">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug truncate">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.description}</p>
                        )}
                        {(event.vendor || event.target) && (
                          <div className="flex items-center gap-2 mt-1">
                            {event.vendor && (
                              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                                <Building2 size={10} />
                                {event.vendor}
                              </span>
                            )}
                            {event.ip_address && (
                              <span className="text-2xs font-mono-data text-muted-foreground">{event.ip_address}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Type */}
                    <div className={`hidden lg:flex items-center gap-1.5 w-28 text-xs font-medium ${evType.color}`}>
                      {evType.icon}
                      <span className="truncate">{evType.label}</span>
                    </div>

                    {/* Severity badge */}
                    <div className="w-20">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold border ${sev.cls}`}>
                        {sev.label}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="w-24">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold border ${stat.cls}`}>
                        {event.status === 'acknowledged' && <Clock size={9} />}
                        {event.status === 'resolved' && <CheckCheck size={9} />}
                        {event.status === 'new' && <Info size={9} />}
                        {stat.label}
                      </span>
                    </div>

                    {/* Actor */}
                    <div className="hidden md:block w-28">
                      <span className="text-xs text-muted-foreground truncate block" title={event.actor}>{event.actor}</span>
                    </div>

                    {/* Time */}
                    <div className="w-20 text-right">
                      <span className="text-xs text-muted-foreground font-mono-data">{times[event.id] ?? '…'}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
