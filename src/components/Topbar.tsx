'use client';

import React, { useState } from 'react';
import { Search, Bell, RefreshCw, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_DEFINITIONS } from '@/lib/rbac/permissions';

interface TopbarProps {
  sidebarCollapsed: boolean;
}

export default function Topbar({ sidebarCollapsed }: TopbarProps) {
  const [searchVal, setSearchVal] = useState('');
  const { role, profile } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-4 px-6 lg:px-8 xl:px-10 2xl:px-12 flex-shrink-0 sticky top-0 z-40">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search vendors, alerts, incidents… ⌘K"
          className="w-full bg-input border border-border rounded-md pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary/50 transition-all"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Live status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-status-low alert-pulse" />
          <span className="text-2xs font-mono-data text-muted-foreground">LIVE</span>
        </div>

        {/* Last refresh */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground text-2xs font-mono-data">
          <Clock size={11} />
          <span>Updated 2m ago</span>
        </div>

        {/* Refresh */}
        <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 active:scale-95">
          <RefreshCw size={14} />
        </button>

        {/* Security posture */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-status-low/10 border border-status-low/20 text-status-low text-2xs font-semibold">
          <Shield size={12} />
          <span>TLS 1.3</span>
        </div>

        {/* Role badge */}
        {role && (
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-2xs font-semibold ${ROLE_DEFINITIONS[role].badgeClass}`}>
            <span>{ROLE_DEFINITIONS[role].label}</span>
          </div>
        )}

        {/* Alerts bell */}
        <button className="relative w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-critical alert-pulse" />
        </button>
      </div>
    </header>
  );
}