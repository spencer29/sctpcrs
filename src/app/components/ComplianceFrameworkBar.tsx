'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface ComplianceChartData {
  framework: string;
  coverage: number;
  gap: number;
  controls: number;
  evidenced: number;
}

const getBarColor = (coverage: number) => {
  if (coverage >= 80) return 'var(--status-low)';
  if (coverage >= 65) return 'var(--status-medium)';
  return 'var(--status-high)';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs space-y-1.5">
      <p className="font-semibold text-foreground border-b border-border pb-1.5">{label}</p>
      <div className="flex justify-between gap-6">
        <span className="text-muted-foreground">Coverage</span>
        <span className="font-mono-data font-semibold text-foreground">{d.coverage}%</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-muted-foreground">Evidenced</span>
        <span className="font-mono-data text-status-low">{d.evidenced}/{d.controls}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-muted-foreground">Gap</span>
        <span className="font-mono-data text-status-critical">{d.gap}%</span>
      </div>
    </div>
  );
};

export default function ComplianceFrameworkBar() {
  const [complianceData, setComplianceData] = useState<ComplianceChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('compliance_frameworks')
        .select('short_name, overall_score, compliant, total_vendors, non_compliant, partial')
        .order('overall_score', { ascending: false });

      if (error || !data) return;

      const chartData: ComplianceChartData[] = data.map((fw) => {
        const coverage = fw.overall_score || 0;
        const totalVendors = fw.total_vendors || 1;
        const evidenced = fw.compliant || 0;
        return {
          framework: fw.short_name,
          coverage,
          gap: 100 - coverage,
          controls: totalVendors,
          evidenced,
        };
      });

      setComplianceData(chartData);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Compliance Coverage by Framework</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Evidenced controls / total applicable controls</p>
        </div>
        <button className="text-2xs text-primary hover:text-primary/80 font-medium transition-colors">
          View Gap Report →
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[200px]">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={complianceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal vertical={false} />
            <XAxis
              dataKey="framework"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,255,0.04)' }} />
            <Bar dataKey="coverage" radius={[4, 4, 0, 0]}>
              {complianceData.map((entry) => (
                <Cell key={`cell-framework-${entry.framework}`} fill={getBarColor(entry.coverage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}