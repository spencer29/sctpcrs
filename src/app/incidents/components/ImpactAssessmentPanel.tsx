'use client';

import React from 'react';
import { Database, DollarSign, Globe, ShieldOff, TrendingDown } from 'lucide-react';
import type { Incident } from './IncidentTimeline';

interface ImpactData {
  incidentId: string;
  affectedSystems: { name: string; type: string; criticality: 'critical' | 'high' | 'medium' | 'low' }[];
  dataExposure: { category: string; records: number; sensitivity: 'PII' | 'Financial' | 'Credentials' | 'None' }[];
  businessImpact: { dimension: string; score: number; detail: string }[];
  regulatoryRisk: { framework: string; obligation: string; breach: boolean }[];
  financialEstimate: string;
}

const IMPACT_MAP: Record<string, ImpactData> = {
  'INC-2024-001': {
    incidentId: 'INC-2024-001',
    affectedSystems: [
      { name: 'Payment Gateway API', type: 'API Endpoint', criticality: 'critical' },
      { name: 'Transaction Processor', type: 'Core Service', criticality: 'critical' },
      { name: 'Audit Log Service', type: 'Logging', criticality: 'medium' },
    ],
    dataExposure: [
      { category: 'Transaction Records', records: 12400, sensitivity: 'Financial' },
      { category: 'Customer PII', records: 3200, sensitivity: 'PII' },
    ],
    businessImpact: [
      { dimension: 'Confidentiality', score: 9, detail: 'Potential exposure of financial transaction data' },
      { dimension: 'Integrity', score: 7, detail: 'API responses may have been tampered with' },
      { dimension: 'Availability', score: 4, detail: 'Service degradation during incident window' },
      { dimension: 'Reputational', score: 8, detail: 'High-profile vendor — public disclosure risk' },
    ],
    regulatoryRisk: [
      { framework: 'CBN TPRMF', obligation: 'Incident notification within 24h', breach: true },
      { framework: 'NDPR', obligation: 'Data breach notification to NITDA', breach: true },
      { framework: 'PCI-DSS', obligation: 'Cardholder data breach protocol', breach: false },
    ],
    financialEstimate: '₦45M – ₦120M',
  },
  'INC-2024-002': {
    incidentId: 'INC-2024-002',
    affectedSystems: [
      { name: 'Storage API (TLS)', type: 'API Endpoint', criticality: 'high' },
      { name: 'Backup Service', type: 'Infrastructure', criticality: 'medium' },
    ],
    dataExposure: [
      { category: 'No confirmed exposure', records: 0, sensitivity: 'None' },
    ],
    businessImpact: [
      { dimension: 'Confidentiality', score: 3, detail: 'No confirmed data exposure' },
      { dimension: 'Integrity', score: 2, detail: 'Data integrity maintained' },
      { dimension: 'Availability', score: 7, detail: '3 integrations disrupted for ~1.75h' },
      { dimension: 'Reputational', score: 4, detail: 'Internal impact only' },
    ],
    regulatoryRisk: [
      { framework: 'ISO 27001', obligation: 'Availability incident logging', breach: false },
      { framework: 'NDPR', obligation: 'No breach — no notification required', breach: false },
    ],
    financialEstimate: '₦2M – ₦8M',
  },
  'INC-2024-003': {
    incidentId: 'INC-2024-003',
    affectedSystems: [
      { name: 'Vendor Admin Portal', type: 'Web Application', criticality: 'critical' },
      { name: 'Employee Email', type: 'Communication', criticality: 'high' },
    ],
    dataExposure: [
      { category: 'Admin Credentials (potential)', records: 0, sensitivity: 'Credentials' },
    ],
    businessImpact: [
      { dimension: 'Confidentiality', score: 8, detail: 'Credential theft could expose admin access' },
      { dimension: 'Integrity', score: 6, detail: 'Potential for unauthorized config changes' },
      { dimension: 'Availability', score: 2, detail: 'No service disruption yet' },
      { dimension: 'Reputational', score: 5, detail: 'Vendor trust impact if credentials compromised' },
    ],
    regulatoryRisk: [
      { framework: 'CBN TPRMF', obligation: 'Vendor security incident reporting', breach: false },
      { framework: 'ISO 27001', obligation: 'Phishing incident response procedure', breach: false },
    ],
    financialEstimate: 'TBD — under assessment',
  },
  'INC-2024-004': {
    incidentId: 'INC-2024-004',
    affectedSystems: [
      { name: 'Cloud Storage (EU-West-1)', type: 'Infrastructure', criticality: 'high' },
    ],
    dataExposure: [
      { category: 'Customer PII', records: 8700, sensitivity: 'PII' },
    ],
    businessImpact: [
      { dimension: 'Confidentiality', score: 6, detail: 'PII stored outside mandated jurisdiction' },
      { dimension: 'Integrity', score: 2, detail: 'Data integrity not affected' },
      { dimension: 'Availability', score: 1, detail: 'No service disruption' },
      { dimension: 'Reputational', score: 7, detail: 'NDPR violation — regulatory scrutiny risk' },
    ],
    regulatoryRisk: [
      { framework: 'NDPR', obligation: 'Data residency — Nigeria-only storage required', breach: true },
      { framework: 'CBN TPRMF', obligation: 'Data governance compliance', breach: false },
    ],
    financialEstimate: '₦5M – ₦25M (regulatory fine)',
  },
  'INC-2024-005': {
    incidentId: 'INC-2024-005',
    affectedSystems: [
      { name: 'SSH Infrastructure', type: 'Core Infrastructure', criticality: 'critical' },
      { name: 'Production Build Pipeline', type: 'CI/CD', criticality: 'critical' },
      { name: 'All Production Nodes', type: 'Compute', criticality: 'critical' },
    ],
    dataExposure: [
      { category: 'No confirmed exfiltration', records: 0, sensitivity: 'None' },
    ],
    businessImpact: [
      { dimension: 'Confidentiality', score: 10, detail: 'Backdoor could allow full system access' },
      { dimension: 'Integrity', score: 10, detail: 'Backdoor in core system utility' },
      { dimension: 'Availability', score: 5, detail: 'Emergency patch required downtime' },
      { dimension: 'Reputational', score: 9, detail: 'Supply chain compromise — high visibility CVE' },
    ],
    regulatoryRisk: [
      { framework: 'CBN TPRMF', obligation: 'Critical vendor incident — immediate notification', breach: true },
      { framework: 'ISO 27001', obligation: 'Supply chain security incident response', breach: true },
      { framework: 'NIST CSF', obligation: 'RS.RP-1 — Response plan executed', breach: false },
    ],
    financialEstimate: '₦80M – ₦300M (potential)',
  },
};

