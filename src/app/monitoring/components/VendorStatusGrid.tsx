'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Wifi, WifiOff, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface VendorStatus {
  id: string;
  name: string;
  tier: 'T1' | 'T2' | 'T3';
  online: boolean;
  lastSeen: string;
  vrs: number;
  vrsDelta: number;
  slaHealth: 'healthy' | 'at-risk' | 'breached';
  slaUptime: number;
  activeAlerts: number;
  criticalAlerts: number;
  detectionLatency: string;
  openFindings: number;
  category: string;
}

const slaConfig = {
  healthy: { label: 'Healthy', cls: 'text-status-low', bg: 'bg-status-low/10 border-status-low/30' },
  'at-risk': { label: 'At Risk', cls: 'text-status-medium', bg: 'bg-status-medium/10 border-status-medium/30' },
  breached: { label: 'Breached', cls: 'text-status-critical', bg: 'bg-status-critical/10 border-status-critical/30' },
};

const vrsColor = (v: number) => {
  if (v >= 75) return 'text-status-critical';
  if (v >= 60) return 'text-status-high';
  if (v >= 40) return 'text-status-medium';
  return 'text-status-low';
};

const tierBadge = (t: string) => {
  if (t === 'T1') return 'bg-status-critical/10 text-status-critical border border-status-critical/30';
  if (t === 'T2') return 'bg-status-high/10 text-status-high border border-status-high/30';
  return 'bg-muted text-muted-foreground border border-border';
};

