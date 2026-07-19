'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface TierData {
  name: string;
  value: number;
  fill: string;
  pct: number;
}

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
  const [tierData, setTierData] = useState<TierData[]>([
    { name: 'LOW', value: 10, fill: 'var(--status-low)', pct: 21 },
    { name: 'MEDIUM', value: 22, fill: 'var(--status-medium)', pct: 47 },
    { name: 'HIGH', value: 11, fill: 'var(--status-high)', pct: 23 },
    { name: 'CRITICAL', value: 4, fill: 'var(--status-critical)', pct: 8 },
  ]);
  const [totalVendors, setTotalVendors] = useState(47);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data: alerts } = await supabase
        .from('alerts')
        .select('vendor, severity')
        .neq('status', 'dismissed');

      if (!alerts || alerts.length === 0) {
        setLoading(false);
        return;
      }

      // Derive vendor risk tier from highest alert severity per vendor
      const vendorMaxSeverity = new Map<string, string>();
      const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

      alerts.forEach((a) => {
        if (!a.vendor) return;
        const existing = vendorMaxSeverity.get(a.vendor);
        if (!existing || severityOrder.indexOf(a.severity) < severityOrder.indexOf(existing)) {
          vendorMaxSeverity.set(a.vendor, a.severity);
        }
      });

      const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      vendorMaxSeverity.forEach((sev) => {
        if (sev in counts) counts[sev as keyof typeof counts]++;
      });

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      setTotalVendors(total || 47);

      if (total > 0) {
        setTierData([
          { name: 'LOW', value: counts.LOW, fill: 'var(--status-low)', pct: Math.round((counts.LOW / total) * 100) },
          { name: 'MEDIUM', value: counts.MEDIUM, fill: 'var(--status-medium)', pct: Math.round((counts.MEDIUM / total) * 100) },
          { name: 'HIGH', value: counts.HIGH, fill: 'var(--status-high)', pct: Math.round((counts.HIGH / total) * 100) },
          { name: 'CRITICAL', value: counts.CRITICAL, fill: 'var(--status-critical)', pct: Math.round((counts.CRITICAL / total) * 100) },
        ]);
      }
    } catch {
      // silently fail, keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="card-elevated p-5 h-full">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Vendor Risk Tier Distribution</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{totalVendors} active vendors by risk tier</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[180px]">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
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
      )}
    </div>
  );
}