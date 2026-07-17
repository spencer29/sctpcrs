'use client';

import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// Backend integration point: GET /api/v1/vendors?aggregate=tier_distribution
const tierData = [
  { name: 'LOW', value: 10, fill: 'var(--status-low)', pct: 21 },
  { name: 'MEDIUM', value: 22, fill: 'var(--status-medium)', pct: 47 },
  { name: 'HIGH', value: 11, fill: 'var(--status-high)', pct: 23 },
  { name: 'CRITICAL', value: 4, fill: 'var(--status-critical)', pct: 8 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg p-2.5 shadow-xl text-xs">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p className="font-mono-data text-muted-foreground">{d.value} vendors · {d.pct}%</p>
    </div>
  );
};

export default function RiskTierRadial() {
  return (
    <div className="card-elevated p-5 h-full">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Vendor Risk Tier Distribution</h3>
        <p className="text-xs text-muted-foreground mt-0.5">47 active vendors by risk tier</p>
      </div>

      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart
            innerRadius="35%"
            outerRadius="90%"
            data={tierData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={4}
              background={{ fill: 'var(--muted)' }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="w-full mt-2 space-y-2">
          {[...tierData].reverse().map((tier) => (
            <div key={`tier-legend-${tier.name}`} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: tier.fill }} />
                <span className="text-xs text-muted-foreground">{tier.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono-data text-foreground font-semibold">{tier.value}</span>
                <span className="text-2xs font-mono-data text-muted-foreground w-8 text-right">{tier.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}