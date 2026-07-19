'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useRealtimeAlerts, DbAlert } from '@/lib/supabase/realtimeDashboard';

const severityConfig = {
  CRITICAL: { label: 'CRIT', class: 'badge-critical', dot: 'bg-status-critical alert-pulse' },
  HIGH: { label: 'HIGH', class: 'badge-high', dot: 'bg-status-high' },
  MEDIUM: { label: 'MED', class: 'badge-medium', dot: 'bg-status-medium' },
  LOW: { label: 'LOW', class: 'badge-low', dot: 'bg-status-low' },
};

function requestBrowserNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function fireBrowserNotification(alert: DbAlert) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  const body = alert.vendor ? `${alert.vendor} · ${alert.time_label}` : alert.time_label;
  try {
    new Notification(`[${alert.severity}] ${alert.title}`, {
      body,
      icon: '/favicon.ico',
      tag: alert.id,
    });
  } catch {
    // Notification API not available in this context
  }
}

export default function AlertFeedPanel() {
  const { alerts, loading, error, updateAlertStatus } = useRealtimeAlerts();
  const prevAlertIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  // Request browser notification permission on mount
  useEffect(() => {
    requestBrowserNotificationPermission();
  }, []);

  // Fire browser notifications for newly inserted alerts (not on initial load)
  useEffect(() => {
    if (loading) return;

    if (isFirstLoad.current) {
      // Seed the known IDs on first load — don't notify for existing alerts
      prevAlertIdsRef.current = new Set(alerts.map((a) => a.id));
      isFirstLoad.current = false;
      return;
    }

    alerts.forEach((alert) => {
      if (!prevAlertIdsRef.current.has(alert.id)) {
        // New alert arrived via realtime INSERT
        fireBrowserNotification(alert);
        prevAlertIdsRef.current.add(alert.id);
      }
    });
  }, [alerts, loading]);

  const handleAck = async (id: string) => {
    await updateAlertStatus([id], 'acknowledged');
  };

  const activeAlerts = alerts.filter((a) => a.status !== 'dismissed');
  const unackedCount = activeAlerts.filter((a) => a.status === 'active').length;

  return (
    <div className="card-elevated p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
          {loading ? (
            <Loader2 size={12} className="animate-spin text-muted-foreground" />
          ) : (
            <span className="text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded-full bg-status-critical text-white">
              {unackedCount}
            </span>
          )}
        </div>
        <button className="text-2xs text-primary hover:text-primary/80 font-medium transition-colors">
          View All →
        </button>
      </div>

      <div className="space-y-1 overflow-y-auto max-h-[280px]">
        {error && (
          <p className="text-xs text-status-critical px-2 py-1">{error}</p>
        )}
        {!loading && activeAlerts.length === 0 && !error && (
          <p className="text-xs text-muted-foreground px-2 py-4 text-center">No active alerts</p>
        )}
        {activeAlerts.map((alert) => {
          const cfg = severityConfig[alert.severity] ?? severityConfig.LOW;
          const isAcked = alert.status !== 'active';

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
                    {alert.time_label}
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