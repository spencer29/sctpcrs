import React from 'react';
import AppLayout from '@/components/AppLayout';
import VendorTableHeader from './components/VendorTableHeader';
import VendorDataTable from './components/VendorDataTable';

export default function VendorManagementPage() {
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted border border-border text-xs font-medium text-foreground hover:bg-secondary transition-all duration-150">
              Export CSV
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95">
              + Register Vendor
            </button>
          </div>
        </div>

        <VendorTableHeader />
        <VendorDataTable />
      </div>
    </AppLayout>
  );
}