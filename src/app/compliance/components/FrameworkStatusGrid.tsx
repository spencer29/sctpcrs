'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface FrameworkVendorCell {
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL' | 'PENDING' | 'EXEMPT';
  score: number;
}

interface FrameworkRow {
  id: string;
  name: string;
  shortName: string;
  category: string;
  totalVendors: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  pending: number;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  trendDelta: number;
  nextAudit: string;
  vendors: Record<string, FrameworkVendorCell>;
}

const FRAMEWORKS: FrameworkRow[] = [
  {
    id: 'iso27001',
    name: 'ISO/IEC 27001:2022',
    shortName: 'ISO 27001',
    category: 'Information Security',
    totalVendors: 12,
    compliant: 7,
    partial: 3,
    nonCompliant: 2,
    pending: 0,
    overallScore: 74,
    trend: 'up',
    trendDelta: 4,
    nextAudit: '2026-09-15',
    vendors: {
      'Interswitch': { status: 'PARTIAL', score: 68 },
      'Flutterwave': { status: 'NON_COMPLIANT', score: 41 },
      'MTN Nigeria': { status: 'COMPLIANT', score: 91 },
      'Paystack': { status: 'COMPLIANT', score: 88 },
      'Huawei': { status: 'NON_COMPLIANT', score: 35 },
      'Microsoft': { status: 'COMPLIANT', score: 96 },
    },
  },
  {
    id: 'ndpr',
    name: 'Nigeria Data Protection Regulation',
    shortName: 'NDPR',
    category: 'Data Privacy',
    totalVendors: 12,
    compliant: 5,
    partial: 4,
    nonCompliant: 2,
    pending: 1,
    overallScore: 62,
    trend: 'up',
    trendDelta: 7,
    nextAudit: '2026-08-30',
    vendors: {
      'Interswitch': { status: 'PARTIAL', score: 61 },
      'Flutterwave': { status: 'PARTIAL', score: 55 },
      'MTN Nigeria': { status: 'COMPLIANT', score: 82 },
      'Paystack': { status: 'COMPLIANT', score: 79 },
      'Huawei': { status: 'NON_COMPLIANT', score: 28 },
      'Microsoft': { status: 'COMPLIANT', score: 94 },
    },
  },
  {
    id: 'pcidss',
    name: 'PCI DSS v4.0',
    shortName: 'PCI-DSS',
    category: 'Payment Security',
    totalVendors: 8,
    compliant: 4,
    partial: 2,
    nonCompliant: 2,
    pending: 0,
    overallScore: 69,
    trend: 'down',
    trendDelta: -2,
    nextAudit: '2026-10-01',
    vendors: {
      'Interswitch': { status: 'COMPLIANT', score: 85 },
      'Flutterwave': { status: 'NON_COMPLIANT', score: 44 },
      'MTN Nigeria': { status: 'PARTIAL', score: 63 },
      'Paystack': { status: 'COMPLIANT', score: 92 },
      'Huawei': { status: 'PENDING', score: 0 },
      'Microsoft': { status: 'EXEMPT', score: 100 },
    },
  },
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    shortName: 'SOC 2',
    category: 'Service Organization',
    totalVendors: 9,
    compliant: 6,
    partial: 2,
    nonCompliant: 1,
    pending: 0,
    overallScore: 81,
    trend: 'up',
    trendDelta: 3,
    nextAudit: '2026-11-20',
    vendors: {
      'Interswitch': { status: 'COMPLIANT', score: 88 },
      'Flutterwave': { status: 'PARTIAL', score: 58 },
      'MTN Nigeria': { status: 'COMPLIANT', score: 84 },
      'Paystack': { status: 'COMPLIANT', score: 91 },
      'Huawei': { status: 'NON_COMPLIANT', score: 32 },
      'Microsoft': { status: 'COMPLIANT', score: 98 },
    },
  },
  {
    id: 'cbn',
    name: 'CBN Third-Party Risk Management Framework',
    shortName: 'CBN TPRMF',
    category: 'Regulatory',
    totalVendors: 12,
    compliant: 4,
    partial: 5,
    nonCompliant: 3,
    pending: 0,
    overallScore: 58,
    trend: 'stable',
    trendDelta: 0,
    nextAudit: '2026-08-15',
    vendors: {
      'Interswitch': { status: 'PARTIAL', score: 64 },
      'Flutterwave': { status: 'PARTIAL', score: 52 },
      'MTN Nigeria': { status: 'COMPLIANT', score: 78 },
      'Paystack': { status: 'PARTIAL', score: 67 },
      'Huawei': { status: 'NON_COMPLIANT', score: 22 },
      'Microsoft': { status: 'COMPLIANT', score: 89 },
    },
  },
  {
    id: 'nist',
    name: 'NIST Cybersecurity Framework 2.0',
    shortName: 'NIST CSF',
    category: 'Cybersecurity',
    totalVendors: 10,
    compliant: 5,
    partial: 3,
    nonCompliant: 2,
    pending: 0,
    overallScore: 71,
    trend: 'up',
    trendDelta: 5,
    nextAudit: '2026-09-30',
    vendors: {
      'Interswitch': { status: 'PARTIAL', score: 66 },
      'Flutterwave': { status: 'NON_COMPLIANT', score: 38 },
      'MTN Nigeria': { status: 'COMPLIANT', score: 83 },
      'Paystack': { status: 'COMPLIANT', score: 87 },
      'Huawei': { status: 'NON_COMPLIANT', score: 29 },
      'Microsoft': { status: 'COMPLIANT', score: 95 },
    },
  },
];

