import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Activity,
  FileSearch,
  Clock,
} from 'lucide-react';

// Grid plan: 6 cards → grid-cols-4
// Row 1: Hero VRS spans 2 cols + 2 regular cards
// Row 2: 4 regular cards spanning 1 col each

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  trendBad?: boolean;
  icon: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'positive' | 'hero';
  colSpan?: number;
  mono?: boolean;
}

function MetricCard({
  label,
  value,
  subtext,
  trend,
  trendValue,
  trendBad,
  icon,
  variant = 'default',
  mono = false,
}: MetricCardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    critical: 'bg-status-critical-bg border-status-critical/40 glow-red',
    warning: 'bg-status-high-bg border-status-high/30',
    positive: 'bg-status-low-bg border-status-low/30',
    hero: 'bg-card border-primary/30 glow-cyan',
  };

  const iconBg = {
    default: 'bg-muted text-muted-foreground',
    critical: 'bg-status-critical/20 text-status-critical',
    warning: 'bg-status-high/20 text-status-high',
    positive: 'bg-status-low/20 text-status-low',
    hero: 'bg-primary/20 text-primary',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trendBad
    ? trend === 'up' ? 'text-status-critical' : 'text-status-low'
    : trend === 'up' ? 'text-status-low' : trend === 'down' ? 'text-status-critical' : 'text-muted-foreground';

  return (
    <div className={`card-elevated card-hover p-5 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${iconBg[variant]}`}>
          {icon}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-2xs font-semibold ${trendColor}`}>
            <TrendIcon size={11} />
            <span className="font-mono-data">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xs font-semibold tracking-widest uppercase text-muted-foreground">{label}</p>
        <p className={`text-3xl font-bold font-tabular leading-none ${mono ? 'font-mono-data' : ''} ${
          variant === 'critical' ? 'text-status-critical' :
          variant === 'warning' ? 'text-status-high' :
          variant === 'positive' ? 'text-status-low' :
          variant === 'hero'? 'text-primary' : 'text-foreground'
        }`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </div>
    </div>
  );
}

function HeroVrsCard() {
  const vrsScore = 61;
  const prevScore = 54;
  const delta = vrsScore - prevScore;

  return (
    <div className="card-elevated card-hover p-5 bg-card border-primary/30 glow-cyan col-span-2">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-2xs font-semibold tracking-widest uppercase text-muted-foreground">Portfolio VRS — North Star</p>
          <p className="text-xs text-muted-foreground mt-0.5">Weighted avg across 47 active vendors</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-status-critical bg-status-critical/10 border border-status-critical/30 px-2 py-1 rounded">
          <TrendingUp size={12} />
          <span className="font-mono-data">+{delta} pts vs last week</span>
        </div>
      </div>
      <div className="flex items-end gap-6">
        <div>
          <span className="text-6xl font-bold font-mono-data text-status-high leading-none">{vrsScore}</span>
          <span className="text-xl text-muted-foreground font-mono-data ml-1">/100</span>
        </div>
        <div className="flex-1 space-y-2 pb-1">
          {/* Mini tier breakdown bars */}
          {[
            { label: 'CRITICAL vendors', count: 4, color: 'bg-status-critical', pct: 8 },
            { label: 'HIGH vendors', count: 11, color: 'bg-status-high', pct: 23 },
            { label: 'MEDIUM vendors', count: 22, color: 'bg-status-medium', pct: 47 },
            { label: 'LOW vendors', count: 10, color: 'bg-status-low', pct: 21 },
          ].map((tier) => (
            <div key={`tier-bar-${tier.label}`} className="flex items-center gap-2">
              <span className="text-2xs text-muted-foreground w-28 truncate">{tier.label}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full vrs-bar-fill ${tier.color}`}
                  style={{ width: `${tier.pct}%` }}
                />
              </div>
              <span className="text-2xs font-mono-data text-muted-foreground w-4 text-right">{tier.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-critical" />
          <span className="text-2xs text-muted-foreground">Risk threshold: <span className="font-mono-data text-status-medium">HIGH (≥50)</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-muted-foreground" />
          <span className="text-2xs text-muted-foreground font-mono-data">Next full re-score: 06:00 UTC</span>
        </div>
      </div>
    </div>
  );
}

export default function MetricsBentoGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Row 1: Hero + 2 regular */}
      <HeroVrsCard />

      <MetricCard
        label="Unacknowledged Alerts"
        value="13"
        subtext="4 CRITICAL · 5 HIGH · 4 MEDIUM"
        trend="up"
        trendValue="+5 today"
        trendBad
        icon={<AlertTriangle size={16} />}
        variant="critical"
        mono
      />

      <MetricCard
        label="KEV-Exposed Vendors"
        value="3"
        subtext="CISA catalogue match in SBOM"
        trend="up"
        trendValue="+2 this week"
        trendBad
        icon={<FileSearch size={16} />}
        variant="critical"
        mono
      />

      {/* Row 2: 4 cards */}
      <MetricCard
        label="Active Vendors"
        value="47"
        subtext="Of 53 registered total"
        trend="up"
        trendValue="+3 this month"
        icon={<Building2 size={16} />}
        variant="default"
        mono
      />

      <MetricCard
        label="Avg Compliance Coverage"
        value="71%"
        subtext="Across CBN, PCI DSS, ISO 27001"
        trend="up"
        trendValue="+4% vs last quarter"
        icon={<ShieldCheck size={16} />}
        variant="positive"
        mono
      />

      <MetricCard
        label="Pending Questionnaires"
        value="8"
        subtext="3 overdue by >7 days"
        trend="down"
        trendValue="-2 this week"
        icon={<Activity size={16} />}
        variant="warning"
        mono
      />

      <MetricCard
        label="Open Incidents"
        value="2"
        subtext="1 CBN notification pending"
        trend="flat"
        trendValue="No change"
        icon={<AlertTriangle size={16} />}
        variant="warning"
        mono
      />
    </div>
  );
}