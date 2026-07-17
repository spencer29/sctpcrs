'use client';

import React, { useState } from 'react';
import { Activity, CheckCircle, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';

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

const VENDORS: VendorStatus[] = [
  { id: 'v1', name: 'Paystack Integration Ltd', tier: 'T1', online: true, lastSeen: 'Live', vrs: 82, vrsDelta: +5, slaHealth: 'at-risk', slaUptime: 97.2, activeAlerts: 3, criticalAlerts: 2, detectionLatency: '1.2s', openFindings: 7, category: 'Payment Processing' },
  { id: 'v2', name: 'Flutterwave SDK Services', tier: 'T1', online: true, lastSeen: 'Live', vrs: 79, vrsDelta: +3, slaHealth: 'at-risk', slaUptime: 98.1, activeAlerts: 2, criticalAlerts: 1, detectionLatency: '0.9s', openFindings: 5, category: 'Payment Processing' },
  { id: 'v3', name: 'Interswitch Cloud Services', tier: 'T1', online: true, lastSeen: 'Live', vrs: 74, vrsDelta: +18, slaHealth: 'breached', slaUptime: 94.3, activeAlerts: 4, criticalAlerts: 2, detectionLatency: '2.1s', openFindings: 11, category: 'Cloud Infrastructure' },
  { id: 'v4', name: 'RemitaNet Technologies', tier: 'T2', online: true, lastSeen: '2m ago', vrs: 61, vrsDelta: -2, slaHealth: 'healthy', slaUptime: 99.4, activeAlerts: 1, criticalAlerts: 0, detectionLatency: '1.5s', openFindings: 3, category: 'Remittance' },
  { id: 'v5', name: 'GTCo Digital Labs', tier: 'T2', online: true, lastSeen: 'Live', vrs: 58, vrsDelta: +1, slaHealth: 'healthy', slaUptime: 99.1, activeAlerts: 1, criticalAlerts: 0, detectionLatency: '1.1s', openFindings: 4, category: 'Banking Tech' },
  { id: 'v6', name: 'Unified Payments Ltd', tier: 'T2', online: false, lastSeen: '18m ago', vrs: 67, vrsDelta: 0, slaHealth: 'at-risk', slaUptime: 96.8, activeAlerts: 2, criticalAlerts: 0, detectionLatency: '—', openFindings: 6, category: 'Payment Processing' },
  { id: 'v7', name: 'CloudPay Africa Ltd', tier: 'T2', online: true, lastSeen: 'Live', vrs: 55, vrsDelta: -1, slaHealth: 'healthy', slaUptime: 99.7, activeAlerts: 1, criticalAlerts: 0, detectionLatency: '0.8s', openFindings: 2, category: 'Cloud Payments' },
  { id: 'v8', name: 'FinEdge Analytics', tier: 'T3', online: true, lastSeen: '5m ago', vrs: 43, vrsDelta: -3, slaHealth: 'healthy', slaUptime: 99.9, activeAlerts: 0, criticalAlerts: 0, detectionLatency: '1.3s', openFindings: 1, category: 'Analytics' },
  { id: 'v9', name: 'NigeriaCloud Hosting', tier: 'T3', online: false, lastSeen: '1h ago', vrs: 71, vrsDelta: +4, slaHealth: 'breached', slaUptime: 91.2, activeAlerts: 3, criticalAlerts: 1, detectionLatency: '—', openFindings: 8, category: 'Cloud Infrastructure' },
  { id: 'v10', name: 'SecureID Africa', tier: 'T3', online: true, lastSeen: 'Live', vrs: 38, vrsDelta: 0, slaHealth: 'healthy', slaUptime: 99.8, activeAlerts: 0, criticalAlerts: 0, detectionLatency: '0.7s', openFindings: 0, category: 'Identity' },
];

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

  const handleSort = (field: keyof VendorStatus) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const filtered = VENDORS.filter(v => {
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
      ? (sortDir === 'desc' ? <ChevronDown size={11} className="text-primary" /> : <ChevronUp size={11} className="text-primary" />)
      : <ChevronDown size={11} className="text-muted-foreground opacity-40" />
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Live Vendor Status</h3>
          <span className="text-2xs font-mono-data px-1.5 py-0.5 rounded-full bg-status-low/10 text-status-low border border-status-low/30">
            {VENDORS.filter(v => v.online).length}/{VENDORS.length} Online
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'online', 'offline', 'breached'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-2xs font-medium capitalize transition-all duration-150 ${
                filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th
                className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('vrs')}
              >
                <span className="flex items-center justify-center gap-1">VRS <SortIcon field="vrs" /></span>
              </th>
              <th
                className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('slaHealth')}
              >
                <span className="flex items-center justify-center gap-1">SLA Health <SortIcon field="slaHealth" /></span>
              </th>
              <th
                className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('slaUptime')}
              >
                <span className="flex items-center justify-center gap-1">Uptime <SortIcon field="slaUptime" /></span>
              </th>
              <th
                className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('activeAlerts')}
              >
                <span className="flex items-center justify-center gap-1">Alerts <SortIcon field="activeAlerts" /></span>
              </th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Latency</th>
              <th
                className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('openFindings')}
              >
                <span className="flex items-center justify-center gap-1">Findings <SortIcon field="openFindings" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v, i) => {
              const sla = slaConfig[v.slaHealth];
              return (
                <tr
                  key={v.id}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors duration-100 ${i % 2 === 0 ? '' : 'bg-muted/5'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.online ? 'bg-status-low' : 'bg-muted-foreground'}`} />
                      <div>
                        <p className="font-medium text-foreground leading-tight">{v.name}</p>
                        <p className="text-2xs text-muted-foreground mt-0.5">{v.category}</p>
                      </div>
                      <span className={`text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded ${tierBadge(v.tier)}`}>{v.tier}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {v.online
                        ? <Wifi size={13} className="text-status-low" />
                        : <WifiOff size={13} className="text-muted-foreground" />
                      }
                      <span className={`text-2xs font-mono-data ${v.online ? 'text-status-low' : 'text-muted-foreground'}`}>
                        {v.lastSeen}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`font-mono-data font-bold text-sm ${vrsColor(v.vrs)}`}>{v.vrs}</span>
                      <span className={`text-2xs font-mono-data ${v.vrsDelta > 0 ? 'text-status-critical' : v.vrsDelta < 0 ? 'text-status-low' : 'text-muted-foreground'}`}>
                        {v.vrsDelta > 0 ? `+${v.vrsDelta}` : v.vrsDelta === 0 ? '—' : v.vrsDelta}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-2xs font-semibold px-2 py-0.5 rounded border ${sla.bg} ${sla.cls}`}>
                      {sla.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-mono-data text-xs font-semibold ${v.slaUptime >= 99 ? 'text-status-low' : v.slaUptime >= 97 ? 'text-status-medium' : 'text-status-critical'}`}>
                        {v.slaUptime}%
                      </span>
                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${v.slaUptime >= 99 ? 'bg-status-low' : v.slaUptime >= 97 ? 'bg-status-medium' : 'bg-status-critical'}`}
                          style={{ width: `${Math.max(0, (v.slaUptime - 90) / 10 * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {v.criticalAlerts > 0 && (
                        <span className="text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded bg-status-critical/10 text-status-critical border border-status-critical/30">
                          {v.criticalAlerts} CRIT
                        </span>
                      )}
                      {v.activeAlerts > 0
                        ? <span className="text-2xs font-mono-data text-status-high">{v.activeAlerts} active</span>
                        : <CheckCircle size={13} className="text-status-low" />
                      }
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="font-mono-data text-xs text-muted-foreground">{v.detectionLatency}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`font-mono-data text-xs font-semibold ${v.openFindings > 5 ? 'text-status-critical' : v.openFindings > 2 ? 'text-status-high' : v.openFindings > 0 ? 'text-status-medium' : 'text-status-low'}`}>
                      {v.openFindings}
                    </span>
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
