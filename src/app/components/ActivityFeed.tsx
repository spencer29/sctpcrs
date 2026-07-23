'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Building2, ShieldCheck, AlertTriangle, FileText, Activity, GitBranch, Clock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ActivityItem {
  id: string;
  type: string;
  text: string;
  time: string;
  iconType: 'alert' | 'activity' | 'git' | 'file' | 'building' | 'shield';
  colorClass: string;
}

const iconMap = {
  alert: <AlertTriangle size={13} />,
  activity: <Activity size={13} />,
  git: <GitBranch size={13} />,
  file: <FileText size={13} />,
  building: <Building2 size={13} />,
  shield: <ShieldCheck size={13} />,
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    const supabase = createClient();
    try {
      const [alertsResult, incidentsResult] = await Promise.all([
        supabase
          .from('alerts')
          .select('id, alert_type, title, vendor, severity, status, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('incidents')
          .select('id, title, severity, status, vendor, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      const alerts = alertsResult.data || [];
      const incidents = incidentsResult.data || [];

      const alertItems: ActivityItem[] = alerts.map((a) => {
        let iconType: ActivityItem['iconType'] = 'alert';
        let colorClass = 'text-status-high bg-status-high/20';
        let text = `${a.title}`;

        if (a.alert_type === 'KEV_MATCH') {
          iconType = 'alert';
          colorClass = 'text-status-critical bg-status-critical/20';
          text = `KEV alert triggered for ${a.vendor}`;
        } else if (a.alert_type === 'VRS_SPIKE') {
          iconType = 'activity';
          colorClass = 'text-status-high bg-status-high/20';
          text = `VRS spike detected: ${a.vendor}`;
        } else if (a.alert_type === 'COMPLIANCE') {
          iconType = 'shield';
          colorClass = 'text-primary bg-primary/20';
          text = `Compliance alert: ${a.title}`;
        } else if (a.alert_type === 'CERT_EXPIRY') {
          iconType = 'alert';
          colorClass = 'text-status-medium bg-status-medium/20';
          text = `Certificate expiry alert: ${a.vendor}`;
        } else if (a.alert_type === 'QUESTIONNAIRE_OVERDUE') {
          iconType = 'file';
          colorClass = 'text-status-info bg-status-info/20';
          text = `Questionnaire overdue: ${a.vendor}`;
        } else if (a.alert_type === 'CVE_MATCH') {
          iconType = 'git';
          colorClass = 'text-status-info bg-status-info/20';
          text = `CVE match detected: ${a.vendor}`;
        }

        return {
          id: `alert-${a.id}`,
          type: a.alert_type,
          text,
          time: timeAgo(a.created_at),
          iconType,
          colorClass,
        };
      });

      const incidentItems: ActivityItem[] = incidents.map((inc) => {
        let colorClass =
          inc.severity === 'critical' ?'text-status-critical bg-status-critical/20'
            : inc.severity === 'high' ?'text-status-high bg-status-high/20' :'text-muted-foreground bg-muted';

        return {
          id: `inc-${inc.id}`,
          type: 'incident',
          text: `Incident ${inc.status === 'resolved' ? 'resolved' : 'active'}: ${inc.title}`,
          time: timeAgo(inc.updated_at || inc.created_at),
          iconType: 'alert' as const,
          colorClass,
        };
      });

      // Merge and sort by recency (alerts first since they have more granular times)
      const merged = [...alertItems, ...incidentItems].slice(0, 8);
      setActivities(merged);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="card-elevated p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">System Activity</h3>
        <button className="text-2xs text-primary hover:text-primary/80 font-medium transition-colors">
          Full log →
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No recent activity</p>
      ) : (
        <div className="space-y-3 overflow-y-auto">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-2.5 group">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${act.colorClass}`}>
                {iconMap[act.iconType]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/80 leading-snug">{act.text}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={9} className="text-muted-foreground" />
                  <span className="text-2xs font-mono-data text-muted-foreground">{act.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}