const criticalityConfig = {
  critical: 'bg-status-critical/10 text-status-critical border-status-critical/30',
  high: 'bg-status-high/10 text-status-high border-status-high/30',
  medium: 'bg-status-medium/10 text-status-medium border-status-medium/30',
  low: 'bg-status-low/10 text-status-low border-status-low/30',
};

const sensitivityConfig: Record<string, string> = {
  PII: 'bg-status-high/10 text-status-high border-status-high/30',
  Financial: 'bg-status-critical/10 text-status-critical border-status-critical/30',
  Credentials: 'bg-status-critical/10 text-status-critical border-status-critical/30',
  None: 'bg-muted text-muted-foreground border-border',
};

const impactColor = (score: number) => {
  if (score >= 8) return 'bg-status-critical';
  if (score >= 6) return 'bg-status-high';
  if (score >= 4) return 'bg-status-medium';
  return 'bg-status-low';
};

export default function ImpactAssessmentPanel({ selectedId }: { selectedId: string | null }) {
  const data = IMPACT_MAP[selectedId ?? 'INC-2024-001'] ?? IMPACT_MAP['INC-2024-001'];

  return (
    <div className="space-y-4">
      {/* Affected Systems */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Database size={14} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Affected Systems</h3>
        </div>
        <div className="space-y-2">
          {data.affectedSystems.map((sys) => (
            <div key={sys.name} className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{sys.name}</p>
                <p className="text-2xs text-muted-foreground">{sys.type}</p>
              </div>
              <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${criticalityConfig[sys.criticality]}`}>
                {sys.criticality.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Exposure */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldOff size={14} className="text-status-high" />
          <h3 className="text-sm font-semibold text-foreground">Data Exposure</h3>
        </div>
        <div className="space-y-2">
          {data.dataExposure.map((exp) => (
            <div key={exp.category} className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{exp.category}</p>
                {exp.records > 0 && (
                  <p className="text-2xs text-muted-foreground font-mono-data">{exp.records.toLocaleString()} records</p>
                )}
              </div>
              <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${sensitivityConfig[exp.sensitivity]}`}>
                {exp.sensitivity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Business Impact Scores */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown size={14} className="text-status-critical" />
          <h3 className="text-sm font-semibold text-foreground">Business Impact</h3>
        </div>
        <div className="space-y-3">
          {data.businessImpact.map((dim) => (
            <div key={dim.dimension}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{dim.dimension}</span>
                <span className="text-xs font-mono-data text-muted-foreground">{dim.score}/10</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${impactColor(dim.score)}`}
                  style={{ width: `${dim.score * 10}%` }}
                />
              </div>
              <p className="text-2xs text-muted-foreground">{dim.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory Risk */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={14} className="text-status-medium" />
          <h3 className="text-sm font-semibold text-foreground">Regulatory Risk</h3>
        </div>
        <div className="space-y-2">
          {data.regulatoryRisk.map((reg) => (
            <div key={reg.framework} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
              <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${reg.breach ? 'bg-status-critical' : 'bg-status-low'}`} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{reg.framework}</p>
                <p className="text-2xs text-muted-foreground leading-relaxed">{reg.obligation}</p>
              </div>
              <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${reg.breach ? 'bg-status-critical/10 text-status-critical border-status-critical/30' : 'bg-status-low/10 text-status-low border-status-low/30'}`}>
                {reg.breach ? 'BREACH' : 'OK'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Estimate */}
      <div className="bg-card border border-status-high/20 rounded-xl p-4 flex items-center gap-3">
        <DollarSign size={16} className="text-status-high flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-foreground">Financial Impact Estimate</p>
          <p className="text-sm font-bold font-mono-data text-status-high mt-0.5">{data.financialEstimate}</p>
        </div>
      </div>
    </div>
  );
}
