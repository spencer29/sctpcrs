'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionGate } from '@/components/rbac/PermissionGate';
import VendorTableHeader from './components/VendorTableHeader';
import VendorDataTable from './components/VendorDataTable';
import { ShieldOff } from 'lucide-react';

export default function VendorManagementPage() {
  const { can, loading } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-5 fade-in">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Vendor Registry</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              53 vendors registered ·{' '}
              <span className="text-status-critical font-mono-data">4 CRITICAL</span> ·{' '}
              <span className="text-status-high font-mono-data">11 HIGH</span> ·{' '}
              <span className="text-muted-foreground font-mono-data">3 pending onboarding</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PermissionGate resource="vendors" action="export" silent>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted border border-border text-xs font-medium text-foreground hover:bg-secondary transition-all duration-150">
                Export CSV
              </button>
            </PermissionGate>
            <PermissionGate resource="vendors" action="create" silent>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95">
                + Register Vendor
              </button>
            </PermissionGate>
          </div>
        </div>

        <PermissionGate
          resource="vendors"
          action="view"
          fallback={
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <ShieldOff size={40} className="text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Access Restricted</p>
              <p className="text-xs text-muted-foreground">You do not have permission to view vendors.</p>
            </div>
          }
        >
          <VendorTableHeader />
          <VendorDataTable />
        </PermissionGate>
      </div>
    </AppLayout>
  );
}