'use client';

import React from 'react';

interface Stat {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

const stats: Stat[] = [
  { label: 'Total Vendors', value: 16, sub: 'across 3 tiers', color: 'text-primary' },
  { label: 'Critical Nodes', value: 5, sub: 'in vuln chains', color: 'text-status-critical' },
  { label: 'Hard Dependencies', value: 11, sub: 'non-substitutable', color: 'text-status-high' },
  { label: 'Cascade Chains', value: 3, sub: 'active risk paths', color: 'text-status-medium' },
  { label: 'Avg VRS (Tier 1)', value: '68.5', sub: 'HIGH band', color: 'text-status-high' },
  { label: 'Single-Source Risk', value: '4', sub: 'no alternatives', color: 'text-status-critical' },
];

export default function GraphMetricsBar() {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="card-elevated px-4 py-3 space-y-0.5">
          <p className={`text-xl font-bold font-mono-data ${stat.color ?? 'text-foreground'}`}>{stat.value}</p>
          <p className="text-2xs text-muted-foreground leading-tight">{stat.label}</p>
          {stat.sub && <p className="text-2xs text-muted-foreground/60 font-mono-data">{stat.sub}</p>}
        </div>
      ))}
    </div>
  );
}
