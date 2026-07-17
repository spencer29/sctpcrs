'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// Backend integration point: GET /api/v1/assessments/scores/portfolio?period=30d
const vrsTrendData = [
  { date: 'Jun 17', vrs: 52, critical: 3, alerts: 2 },
  { date: 'Jun 19', vrs: 55, critical: 3, alerts: 3 },
  { date: 'Jun 21', vrs: 53, critical: 4, alerts: 2 },
  { date: 'Jun 23', vrs: 49, critical: 3, alerts: 1 },
  { date: 'Jun 25', vrs: 51, critical: 3, alerts: 2 },
  { date: 'Jun 27', vrs: 58, critical: 4, alerts: 5 },
  { date: 'Jun 29', vrs: 62, critical: 5, alerts: 7 },
  { date: 'Jul 01', vrs: 60, critical: 4, alerts: 4 },
  { date: 'Jul 03', vrs: 57, critical: 4, alerts: 3 },
  { date: 'Jul 05', vrs: 54, critical: 3, alerts: 2 },
  { date: 'Jul 07', vrs: 52, critical: 3, alerts: 2 },
  { date: 'Jul 09', vrs: 56, critical: 4, alerts: 4 },
  { date: 'Jul 11', vrs: 59, critical: 4, alerts: 5 },
  { date: 'Jul 13', vrs: 63, critical: 5, alerts: 8 },
  { date: 'Jul 15', vrs: 61, critical: 4, alerts: 6 },
  { date: 'Jul 17', vrs: 61, critical: 4, alerts: 6 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs space-y-1.5 min-w-[160px]">
      <p className="font-semibold text-foreground border-b border-border pb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={`tooltip-${entry.dataKey}`} className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground capitalize">{entry.dataKey === 'vrs' ? 'Portfolio VRS' : entry.dataKey}</span>
          <span className="font-mono-data font-semibold" style={{ color: entry.color }}>
            {entry.dataKey === 'vrs' ? `${entry.value}/100` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function VrsTrendChart() {
  return (
    <div className="card-elevated p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Portfolio VRS — 30-Day Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Weighted composite score across all active vendors</p>
        </div>
        <div className="flex items-center gap-4 text-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-primary rounded" />
            <span className="text-muted-foreground">VRS Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-status-critical/60 rounded border-dashed" />
            <span className="text-muted-foreground">Risk threshold (50)</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={vrsTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="vrsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            interval={2}
          />
          <YAxis
            domain={[40, 75]}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={50}
            stroke="var(--status-critical)"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="vrs"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#vrsGradient)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}