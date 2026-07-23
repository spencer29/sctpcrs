'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock, Shield } from 'lucide-react';

interface SlaEntry {
  id: string;
  vendor: string;
  tier: 'T1' | 'T2' | 'T3';
  sloTarget: number;
  actualUptime: number;
  mttr: string;
  lastIncident: string;
  status: 'healthy' | 'at-risk' | 'breached';
  daysToReview: number;
}

const SLA_DATA: SlaEntry[] = [
  { id: 's1', vendor: 'Paystack Integration Ltd', tier: 'T1', sloTarget: 99.9, actualUptime: 97.2, mttr: '4.2h', lastIncident: '3d ago', status: 'at-risk', daysToReview: 12 },
  { id: 's2', vendor: 'Flutterwave SDK Services', tier: 'T1', sloTarget: 99.9, actualUptime: 98.1, mttr: '2.8h', lastIncident: '7d ago', status: 'at-risk', daysToReview: 18 },
  { id: 's3', vendor: 'Interswitch Cloud Services', tier: 'T1', sloTarget: 99.9, actualUptime: 94.3, mttr: '8.1h', lastIncident: '1d ago', status: 'breached', daysToReview: 2 },
  { id: 's4', vendor: 'RemitaNet Technologies', tier: 'T2', sloTarget: 99.5, actualUptime: 99.4, mttr: '1.5h', lastIncident: '14d ago', status: 'healthy', daysToReview: 30 },
  { id: 's5', vendor: 'GTCo Digital Labs', tier: 'T2', sloTarget: 99.5, actualUptime: 99.1, mttr: '1.9h', lastIncident: '10d ago', status: 'healthy', daysToReview: 25 },
  { id: 's6', vendor: 'Unified Payments Ltd', tier: 'T2', sloTarget: 99.5, actualUptime: 96.8, mttr: '5.3h', lastIncident: '2d ago', status: 'at-risk', daysToReview: 8 },
  { id: 's7', vendor: 'NigeriaCloud Hosting', tier: 'T3', sloTarget: 99.0, actualUptime: 91.2, mttr: '12.4h', lastIncident: '1d ago', status: 'breached', daysToReview: 1 },
  { id: 's8', vendor: 'CloudPay Africa Ltd', tier: 'T2', sloTarget: 99.5, actualUptime: 99.7, mttr: '0.9h', lastIncident: '21d ago', status: 'healthy', daysToReview: 45 },
];

const statusIcon = (s: SlaEntry['status']) => {
  if (s === 'healthy') return <CheckCircle size={14} className="text-status-low" />;
  if (s === 'at-risk') return <AlertTriangle size={14} className="text-status-medium" />;
  return <XCircle size={14} className="text-status-critical" />;
};

const statusLabel = (s: SlaEntry['status']) => {
  if (s === 'healthy') return <span className="text-2xs font-semibold text-status-low">Healthy</span>;
  if (s === 'at-risk') return <span className="text-2xs font-semibold text-status-medium">At Risk</span>;
  return <span className="text-2xs font-semibold text-status-critical">Breached</span>;
};

const uptimeColor = (actual: number, target: number) => {
  const gap = target - actual;
  if (gap <= 0) return 'text-status-low';
  if (gap <= 1) return 'text-status-medium';
  return 'text-status-critical';
};

export default function SlaHealthPanel() {
  const breached = SLA_DATA.filter(s => s.status === 'breached').length;
  const atRisk = SLA_DATA.filter(s => s.status === 'at-risk').length;
  const healthy = SLA_DATA.filter(s => s.status === 'healthy').length;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield size={15} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">SLA Health Monitor</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-critical" />
            <span className="text-2xs text-muted-foreground">{breached} Breached</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-medium" />
            <span className="text-2xs text-muted-foreground">{atRisk} At Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-low" />
            <span className="text-2xs text-muted-foreground">{healthy} Healthy</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">SLO Target</th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Actual Uptime</th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">MTTR</th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Last Incident</th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Review In</th>
            </tr>
          </thead>
          <tbody>
            {SLA_DATA.sort((a, b) => {
              const order = { breached: 0, 'at-risk': 1, healthy: 2 };
              return order[a.status] - order[b.status];
            }).map((entry, i) => (
              <tr
                key={entry.id}
                className={`border-b border-border/50 hover:bg-muted/20 transition-colors duration-100 ${
                  entry.status === 'breached' ? 'bg-status-critical/3' : i % 2 === 0 ? '' : 'bg-muted/5'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{entry.vendor}</span>
                    <span className={`text-2xs font-mono-data px-1 py-0.5 rounded ${
                      entry.tier === 'T1' ? 'bg-status-critical/10 text-status-critical' :
                      entry.tier === 'T2'? 'bg-status-high/10 text-status-high' : 'bg-muted text-muted-foreground'
                    }`}>{entry.tier}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {statusIcon(entry.status)}
                    {statusLabel(entry.status)}
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="font-mono-data text-xs text-muted-foreground">{entry.sloTarget}%</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`font-mono-data text-xs font-semibold ${uptimeColor(entry.actualUptime, entry.sloTarget)}`}>
                    {entry.actualUptime}%
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`font-mono-data text-xs ${parseFloat(entry.mttr) > 6 ? 'text-status-critical' : parseFloat(entry.mttr) > 3 ? 'text-status-medium' : 'text-status-low'}`}>
                    {entry.mttr}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock size={11} className="text-muted-foreground" />
                    <span className="text-2xs font-mono-data text-muted-foreground">{entry.lastIncident}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`text-2xs font-mono-data font-semibold ${entry.daysToReview <= 7 ? 'text-status-critical' : entry.daysToReview <= 14 ? 'text-status-medium' : 'text-muted-foreground'}`}>
                    {entry.daysToReview}d
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