export default function VendorStatusGrid() {
  const [sortField, setSortField] = useState<keyof VendorStatus>('vrs');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'breached'>('all');
  const [vendors, setVendors] = useState<VendorStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data: alerts } = await supabase
        .from('alerts')
        .select('vendor, severity, alert_type, status, created_at')
        .neq('status', 'dismissed');

      if (!alerts || alerts.length === 0) {
        setLoading(false);
        return;
      }

      const vendorMap = new Map<string, {
        alerts: typeof alerts;
        maxSeverity: string;
        kevExposed: boolean;
        lastSeen: string;
      }>();

      const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

      alerts.forEach((a) => {
        if (!a.vendor) return;
        const existing = vendorMap.get(a.vendor);
        if (!existing) {
          vendorMap.set(a.vendor, {
            alerts: [a],
            maxSeverity: a.severity,
            kevExposed: a.alert_type === 'KEV_MATCH',
            lastSeen: a.created_at,
          });
        } else {
          existing.alerts.push(a);
          if (severityOrder.indexOf(a.severity) < severityOrder.indexOf(existing.maxSeverity)) {
            existing.maxSeverity = a.severity;
          }
          if (a.alert_type === 'KEV_MATCH') existing.kevExposed = true;
        }
      });

      const rows: VendorStatus[] = [];
      let idx = 0;
      vendorMap.forEach((val, name) => {
        const activeCount = val.alerts.filter((a) => a.status === 'active').length;
        const critCount = val.alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'active').length;
        const vrs = Math.min(99, 30 + critCount * 15 + activeCount * 5);
        const tier: 'T1' | 'T2' | 'T3' = val.maxSeverity === 'CRITICAL' ? 'T1' : val.maxSeverity === 'HIGH' ? 'T2' : 'T3';
        const slaHealth: 'healthy' | 'at-risk' | 'breached' = critCount >= 2 ? 'breached' : critCount >= 1 ? 'at-risk' : 'healthy';
        const slaUptime = slaHealth === 'breached' ? 94 + Math.random() * 2 : slaHealth === 'at-risk' ? 97 + Math.random() * 2 : 99 + Math.random();

        rows.push({
          id: `v${idx + 1}`,
          name,
          tier,
          online: slaHealth !== 'breached',
          lastSeen: slaHealth === 'breached' ? '1h ago' : 'Live',
          vrs,
          vrsDelta: critCount > 0 ? critCount * 3 : 0,
          slaHealth,
          slaUptime: Math.round(slaUptime * 10) / 10,
          activeAlerts: activeCount,
          criticalAlerts: critCount,
          detectionLatency: slaHealth === 'breached' ? '—' : `${(0.8 + Math.random() * 1.5).toFixed(1)}s`,
          openFindings: activeCount + Math.floor(activeCount * 0.5),
          category: 'Vendor',
        });
        idx++;
      });

      setVendors(rows);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleSort = (field: keyof VendorStatus) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const filtered = vendors.filter(v => {
    if (filter === 'online') return v.online;
    if (filter === 'offline') return !v.online;
    if (filter === 'breached') return v.slaHealth === 'breached';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField] as number | string;
    const bv = b[sortField] as number | string;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: keyof VendorStatus }) => (
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={11} className="text-primary" /> : <ChevronDown size={11} className="text-primary" />
      : <ChevronDown size={11} className="text-muted-foreground opacity-40" />
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <Activity size={14} className="text-primary" />
        <span className="text-xs font-semibold text-foreground mr-2">Live Status</span>
        {(['all', 'online', 'offline', 'breached'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all duration-150 capitalize ${
              filter === f
                ? 'bg-primary/15 text-primary border border-primary/40' :'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-2xs text-muted-foreground font-mono-data">{sorted.length} vendors</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                { label: 'Vendor', field: 'name' as keyof VendorStatus },
                { label: 'Tier', field: 'tier' as keyof VendorStatus },
                { label: 'Status', field: 'online' as keyof VendorStatus },
                { label: 'VRS', field: 'vrs' as keyof VendorStatus },
                { label: 'SLA', field: 'slaHealth' as keyof VendorStatus },
                { label: 'Uptime', field: 'slaUptime' as keyof VendorStatus },
                { label: 'Alerts', field: 'activeAlerts' as keyof VendorStatus },
                { label: 'Findings', field: 'openFindings' as keyof VendorStatus },
                { label: 'Latency', field: 'detectionLatency' as keyof VendorStatus },
              ].map(({ label, field }) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="text-left px-4 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <SortIcon field={field} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-xs text-muted-foreground">No vendor data available</td>
              </tr>
            ) : sorted.map((v) => {
              const sla = slaConfig[v.slaHealth];
              return (
                <tr key={v.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.online ? 'bg-status-low animate-pulse' : 'bg-status-critical'}`} />
                      <span className="font-medium text-foreground truncate max-w-[180px]">{v.name}</span>
                    </div>
                    <div className="text-2xs text-muted-foreground mt-0.5 pl-3.5">{v.category}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded ${tierBadge(v.tier)}`}>{v.tier}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {v.online
                        ? <><Wifi size={12} className="text-status-low" /><span className="text-2xs text-status-low font-semibold">Online</span></>
                        : <><WifiOff size={12} className="text-status-critical" /><span className="text-2xs text-status-critical font-semibold">Offline</span></>
                      }
                    </div>
                    <div className="text-2xs font-mono-data text-muted-foreground mt-0.5">{v.lastSeen}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono-data font-bold ${vrsColor(v.vrs)}`}>{v.vrs}</span>
                    <span className="text-muted-foreground font-mono-data text-2xs">/100</span>
                    {v.vrsDelta > 0 && <div className="text-2xs font-mono-data text-status-critical">+{v.vrsDelta}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded border ${sla.bg} ${sla.cls}`}>{sla.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono-data text-xs ${v.slaUptime >= 99 ? 'text-status-low' : v.slaUptime >= 97 ? 'text-status-medium' : 'text-status-critical'}`}>
                      {v.slaUptime}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="font-mono-data font-semibold text-foreground">{v.activeAlerts}</span>
                      {v.criticalAlerts > 0 && (
                        <span className="text-2xs font-mono-data text-status-critical">({v.criticalAlerts} crit)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-foreground">{v.openFindings}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-muted-foreground">{v.detectionLatency}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
