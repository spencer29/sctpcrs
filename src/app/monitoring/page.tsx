'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

import VendorStatusGrid from './components/VendorStatusGrid';
import AlertTrendCharts from './components/AlertTrendCharts';
import SlaHealthPanel from './components/SlaHealthPanel';
import { Activity, AlertTriangle, Wifi, WifiOff, Zap, ShieldAlert, Clock, RefreshCw, CheckCircle } from 'lucide-react';

type ActiveTab = 'status' | 'alerts' | 'sla';

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('status');
  const [lastRefresh] = useState('Just now');
  const { can } = useAuth();

  const kpis = [
    {
      label: 'Vendors Online',
      value: '8',
      sub: 'of 10 monitored',
      icon: <Wifi size={16} className="text-status-low" />,
      cls: 'text-status-low',
      borderCls: 'border-status-low/30',
    },
    {
      label: 'Vendors Offline',
      value: '2',
      sub: 'last seen >15m ago',
      icon: <WifiOff size={16} className="text-status-critical" />,
      cls: 'text-status-critical',
      borderCls: 'border-status-critical/30',
    },
    {
      label: 'Active Alerts',
      value: '17',
      sub: '4 critical, 7 high',
      icon: <AlertTriangle size={16} className="text-status-high" />,
      cls: 'text-status-high',
      borderCls: 'border-status-high/30',
    },
    {
      label: 'SLA Breached',
      value: '2',
      sub: 'Interswitch, NigeriaCloud',
      icon: <ShieldAlert size={16} className="text-status-critical" />,
      cls: 'text-status-critical',
      borderCls: 'border-status-critical/30',
    },
    {
      label: 'KEV Matches',
      value: '4',
      sub: 'across 2 vendors',
      icon: <Zap size={16} className="text-status-critical" />,
      cls: 'text-status-critical',
      borderCls: 'border-status-critical/30',
    },
    {
      label: 'Avg Detection',
      value: '1.3s',
      sub: 'signal-to-alert latency',
      icon: <Clock size={16} className="text-status-info" />,
      cls: 'text-status-info',
      borderCls: 'border-status-info/30',
    },
    {
      label: 'Open Findings',
      value: '47',
      sub: '11 critical severity',
      icon: <CheckCircle size={16} className="text-status-medium" />,
      cls: 'text-status-medium',
      borderCls: 'border-status-medium/30',
    },
  ];

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'status', label: 'Live Vendor Status', icon: <Activity size={14} /> },
    { id: 'alerts', label: 'Alert Trends & Detection', icon: <AlertTriangle size={14} /> },
    { id: 'sla', label: 'SLA Health', icon: <ShieldAlert size={14} /> },
  ];

  return (
    <AppLayout>
      <div className="space-y-5 fade-in">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Vendor Monitoring</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-low/10 border border-status-low/30">
                <span className="w-1.5 h-1.5 rounded-full bg-status-low animate-pulse" />
                <span className="text-2xs font-semibold text-status-low">LIVE</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time monitoring status, alert trends, SLA health, and detection metrics across your supply chain
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted border border-border text-xs text-muted-foreground">
              <RefreshCw size={12} />
              <span>{lastRefresh}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-status-critical/10 border border-status-critical/30">
              <AlertTriangle size={13} className="text-status-critical" />
              <span className="text-xs font-semibold text-status-critical">4 Critical Alerts</span>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-7 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={`bg-card border ${kpi.borderCls} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                {kpi.icon}
              </div>
              <p className={`text-xl font-bold font-mono-data ${kpi.cls}`}>{kpi.value}</p>
              <p className="text-xs font-medium text-foreground mt-1 leading-tight">{kpi.label}</p>
              <p className="text-2xs text-muted-foreground mt-0.5 leading-tight">{kpi.sub}</p>
            </div>
          ))}
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
        {activeTab === 'status' && <VendorStatusGrid />}
        {activeTab === 'alerts' && <AlertTrendCharts />}
        {activeTab === 'sla' && <SlaHealthPanel />}
      </div>
    </AppLayout>
  );
}