const VENDOR_COLS = ['Interswitch', 'Flutterwave', 'MTN Nigeria', 'Paystack', 'Huawei', 'Microsoft'];

const statusIcon = (s: FrameworkVendorCell['status']) => {
  switch (s) {
    case 'COMPLIANT': return <CheckCircle2 size={13} className="text-status-low" />;
    case 'NON_COMPLIANT': return <XCircle size={13} className="text-status-critical" />;
    case 'PARTIAL': return <AlertTriangle size={13} className="text-status-medium" />;
    case 'PENDING': return <Clock size={13} className="text-muted-foreground" />;
    case 'EXEMPT': return <span className="text-2xs text-muted-foreground font-mono-data">EX</span>;
  }
};

const statusBg = (s: FrameworkVendorCell['status']) => {
  switch (s) {
    case 'COMPLIANT': return 'bg-status-low/10 border-status-low/20';
    case 'NON_COMPLIANT': return 'bg-status-critical/10 border-status-critical/20';
    case 'PARTIAL': return 'bg-status-medium/10 border-status-medium/20';
    case 'PENDING': return 'bg-muted border-border';
    case 'EXEMPT': return 'bg-muted border-border';
  }
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-status-low';
  if (score >= 60) return 'text-status-medium';
  if (score >= 40) return 'text-status-high';
  return 'text-status-critical';
};

interface Props {
  onFrameworkSelect: (fw: string) => void;
  selectedFramework: string | null;
}

export default function FrameworkStatusGrid({ onFrameworkSelect, selectedFramework }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Framework Compliance Matrix</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Compliance status per framework × vendor — click row to drill down</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-status-low" /> Compliant</span>
          <span className="flex items-center gap-1"><AlertTriangle size={11} className="text-status-medium" /> Partial</span>
          <span className="flex items-center gap-1"><XCircle size={11} className="text-status-critical" /> Non-Compliant</span>
          <span className="flex items-center gap-1"><Clock size={11} className="text-muted-foreground" /> Pending</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider w-40">Framework</th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Trend</th>
              {VENDOR_COLS.map((v) => (
                <th key={v} className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{v.split(' ')[0]}</th>
              ))}
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Next Audit</th>
              <th className="text-center px-3 py-2.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">C/P/NC</th>
            </tr>
          </thead>
          <tbody>
            {FRAMEWORKS.map((fw) => {
              const isSelected = selectedFramework === fw.id;
              return (
                <tr
                  key={fw.id}
                  onClick={() => onFrameworkSelect(fw.id)}
                  className={`border-b border-border/50 cursor-pointer transition-colors duration-100 ${
                    isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/30'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{fw.shortName}</div>
                    <div className="text-2xs text-muted-foreground mt-0.5">{fw.category}</div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`font-bold font-mono-data text-sm ${scoreColor(fw.overallScore)}`}>{fw.overallScore}</span>
                    <div className="text-2xs text-muted-foreground">/ 100</div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {fw.trend === 'up' && (
                      <span className="flex items-center justify-center gap-0.5 text-status-low text-2xs font-mono-data">
                        <TrendingUp size={11} />+{fw.trendDelta}
                      </span>
                    )}
                    {fw.trend === 'down' && (
                      <span className="flex items-center justify-center gap-0.5 text-status-critical text-2xs font-mono-data">
                        <TrendingDown size={11} />{fw.trendDelta}
                      </span>
                    )}
                    {fw.trend === 'stable' && (
                      <span className="text-muted-foreground text-2xs font-mono-data">—</span>
                    )}
                  </td>
                  {VENDOR_COLS.map((v) => {
                    const cell = fw.vendors[v];
                    if (!cell) return <td key={v} className="px-3 py-3 text-center"><span className="text-muted-foreground text-2xs">—</span></td>;
                    return (
                      <td key={v} className="px-3 py-3 text-center">
                        <div className={`inline-flex flex-col items-center gap-0.5 px-2 py-1 rounded border ${statusBg(cell.status)}`}>
                          {statusIcon(cell.status)}
                          {cell.status !== 'EXEMPT' && cell.status !== 'PENDING' && (
                            <span className={`text-2xs font-mono-data ${scoreColor(cell.score)}`}>{cell.score}</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs font-mono-data text-muted-foreground">{fw.nextAudit}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs font-mono-data">
                      <span className="text-status-low">{fw.compliant}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-status-medium">{fw.partial}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-status-critical">{fw.nonCompliant}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { FRAMEWORKS };
