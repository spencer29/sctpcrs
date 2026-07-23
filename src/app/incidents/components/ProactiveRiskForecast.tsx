'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, ShieldOff, ChevronDown, ChevronUp, Zap, Clock, ArrowUpRight,  } from 'lucide-react';

// ── Vendor Risk Trend Forecast data ──────────────────────────────────────────
const vendorRiskForecast = [
  {
    vendor: 'Paystack',
    tier: 'Tier 1',
    currentVrs: 78,
    forecastVrs: 91,
    delta: +13,
    trend: 'rising',
    driverLabel: 'KEV spike + unpatched CVEs',
    history: [
      { week: 'W-6', actual: 62, forecast: null },
      { week: 'W-5', actual: 65, forecast: null },
      { week: 'W-4', actual: 68, forecast: null },
      { week: 'W-3', actual: 71, forecast: null },
      { week: 'W-2', actual: 74, forecast: null },
      { week: 'W-1', actual: 78, forecast: null },
      { week: 'W+1', actual: null, forecast: 83 },
      { week: 'W+2', actual: null, forecast: 87 },
      { week: 'W+3', actual: null, forecast: 91 },
    ],
  },
  {
    vendor: 'Interswitch',
    tier: 'Tier 1',
    currentVrs: 55,
    forecastVrs: 48,
    delta: -7,
    trend: 'falling',
    driverLabel: 'Patch cycle completed',
    history: [
      { week: 'W-6', actual: 62, forecast: null },
      { week: 'W-5', actual: 60, forecast: null },
      { week: 'W-4', actual: 59, forecast: null },
      { week: 'W-3', actual: 57, forecast: null },
      { week: 'W-2', actual: 56, forecast: null },
      { week: 'W-1', actual: 55, forecast: null },
      { week: 'W+1', actual: null, forecast: 53 },
      { week: 'W+2', actual: null, forecast: 50 },
      { week: 'W+3', actual: null, forecast: 48 },
    ],
  },
  {
    vendor: 'Flutterwave',
    tier: 'Tier 2',
    currentVrs: 69,
    forecastVrs: 74,
    delta: +5,
    trend: 'rising',
    driverLabel: 'Posture regression detected',
    history: [
      { week: 'W-6', actual: 60, forecast: null },
      { week: 'W-5', actual: 62, forecast: null },
      { week: 'W-4', actual: 64, forecast: null },
      { week: 'W-3', actual: 65, forecast: null },
      { week: 'W-2', actual: 67, forecast: null },
      { week: 'W-1', actual: 69, forecast: null },
      { week: 'W+1', actual: null, forecast: 71 },
      { week: 'W+2', actual: null, forecast: 73 },
      { week: 'W+3', actual: null, forecast: 74 },
    ],
  },
  {
    vendor: 'RemitaNet',
    tier: 'Tier 2',
    currentVrs: 42,
    forecastVrs: 42,
    delta: 0,
    trend: 'stable',
    driverLabel: 'No significant change expected',
    history: [
      { week: 'W-6', actual: 43, forecast: null },
      { week: 'W-5', actual: 42, forecast: null },
      { week: 'W-4', actual: 43, forecast: null },
      { week: 'W-3', actual: 41, forecast: null },
      { week: 'W-2', actual: 42, forecast: null },
      { week: 'W-1', actual: 42, forecast: null },
      { week: 'W+1', actual: null, forecast: 42 },
      { week: 'W+2', actual: null, forecast: 43 },
      { week: 'W+3', actual: null, forecast: 42 },
    ],
  },
];

