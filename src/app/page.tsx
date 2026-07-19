import React from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/AppLayout';
import KevAlertBanner from './components/KevAlertBanner';

// Dynamically import heavy components to split into separate chunks
const MetricsBentoGrid = dynamic(() => import('./components/MetricsBentoGrid'));
const VrsTrendChart = dynamic(() => import('./components/VrsTrendChart'));
const RiskTierRadial = dynamic(() => import('./components/RiskTierRadial'));
const ComplianceFrameworkBar = dynamic(() => import('./components/ComplianceFrameworkBar'));
const AlertFeedPanel = dynamic(() => import('./components/AlertFeedPanel'));
const TopRiskVendorsTable = dynamic(() => import('./components/TopRiskVendorsTable'));
const ActivityFeed = dynamic(() => import('./components/ActivityFeed'));

export default function RiskOverviewDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-5 fade-in">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Risk Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Portfolio risk posture · Last computed{' '}
              <span className="font-mono-data text-primary">14 minutes ago</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border text-xs text-muted-foreground">
              <span>Period:</span>
              <span className="text-foreground font-medium">Last 30 days</span>
            </div>
            <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95">
              Export Report
            </button>
          </div>
        </div>

        {/* KEV Alert Banner */}
        <KevAlertBanner />

        {/* KPI Bento Grid */}
        <MetricsBentoGrid />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <VrsTrendChart />
          </div>
          <div className="lg:col-span-1">
            <RiskTierRadial />
          </div>
        </div>

        {/* Compliance + Alerts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-5">
          <ComplianceFrameworkBar />
          <AlertFeedPanel />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <TopRiskVendorsTable />
          </div>
          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}