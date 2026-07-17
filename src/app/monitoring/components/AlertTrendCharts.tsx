'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,  } from 'recharts';

const alertTrendData = [
  { time: '00:00', critical: 1, high: 3, medium: 5 },
  { time: '02:00', critical: 1, high: 2, medium: 4 },
  { time: '04:00', critical: 0, high: 2, medium: 3 },
  { time: '06:00', critical: 0, high: 1, medium: 3 },
  { time: '08:00', critical: 1, high: 3, medium: 6 },
  { time: '10:00', critical: 2, high: 4, medium: 7 },
  { time: '12:00', critical: 2, high: 5, medium: 8 },
  { time: '14:00', critical: 3, high: 5, medium: 9 },
  { time: '16:00', critical: 2, high: 4, medium: 7 },
  { time: '18:00', critical: 2, high: 3, medium: 6 },
  { time: '20:00', critical: 1, high: 3, medium: 5 },
  { time: '22:00', critical: 2, high: 4, medium: 7 },
];

const detectionData = [
  { vendor: 'Paystack', kev: 2, cve: 4, posture: 1 },
  { vendor: 'Flutterwave', kev: 2, cve: 3, posture: 0 },
  { vendor: 'Interswitch', kev: 0, cve: 5, posture: 3 },
  { vendor: 'RemitaNet', kev: 0, cve: 2, posture: 1 },
  { vendor: 'GTCo', kev: 0, cve: 1, posture: 2 },
  { vendor: 'CloudPay', kev: 0, cve: 1, posture: 0 },
];

const tooltipStyle = {
  contentStyle: { background: '#111827', border: '1px solid #1F2937', borderRadius: 6, fontSize: 11 },
  labelStyle: { color: '#9CA3AF' },
};

export default function AlertTrendCharts() {
  const totalToday = 47;
  const totalYesterday = 39;
  const delta = totalToday - totalYesterday;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Alert Trend Area Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Alert Trend (24h)</h3>
            <p className="text-2xs text-muted-foreground mt-0.5">Alerts by severity over the last 24 hours</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono-data text-lg font-bold text-foreground">{totalToday}</span>
            <div className={`flex items-center gap-0.5 text-2xs font-mono-data ${delta > 0 ? 'text-status-critical' : 'text-status-low'}`}>
              {delta > 0 ? <TrendingUp size={11} /> : delta < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
              <span>{delta > 0 ? `+${delta}` : delta} vs yesterday</span>
            </div>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={alertTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gcrit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--status-critical)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--status-critical)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ghigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--status-high)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--status-high)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gmed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--status-medium)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--status-medium)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="medium" stroke="var(--status-medium)" strokeWidth={1.5} fill="url(#gmed)" name="Medium" />
              <Area type="monotone" dataKey="high" stroke="var(--status-high)" strokeWidth={1.5} fill="url(#ghigh)" name="High" />
              <Area type="monotone" dataKey="critical" stroke="var(--status-critical)" strokeWidth={2} fill="url(#gcrit)" name="Critical" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2">
          {[
            { label: 'Critical', color: 'var(--status-critical)' },
            { label: 'High', color: 'var(--status-high)' },
            { label: 'Medium', color: 'var(--status-medium)' },
          ]?.map(l => (
            <div key={l?.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l?.color }} />
              <span className="text-2xs text-muted-foreground">{l?.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Detection Metrics Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Detection Metrics by Vendor</h3>
            <p className="text-2xs text-muted-foreground mt-0.5">KEV matches, CVE hits, and posture changes</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono-data text-lg font-bold text-status-critical">4</span>
            <span className="text-2xs text-muted-foreground">KEV matches</span>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={detectionData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="vendor" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="kev" fill="var(--status-critical)" name="KEV Match" radius={[2, 2, 0, 0]} />
              <Bar dataKey="cve" fill="var(--status-high)" name="CVE Hit" radius={[2, 2, 0, 0]} />
              <Bar dataKey="posture" fill="var(--status-medium)" name="Posture Δ" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2">
          {[
            { label: 'KEV Match', color: 'var(--status-critical)' },
            { label: 'CVE Hit', color: 'var(--status-high)' },
            { label: 'Posture Δ', color: 'var(--status-medium)' },
          ]?.map(l => (
            <div key={l?.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l?.color }} />
              <span className="text-2xs text-muted-foreground">{l?.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
