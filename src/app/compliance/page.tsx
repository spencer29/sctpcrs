'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import FrameworkStatusGrid from './components/FrameworkStatusGrid';
import AuditSchedulePanel from './components/AuditSchedulePanel';
import RemediationTracker from './components/RemediationTracker';
import { useRoleFilter } from '@/lib/rbac/useRoleFilter';
import { createClient } from '@/lib/supabase/client';

import { ShieldCheck, AlertTriangle, TrendingUp, BarChart3, Calendar, Wrench, ChevronRight, Plus } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

type ActiveTab = 'matrix' | 'audits' | 'remediation';

const SCORE_COLORS = ['#22C55E', '#3B82F6', '#00D4FF', '#F59E0B', '#F97316', '#EF4444'];

const scoreColor = (s: number) => {
  if (s >= 80) return 'text-status-low';
  if (s >= 65) return 'text-status-medium';
  if (s >= 50) return 'text-status-high';
  return 'text-status-critical';
};

const scoreBorder = (s: number) => {
  if (s >= 80) return 'border-status-low/30';
  if (s >= 65) return 'border-status-medium/30';
  if (s >= 50) return 'border-status-high/30';
  return 'border-status-critical/30';
};

interface ComplianceKpis {
  overallScore: number;
  totalVendors: number;
  compliantVendors: number;
  partialVendors: number;
  nonCompliantVendors: number;
  openRemediations: number;
  criticalRemediations: number;
  overdueAudits: number;
  upcomingAudits: number;
}

