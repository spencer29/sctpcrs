'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import FrameworkStatusGrid, { FRAMEWORKS } from './components/FrameworkStatusGrid';
import AuditSchedulePanel from './components/AuditSchedulePanel';
import RemediationTracker from './components/RemediationTracker';
import { ShieldCheck, AlertTriangle, TrendingUp, BarChart3, Calendar, Wrench, ChevronRight,  } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

type ActiveTab = 'matrix' | 'audits' | 'remediation';

const OVERALL_SCORE = 69;

const frameworkScores = [
  { name: 'SOC 2', score: 81, fill: '#22C55E' },
  { name: 'ISO 27001', score: 74, fill: '#3B82F6' },
  { name: 'NIST CSF', score: 71, fill: '#00D4FF' },
  { name: 'PCI-DSS', score: 69, fill: '#F59E0B' },
  { name: 'NDPR', score: 62, fill: '#F97316' },
  { name: 'CBN TPRMF', score: 58, fill: '#EF4444' },
];

const radialData = frameworkScores.map((f, i) => ({
  name: f.name,
  value: f.score,
  fill: f.fill,
}));

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

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix');
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);

  const totalVendors = 12;
  const compliantVendors = 4;
  const partialVendors = 5;
  const nonCompliantVendors = 3;
  const openRemediations = 5;
  const criticalRemediations = 3;
  const overdueAudits = 1;
  const upcomingAudits = 4;

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
              Framework compliance status, audit schedules, and remediation progress across all {totalVendors} vendors
            </p>
          </div>
          <div className="flex items-center gap-2">
            {overdueAudits > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-status-critical/10 border border-status-critical/30">
                <AlertTriangle size={13} className="text-status-critical" />
                <span className="text-xs font-semibold text-status-critical">{overdueAudits} Audit Overdue</span>
              </div>
            )}
            {criticalRemediations > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-status-high/10 border border-status-high/30">
                <AlertTriangle size={13} className="text-status-high" />
                <span className="text-xs font-semibold text-status-high">{criticalRemediations} Critical Remediations</span>
              </div>
            )}
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Overall Score', value: `${OVERALL_SCORE}`, sub: 'composite compliance', cls: scoreColor(OVERALL_SCORE), borderCls: scoreBorder(OVERALL_SCORE), suffix: '/100' },
            { label: 'Compliant', value: `${compliantVendors}`, sub: `of ${totalVendors} vendors`, cls: 'text-status-low', borderCls: 'border-status-low/30', suffix: '' },
            { label: 'Partial', value: `${partialVendors}`, sub: 'remediation active', cls: 'text-status-medium', borderCls: 'border-status-medium/30', suffix: '' },
            { label: 'Non-Compliant', value: `${nonCompliantVendors}`, sub: 'require action', cls: 'text-status-critical', borderCls: 'border-status-critical/30', suffix: '' },
            { label: 'Open Remediations', value: `${openRemediations}`, sub: `${criticalRemediations} critical`, cls: 'text-status-high', borderCls: 'border-status-high/30', suffix: '' },
            { label: 'Upcoming Audits', value: `${upcomingAudits}`, sub: `${overdueAudits} overdue`, cls: 'text-status-info', borderCls: 'border-status-info/30', suffix: '' },
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
                  data={radialData}
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
              {frameworkScores.map((fw) => {
                const fwData = FRAMEWORKS.find((f) => f.shortName === fw.name);
                return (
                  <div
                    key={fw.name}
                    onClick={() => setSelectedFramework(fwData?.id === selectedFramework ? null : fwData?.id ?? null)}
                    className={`flex items-center gap-3 cursor-pointer group rounded-lg px-2 py-1.5 transition-colors duration-100 ${
                      fwData?.id === selectedFramework ? 'bg-primary/5' : 'hover:bg-muted/30'
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
                    {fwData && (
                      <span className={`text-2xs font-mono-data flex items-center gap-0.5 w-12 ${
                        fwData.trend === 'up' ? 'text-status-low' : fwData.trend === 'down' ? 'text-status-critical' : 'text-muted-foreground'
                      }`}>
                        {fwData.trend === 'up' && <TrendingUp size={10} />}
                        {fwData.trend === 'down' && <TrendingUp size={10} className="rotate-180" />}
                        {fwData.trend !== 'stable' ? `${fwData.trendDelta > 0 ? '+' : ''}${fwData.trendDelta}` : '—'}
                      </span>
                    )}
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
        {activeTab === 'audits' && <AuditSchedulePanel />}
        {activeTab === 'remediation' && <RemediationTracker />}
      </div>
    </AppLayout>
  );
}