// ── Alert Velocity Prediction data ───────────────────────────────────────────
const alertVelocityData = [
  { day: 'Mon', actual: 12, predicted: null },
  { day: 'Tue', actual: 18, predicted: null },
  { day: 'Wed', actual: 15, predicted: null },
  { day: 'Thu', actual: 22, predicted: null },
  { day: 'Fri', actual: 19, predicted: null },
  { day: 'Sat', actual: 9, predicted: null },
  { day: 'Sun', actual: 7, predicted: null },
  { day: 'Mon*', actual: null, predicted: 21 },
  { day: 'Tue*', actual: null, predicted: 26 },
  { day: 'Wed*', actual: null, predicted: 24 },
  { day: 'Thu*', actual: null, predicted: 31 },
];

const velocityInsights = [
  { label: 'Peak day predicted', value: 'Thursday', sub: '+41% above weekly avg', cls: 'text-status-critical' },
  { label: 'Avg daily velocity', value: '14.6', sub: 'alerts / day (7-day)', cls: 'text-status-high' },
  { label: 'Predicted weekly total', value: '102', sub: '+23% vs last week', cls: 'text-status-medium' },
  { label: 'Surge probability', value: '76%', sub: 'next 72 hours', cls: 'text-primary' },
];

// ── Compliance Drift Alerts data ──────────────────────────────────────────────
const complianceDriftAlerts = [
  {
    id: 'CDA-001',
    framework: 'PCI DSS 4.0',
    control: 'Req 6.3.3 — Patch Management',
    vendor: 'Paystack',
    driftScore: 34,
    severity: 'critical' as const,
    detectedAt: '2h ago',
    description: 'Vendor has 6 unpatched critical CVEs exceeding the 30-day remediation SLA. Breach risk: HIGH.',
    trend: 'worsening',
  },
  {
    id: 'CDA-002',
    framework: 'ISO 27001',
    control: 'A.12.6.1 — Vulnerability Management',
    vendor: 'Flutterwave',
    driftScore: 21,
    severity: 'high' as const,
    detectedAt: '5h ago',
    description: 'Posture regression in network segmentation controls. 3 open findings from last audit remain unresolved.',
    trend: 'worsening',
  },
  {
    id: 'CDA-003',
    framework: 'NDPR',
    control: 'Art. 2.6 — Data Processor Obligations',
    vendor: 'CloudPay',
    driftScore: 15,
    severity: 'high' as const,
    detectedAt: '1d ago',
    description: 'Data processing agreement renewal overdue by 14 days. Regulatory exposure active.',
    trend: 'stable',
  },
  {
    id: 'CDA-004',
    framework: 'SOC 2 Type II',
    control: 'CC7.1 — System Monitoring',
    vendor: 'GTCo',
    driftScore: 9,
    severity: 'medium' as const,
    detectedAt: '2d ago',
    description: 'Log retention gap identified — 4-day window missing from SIEM feed. Audit evidence incomplete.',
    trend: 'improving',
  },
  {
    id: 'CDA-005',
    framework: 'CBN Guidelines',
    control: 'Sec. 4.2 — Third-Party Risk',
    vendor: 'RemitaNet',
    driftScore: 6,
    severity: 'medium' as const,
    detectedAt: '3d ago',
    description: 'Annual vendor risk assessment overdue by 8 days. Escalation to compliance officer pending.',
    trend: 'stable',
  },
];

const severityBadge: Record<string, string> = {
  critical: 'bg-status-critical/10 text-status-critical border-status-critical/30',
  high: 'bg-status-high/10 text-status-high border-status-high/30',
  medium: 'bg-status-medium/10 text-status-medium border-status-medium/30',
};

const driftColor: Record<string, string> = {
  critical: 'var(--status-critical)',
  high: 'var(--status-high)',
  medium: 'var(--status-medium)',
};