interface FrameworkScore {
  name: string;
  score: number;
  fill: string;
  id: string;
  trend: 'up' | 'down' | 'stable';
  trendDelta: number;
}

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix');
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [kpis, setKpis] = useState<ComplianceKpis>({
    overallScore: 69,
    totalVendors: 12,
    compliantVendors: 4,
    partialVendors: 5,
    nonCompliantVendors: 3,
    openRemediations: 5,
    criticalRemediations: 3,
    overdueAudits: 1,
    upcomingAudits: 4,
  });
  const [frameworkScores, setFrameworkScores] = useState<FrameworkScore[]>([]);
  const [loading, setLoading] = useState(true);

  const roleFilter = useRoleFilter();

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data: frameworks } = await supabase
        .from('compliance_frameworks')
        .select('*')
        .order('overall_score', { ascending: false });

      if (frameworks && frameworks.length > 0) {
        const totalVendors = frameworks.reduce((sum, f) => sum + (f.total_vendors || 0), 0) / frameworks.length;
        const compliant = frameworks.reduce((sum, f) => sum + (f.compliant || 0), 0);
        const partial = frameworks.reduce((sum, f) => sum + (f.partial || 0), 0);
        const nonCompliant = frameworks.reduce((sum, f) => sum + (f.non_compliant || 0), 0);
        const overallScore = Math.round(
          frameworks.reduce((sum, f) => sum + (f.overall_score || 0), 0) / frameworks.length
        );

        setKpis({
          overallScore,
          totalVendors: Math.round(totalVendors),
          compliantVendors: compliant,
          partialVendors: partial,
          nonCompliantVendors: nonCompliant,
          openRemediations: nonCompliant + partial,
          criticalRemediations: nonCompliant,
          overdueAudits: frameworks.filter((f) => {
            if (!f.next_audit) return false;
            return new Date(f.next_audit) < new Date();
          }).length,
          upcomingAudits: frameworks.filter((f) => {
            if (!f.next_audit) return false;
            const d = new Date(f.next_audit);
            const now = new Date();
            const thirtyDays = new Date();
            thirtyDays.setDate(thirtyDays.getDate() + 30);
            return d >= now && d <= thirtyDays;
          }).length,
        });

        const scores: FrameworkScore[] = frameworks.map((f, i) => ({
          name: f.short_name,
          score: f.overall_score || 0,
          fill: SCORE_COLORS[i % SCORE_COLORS.length],
          id: f.id,
          trend: f.trend || 'stable',
          trendDelta: f.trend_delta || 0,
        }));
        setFrameworkScores(scores);
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

  const radialData = frameworkScores.map((f) => ({
    name: f.name,
    value: f.score,
    fill: f.fill,
  }));

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'matrix', label: 'Framework Matrix', icon: <BarChart3 size={14} /> },
    { id: 'audits', label: 'Audit Schedule', icon: <Calendar size={14} /> },
    { id: 'remediation', label: 'Remediation Tracker', icon: <Wrench size={14} /> },
  ];

  return (
    <AppLayout>
      <div className="space-y-5 fade-in">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" />
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Compliance Command Center</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Framework compliance status, audit schedules, and remediation progress across all {kpis.totalVendors} vendors
            </p>
          </div>
          <div className="flex items-center gap-2">
            {kpis.overdueAudits > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-status-critical/10 border border-status-critical/30">
                <AlertTriangle size={13} className="text-status-critical" />
                <span className="text-xs font-semibold text-status-critical">{kpis.overdueAudits} Audit Overdue</span>
              </div>
            )}
            {kpis.criticalRemediations > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-status-high/10 border border-status-high/30">
                <AlertTriangle size={13} className="text-status-high" />
                <span className="text-xs font-semibold text-status-high">{kpis.criticalRemediations} Critical Remediations</span>
              </div>
            )}
            {roleFilter.canScheduleAudits && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95">
                <Plus size={13} />
                Schedule Audit
              </button>
            )}
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Overall Score', value: `${kpis.overallScore}`, sub: 'composite compliance', cls: scoreColor(kpis.overallScore), borderCls: scoreBorder(kpis.overallScore), suffix: '/100' },
            { label: 'Compliant', value: `${kpis.compliantVendors}`, sub: `of ${kpis.totalVendors} vendors`, cls: 'text-status-low', borderCls: 'border-status-low/30', suffix: '' },
            { label: 'Partial', value: `${kpis.partialVendors}`, sub: 'remediation active', cls: 'text-status-medium', borderCls: 'border-status-medium/30', suffix: '' },
            { label: 'Non-Compliant', value: `${kpis.nonCompliantVendors}`, sub: 'require action', cls: 'text-status-critical', borderCls: 'border-status-critical/30', suffix: '' },
            { label: 'Open Remediations', value: `${kpis.openRemediations}`, sub: `${kpis.criticalRemediations} critical`, cls: 'text-status-high', borderCls: 'border-status-high/30', suffix: '' },
            { label: 'Upcoming Audits', value: `${kpis.upcomingAudits}`, sub: `${kpis.overdueAudits} overdue`, cls: 'text-status-info', borderCls: 'border-status-info/30', suffix: '' },
          ].map((kpi) => (
            <div key={kpi.label} className={`bg-card border ${kpi.borderCls} rounded-xl p-4`}>
              <div className="flex items-baseline gap-0.5">
                <p className={`text-2xl font-bold font-mono-data ${kpi.cls}`}>{kpi.value}</p>
                {kpi.suffix && <span className="text-xs text-muted-foreground font-mono-data">{kpi.suffix}</span>}
              </div>
              <p className="text-xs font-medium text-foreground mt-1">{kpi.label}</p>
              <p className="text-2xs text-muted-foreground mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Framework score overview + radial */}
        <div className="grid grid-cols-3 gap-4">
          {/* Radial chart */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Compliance by Framework</h3>
            <p className="text-xs text-muted-foreground mb-3">Composite score per regulatory framework</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  data={radialData.length > 0 ? radialData : [{ name: 'Loading', value: 0, fill: '#1A2235' }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" background={{ fill: '#1A2235' }} cornerRadius={3} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 6, fontSize: 11 }}
                    formatter={(v: number) => [`${v}/100`, 'Score']}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Framework score list */}
          <div className="col-span-2 bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Framework Scores</h3>
            <p className="text-xs text-muted-foreground mb-3">Click a framework to filter the matrix below</p>
            <div className="space-y-2.5">
              {(frameworkScores.length > 0 ? frameworkScores : [
                { name: 'SOC 2', score: 81, fill: '#22C55E', id: 'soc2', trend: 'up' as const, trendDelta: 3 },
                { name: 'ISO 27001', score: 74, fill: '#3B82F6', id: 'iso27001', trend: 'up' as const, trendDelta: 4 },
                { name: 'NIST CSF', score: 71, fill: '#00D4FF', id: 'nist', trend: 'up' as const, trendDelta: 5 },
                { name: 'PCI-DSS', score: 69, fill: '#F59E0B', id: 'pcidss', trend: 'down' as const, trendDelta: -2 },
                { name: 'NDPR', score: 62, fill: '#F97316', id: 'ndpr', trend: 'up' as const, trendDelta: 7 },
                { name: 'CBN TPRMF', score: 58, fill: '#EF4444', id: 'cbn', trend: 'stable' as const, trendDelta: 0 },
              ]).map((fw) => {
                return (
                  <div
                    key={fw.name}
                    onClick={() => setSelectedFramework(fw.id === selectedFramework ? null : fw.id)}
                    className={`flex items-center gap-3 cursor-pointer group rounded-lg px-2 py-1.5 transition-colors duration-100 ${
                      fw.id === selectedFramework ? 'bg-primary/5' : 'hover:bg-muted/30'
                    }`}
                  >
                    <div className="w-20 flex-shrink-0">
                      <span className="text-xs font-medium text-foreground">{fw.name}</span>
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${fw.score}%`, backgroundColor: fw.fill }}
                      />
                    </div>
                    <span className="text-xs font-mono-data w-10 text-right" style={{ color: fw.fill }}>
                      {fw.score}
                    </span>
                    <span className={`text-2xs font-mono-data flex items-center gap-0.5 w-12 ${
                      fw.trend === 'up' ? 'text-status-low' : fw.trend === 'down' ? 'text-status-critical' : 'text-muted-foreground'
                    }`}>
                      {fw.trend === 'up' && <TrendingUp size={10} />}
                      {fw.trend === 'down' && <TrendingUp size={10} className="rotate-180" />}
                      {fw.trend !== 'stable' ? `${fw.trendDelta > 0 ? '+' : ''}${fw.trendDelta}` : '—'}
                    </span>
                    <ChevronRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'matrix' && (
          <FrameworkStatusGrid
            selectedFramework={selectedFramework}
            onFrameworkSelect={(id) => setSelectedFramework(id === selectedFramework ? null : id)}
          />
        )}
        {activeTab === 'audits' && (
          <AuditSchedulePanel canSchedule={roleFilter.canScheduleAudits} />
        )}
        {activeTab === 'remediation' && (
          <RemediationTracker canClose={roleFilter.canCloseRemediations} />
        )}
      </div>
    </AppLayout>
  );
}
