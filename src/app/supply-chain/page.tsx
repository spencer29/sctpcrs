'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import DependencyGraph from './components/DependencyGraph';
import CascadeRiskPanel from './components/CascadeRiskPanel';
import GraphMetricsBar from './components/GraphMetricsBar';
import { GitBranch, Filter, AlertTriangle, Eye, Download } from 'lucide-react';

const riskFilters = [
  { value: 'all', label: 'All Vendors' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const legendItems = [
  { color: '#00D4FF', label: 'Your Org' },
  { color: '#8B5CF6', label: 'Tier 1 — Direct' },
  { color: '#3B82F6', label: 'Tier 2 — Sub-Vendors' },
  { color: '#6B7280', label: 'Tier 3 — Nth Party' },
];

const riskLegend = [
  { color: '#EF4444', label: 'Critical' },
  { color: '#F97316', label: 'High' },
  { color: '#F59E0B', label: 'Medium' },
  { color: '#22C55E', label: 'Low' },
];

export default function SupplyChainPage() {
  const [filterRisk, setFilterRisk] = useState('all');
  const [showVulnChainOnly, setShowVulnChainOnly] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-5 fade-in">
        {/* Page Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <GitBranch size={18} className="text-primary" />
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Supply Chain Dependency Graph</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Vendor dependency relationships and cascade risk across your supply network ·{' '}
              <span className="text-status-critical font-mono-data">5 critical nodes</span> ·{' '}
              <span className="text-status-high font-mono-data">3 vulnerability chains</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted border border-border text-xs font-medium text-foreground hover:bg-secondary transition-all duration-150">
              <Download size={13} />
              Export Graph
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95">
              <AlertTriangle size={13} />
              Run Risk Scan
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <GraphMetricsBar />

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filter:</span>
          </div>
          <div className="flex items-center gap-1">
            {riskFilters?.map((f) => (
              <button
                key={f?.value}
                onClick={() => setFilterRisk(f?.value)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all duration-150 ${
                  filterRisk === f?.value
                    ? 'bg-primary/15 text-primary border border-primary/40' :'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
                }`}
              >
                {f?.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowVulnChainOnly((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-150 ${
                showVulnChainOnly
                  ? 'bg-status-critical-bg border-status-critical/40 text-status-critical' :'bg-muted border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye size={13} />
              Vuln Chain Only
            </button>
          </div>
        </div>

        {/* Graph + Legend */}
        <div className="space-y-3">
          {/* Legend */}
          <div className="flex items-center gap-6 flex-wrap px-1">
            <div className="flex items-center gap-4">
              <span className="text-2xs text-muted-foreground uppercase tracking-wider font-mono-data">Network Tier</span>
              {legendItems?.map((l) => (
                <div key={l?.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: l?.color }} />
                  <span className="text-2xs text-muted-foreground">{l?.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
              <span className="text-2xs text-muted-foreground uppercase tracking-wider font-mono-data">Risk</span>
              {riskLegend?.map((l) => (
                <div key={l?.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: l?.color }} />
                  <span className="text-2xs text-muted-foreground">{l?.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
              <span className="text-2xs text-muted-foreground uppercase tracking-wider font-mono-data">Edge</span>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="rgba(107,114,128,0.6)" strokeWidth="1.5" /></svg>
                <span className="text-2xs text-muted-foreground">Hard dep.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="rgba(107,114,128,0.6)" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
                <span className="text-2xs text-muted-foreground">Soft dep.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#EF4444" strokeWidth="2" /></svg>
                <span className="text-2xs text-muted-foreground">Critical path</span>
              </div>
            </div>
          </div>

          {/* Hint */}
          <p className="text-2xs text-muted-foreground/60 px-1">
            Click any node to highlight its dependency chain. Dashed rings indicate vulnerability chain membership.
          </p>

          {/* Graph */}
          <DependencyGraph filterRisk={filterRisk} showVulnChainOnly={showVulnChainOnly} />
        </div>

        {/* Cascade Risk Panel */}
        <CascadeRiskPanel />
      </div>
    </AppLayout>
  );
}
