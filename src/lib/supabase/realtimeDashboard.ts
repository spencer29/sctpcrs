'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbIncident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  vendor: string;
  detected_at: string;
  assignee: string;
  created_at: string;
  updated_at: string;
}

export interface DbTimelineEvent {
  id: string;
  incident_id: string;
  event_timestamp: string;
  event_type: 'detected' | 'triaged' | 'escalated' | 'assigned' | 'update' | 'resolved' | 'comment';
  actor: string;
  title: string;
  detail?: string;
  created_at: string;
}

export interface DbAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  alert_type: 'KEV_MATCH' | 'COMPLIANCE' | 'CVE_MATCH' | 'CERT_EXPIRY' | 'VRS_SPIKE' | 'QUESTIONNAIRE_OVERDUE';
  title: string;
  vendor: string;
  time_label: string;
  status: 'active' | 'acknowledged' | 'dismissed' | 'escalated';
  cve_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DbComplianceFramework {
  id: string;
  name: string;
  short_name: string;
  category: string;
  total_vendors: number;
  compliant: number;
  partial: number;
  non_compliant: number;
  pending: number;
  overall_score: number;
  trend: 'up' | 'down' | 'stable';
  trend_delta: number;
  next_audit: string;
  updated_at: string;
}

// ─── Incidents + Timeline Hook ────────────────────────────────────────────────

export function useRealtimeIncidents() {
  const [incidents, setIncidents] = useState<DbIncident[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<DbTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    try {
      const [incResult, evResult] = await Promise.all([
        supabase.from('incidents').select('*').order('created_at', { ascending: false }),
        supabase.from('incident_timeline_events').select('*').order('event_timestamp', { ascending: true }),
      ]);

      const incData = incResult.data;
      const incErr = incResult.error;
      const evData = evResult.data;
      const evErr = evResult.error;

      if (incErr) {
        setError(incErr.message);
        return;
      }
      if (evErr) {
        setError(evErr.message);
        return;
      }

      setIncidents((incData as DbIncident[]) || []);
      setTimelineEvents((evData as DbTimelineEvent[]) || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch — re-runs only when fetchAll identity changes (stable)
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Realtime subscription — empty deps so it only mounts/unmounts once
  useEffect(() => {
    const supabase = createClient();

    const incidentChannel = supabase
      .channel('incidents_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIncidents((prev) => [payload.new as DbIncident, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIncidents((prev) =>
            prev.map((inc) => (inc.id === (payload.new as DbIncident).id ? (payload.new as DbIncident) : inc))
          );
        } else if (payload.eventType === 'DELETE') {
          setIncidents((prev) => prev.filter((inc) => inc.id !== (payload.old as DbIncident).id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_timeline_events' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTimelineEvents((prev) => [...prev, payload.new as DbTimelineEvent]);
        } else if (payload.eventType === 'UPDATE') {
          setTimelineEvents((prev) =>
            prev.map((ev) => {
              const updated = payload.new as DbTimelineEvent;
              return ev.id === updated.id && ev.incident_id === updated.incident_id ? updated : ev;
            })
          );
        } else if (payload.eventType === 'DELETE') {
          const deleted = payload.old as DbTimelineEvent;
          setTimelineEvents((prev) =>
            prev.filter((ev) => !(ev.id === deleted.id && ev.incident_id === deleted.incident_id))
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(incidentChannel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { incidents, timelineEvents, loading, error, refetch: fetchAll };
}

// ─── Alerts Hook ──────────────────────────────────────────────────────────────

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<DbAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error: err } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        setError(err.message);
        return;
      }
      setAlerts((data as DbAlert[]) || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch — re-runs only when fetchAlerts identity changes (stable)
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Realtime subscription — empty deps so it only mounts/unmounts once
  useEffect(() => {
    const supabase = createClient();

    const alertChannel = supabase
      .channel('alerts_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAlerts((prev) => [payload.new as DbAlert, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setAlerts((prev) =>
            prev.map((a) => (a.id === (payload.new as DbAlert).id ? (payload.new as DbAlert) : a))
          );
        } else if (payload.eventType === 'DELETE') {
          setAlerts((prev) => prev.filter((a) => a.id !== (payload.old as DbAlert).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(alertChannel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateAlertStatus = useCallback(
    async (ids: string[], status: DbAlert['status']) => {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('alerts')
        .update({ status })
        .in('id', ids);
      if (err) {
        setError(err.message);
      }
    },
    []
  );

  return { alerts, loading, error, refetch: fetchAlerts, updateAlertStatus };
}

// ─── Compliance Hook ──────────────────────────────────────────────────────────

export function useRealtimeCompliance() {
  const [frameworks, setFrameworks] = useState<DbComplianceFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFrameworks = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error: err } = await supabase
        .from('compliance_frameworks')
        .select('*')
        .order('overall_score', { ascending: false });

      if (err) {
        setError(err.message);
        return;
      }
      setFrameworks((data as DbComplianceFramework[]) || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch — re-runs only when fetchFrameworks identity changes (stable)
  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  // Realtime subscription — empty deps so it only mounts/unmounts once
  useEffect(() => {
    const supabase = createClient();

    const complianceChannel = supabase
      .channel('compliance_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'compliance_frameworks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setFrameworks((prev) => [...prev, payload.new as DbComplianceFramework]);
        } else if (payload.eventType === 'UPDATE') {
          setFrameworks((prev) =>
            prev.map((fw) =>
              fw.id === (payload.new as DbComplianceFramework).id ? (payload.new as DbComplianceFramework) : fw
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setFrameworks((prev) => prev.filter((fw) => fw.id !== (payload.old as DbComplianceFramework).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(complianceChannel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { frameworks, loading, error, refetch: fetchFrameworks };
}
