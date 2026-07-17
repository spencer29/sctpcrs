'use client';

import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';

interface CascadeChain {
  id: string;
  label: string;
  path: string[];
  riskScore: number;
  impact: 'critical' | 'high' | 'medium';
  affectedSystems: number;
  description: string;
}

const cascadeChains: CascadeChain[] = [
  {
    id: 'chain-1',
    label: 'Semiconductor Supply Collapse',
    path: ['ChipFab Asia', 'OpenSys GmbH', 'CloudCore Ltd', 'Your Org'],
    riskScore: 91,
    impact: 'critical',
    affectedSystems: 14,
    description: 'Single-source semiconductor dependency creates full cloud infrastructure exposure.',
  },
  {
    id: 'chain-2',
    label: 'Firmware Propagation Risk',
    path: ['FirmWare Co', 'HardLink SA', 'NetBridge Corp', 'Your Org'],
    riskScore: 79,
    impact: 'critical',
    affectedSystems: 9,
    description: 'Unpatched firmware vulnerabilities cascade through hardware and networking layers.',
  },
  {
    id: 'chain-3',
    label: 'Identity Provider Compromise',
    path: ['AuthBase Ltd', 'SecureNet AG', 'Your Org'],
    riskScore: 63,
    impact: 'high',
    affectedSystems: 6,
    description: 'Auth provider breach propagates to all SSO-dependent internal systems.',
  },
];

const impactColors = {
  critical: { text: 'text-status-critical', bg: 'bg-status-critical-bg', border: 'border-status-critical/30', dot: 'bg-status-critical' },
  high: { text: 'text-status-high', bg: 'bg-status-high-bg', border: 'border-status-high/30', dot: 'bg-status-high' },
  medium: { text: 'text-status-medium', bg: 'bg-status-medium-bg', border: 'border-status-medium/30', dot: 'bg-status-medium' },
};

export default function CascadeRiskPanel() {
  return (
    <div className="card-elevated p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Zap size={15} className="text-status-critical" />
        <h3 className="text-sm font-semibold text-foreground">Critical Vulnerability Chains</h3>
        <span className="ml-auto text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded-full bg-status-critical-bg text-status-critical border border-status-critical/30">
          {cascadeChains.filter((c) => c.impact === 'critical').length} CRITICAL
        </span>
      </div>

      <div className="space-y-3">
        {cascadeChains.map((chain) => {
          const colors = impactColors[chain.impact];
          return (
            <div
              key={chain.id}
              className={`rounded-lg p-3.5 border ${colors.bg} ${colors.border} space-y-2.5`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot} ${chain.impact === 'critical' ? 'alert-pulse' : ''}`} />
                  <span className={`text-xs font-semibold ${colors.text}`}>{chain.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-2xs text-muted-foreground font-mono-data">{chain.affectedSystems} systems</span>
                  <span className={`font-mono-data text-xs font-bold ${colors.text}`}>{chain.riskScore}</span>
                </div>
              </div>

              {/* Chain path */}
              <div className="flex items-center gap-1 flex-wrap">
                {chain.path.map((node, idx) => (
                  <React.Fragment key={`${chain.id}-node-${idx}`}>
                    <span className={`text-2xs font-mono-data px-1.5 py-0.5 rounded ${
                      idx === 0 ? 'bg-status-critical/20 text-status-critical' :
                      idx === chain.path.length - 1 ? 'bg-primary/10 text-primary': 'bg-muted text-muted-foreground'
                    }`}>
                      {node}
                    </span>
                    {idx < chain.path.length - 1 && (
                      <ArrowRight size={10} className="text-muted-foreground flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <p className="text-2xs text-muted-foreground leading-relaxed">{chain.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