const tooltipStyle = {
  contentStyle: { background: '#111827', border: '1px solid #1F2937', borderRadius: 6, fontSize: 11 },
  labelStyle: { color: '#9CA3AF' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function VendorRiskTrendCard({ vendor }: { vendor: (typeof vendorRiskForecast)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const trendColor =
    vendor.trend === 'rising' ?'var(--status-critical)'
      : vendor.trend === 'falling' ?'var(--status-low)' :'var(--status-medium)';

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{vendor.vendor}</span>
            <span className="text-2xs font-mono-data px-1.5 py-0.5 rounded border border-border text-muted-foreground">
              {vendor.tier}
            </span>
          </div>
          <p className="text-2xs text-muted-foreground mt-0.5">{vendor.driverLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono-data text-lg font-bold" style={{ color: trendColor }}>
            {vendor.forecastVrs}
          </span>
          <div
            className="flex items-center gap-0.5 text-2xs font-mono-data"
            style={{ color: trendColor }}
          >
            {vendor.trend === 'rising' ? (
              <TrendingUp size={11} />
            ) : vendor.trend === 'falling' ? (
              <TrendingDown size={11} />
            ) : (
              <Activity size={11} />
            )}
            <span>
              {vendor.delta > 0 ? `+${vendor.delta}` : vendor.delta} pts forecast
            </span>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={vendor.history} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
            <XAxis dataKey="week" tick={{ fontSize: 8, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
            <YAxis domain={[30, 100]} tick={{ fontSize: 8, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
            <Tooltip {...tooltipStyle} />
            <ReferenceLine x="W-1" stroke="var(--border)" strokeDasharray="4 2" label={{ value: 'Now', fill: 'var(--muted-foreground)', fontSize: 8, position: 'top' }} />
            <Line
              type="monotone"
              dataKey="actual"
              stroke={trendColor}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name="Actual VRS"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={trendColor}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              connectNulls={false}
              name="Forecast VRS"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {expanded ? 'Hide' : 'Show'} forecast details
      </button>

      {expanded && (
        <div className="pt-2 border-t border-border space-y-1.5 slide-up">
          <div className="flex justify-between text-2xs">
            <span className="text-muted-foreground">Current VRS</span>
            <span className="font-mono-data text-foreground">{vendor.currentVrs}</span>
          </div>
          <div className="flex justify-between text-2xs">
            <span className="text-muted-foreground">3-Week Forecast</span>
            <span className="font-mono-data" style={{ color: trendColor }}>{vendor.forecastVrs}</span>
          </div>
          <div className="flex justify-between text-2xs">
            <span className="text-muted-foreground">Projected Change</span>
            <span className="font-mono-data" style={{ color: trendColor }}>
              {vendor.delta > 0 ? `+${vendor.delta}` : vendor.delta} pts
            </span>
          </div>
          <div className="flex justify-between text-2xs">
            <span className="text-muted-foreground">Primary Driver</span>
            <span className="text-foreground text-right max-w-[60%]">{vendor.driverLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ComplianceDriftRow({ alert }: { alert: (typeof complianceDriftAlerts)[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-border/80 transition-all duration-150"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: driftColor[alert.severity] }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono-data text-muted-foreground">{alert.id}</span>
              <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full border ${severityBadge[alert.severity]}`}>
                {alert.severity.toUpperCase()}
              </span>
              <span className="text-2xs font-semibold px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                {alert.framework}
              </span>
            </div>
            <p className="text-xs font-semibold text-foreground mt-1 leading-snug">{alert.control}</p>
            <p className="text-2xs text-muted-foreground mt-0.5">
              {alert.vendor} · {alert.detectedAt}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-2xs text-muted-foreground">Drift</span>
            <span
              className="font-mono-data text-sm font-bold"
              style={{ color: driftColor[alert.severity] }}
            >
              {alert.driftScore}
            </span>
          </div>
          <div className="flex items-center gap-0.5 text-2xs text-muted-foreground">
            {alert.trend === 'worsening' ? (
              <TrendingUp size={10} className="text-status-critical" />
            ) : alert.trend === 'improving' ? (
              <TrendingDown size={10} className="text-status-low" />
            ) : (
              <Activity size={10} />
            )}
            <span className={alert.trend === 'worsening' ? 'text-status-critical' : alert.trend === 'improving' ? 'text-status-low' : ''}>
              {alert.trend}
            </span>
          </div>
          {expanded ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border slide-up">
          <p className="text-xs text-muted-foreground leading-relaxed">{alert.description}</p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              className="flex items-center gap-1 text-2xs font-semibold text-primary hover:text-primary/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowUpRight size={11} />
              Escalate
            </button>
            <span className="text-border">·</span>
            <button
              className="flex items-center gap-1 text-2xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Assign Remediation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProactiveRiskForecast() {
  return (
    <div className="space-y-6 fade-in">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-primary" />
          <h2 className="text-base font-semibold text-foreground">Proactive Risk Intelligence</h2>
          <span className="text-2xs font-mono-data px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
            FORECAST
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
          <Clock size={11} />
          <span>Model updated 15 min ago</span>
        </div>
      </div>

      {/* Row 1: Vendor Risk Trend Forecasts + Alert Velocity */}
      <div className="grid grid-cols-5 gap-4">
        {/* Vendor Risk Trend Forecasts — 3 cols */}
        <div className="col-span-3 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={13} className="text-status-high" />
            <h3 className="text-sm font-semibold text-foreground">Vendor Risk Trend Forecasts</h3>
            <span className="text-2xs text-muted-foreground">3-week projection</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {vendorRiskForecast.map((v) => (
              <VendorRiskTrendCard key={v.vendor} vendor={v} />
            ))}
          </div>
        </div>

        {/* Alert Velocity Predictions — 2 cols */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Activity size={13} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Alert Velocity Prediction</h3>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            {/* Velocity insight KPIs */}
            <div className="grid grid-cols-2 gap-2">
              {velocityInsights.map((ins) => (
                <div key={ins.label} className="bg-muted/30 rounded-lg p-3">
                  <p className={`text-base font-bold font-mono-data ${ins.cls}`}>{ins.value}</p>
                  <p className="text-2xs font-medium text-foreground mt-0.5 leading-tight">{ins.label}</p>
                  <p className="text-2xs text-muted-foreground mt-0.5 leading-tight">{ins.sub}</p>
                </div>
              ))}
            </div>

            {/* Velocity chart */}
            <div>
              <p className="text-2xs text-muted-foreground mb-2">Daily alert count — actual vs predicted (starred)</p>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={alertVelocityData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--status-high)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--status-high)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <Tooltip {...tooltipStyle} />
                    <ReferenceLine x="Sun" stroke="var(--border)" strokeDasharray="4 2" />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#gActual)"
                      connectNulls={false}
                      name="Actual"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="var(--status-high)"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      fill="url(#gPred)"
                      connectNulls={false}
                      name="Predicted"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-2">
                {[
                  { label: 'Actual', color: 'var(--primary)' },
                  { label: 'Predicted', color: 'var(--status-high)', dashed: true },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-0.5 rounded"
                      style={{
                        backgroundColor: l.color,
                        backgroundImage: l.dashed ? `repeating-linear-gradient(90deg, ${l.color} 0, ${l.color} 4px, transparent 4px, transparent 7px)` : undefined,
                      }}
                    />
                    <span className="text-2xs text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Compliance Drift Alerts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldOff size={13} className="text-status-critical" />
            <h3 className="text-sm font-semibold text-foreground">Compliance Drift Alerts</h3>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-critical/10 border border-status-critical/30">
              <span className="w-1.5 h-1.5 rounded-full bg-status-critical alert-pulse" />
              <span className="text-2xs font-semibold text-status-critical">
                {complianceDriftAlerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length} ACTIVE
              </span>
            </span>
          </div>
          <p className="text-2xs text-muted-foreground">Click any alert to expand details</p>
        </div>
        <div className="space-y-2">
          {complianceDriftAlerts.map((alert) => (
            <ComplianceDriftRow key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </div>
  );
}
