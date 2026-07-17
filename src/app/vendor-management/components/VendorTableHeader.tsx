'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const tierFilters = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const stateFilters = ['ALL STATES', 'ACTIVE', 'UNDER_REVIEW', 'SUSPENDED', 'PENDING_REGISTRATION', 'OFFBOARDING'];
const categoryFilters = ['ALL CATEGORIES', 'Payment Gateway', 'KYC/AML', 'Cloud Infra', 'Payment Processor', 'Identity Verification'];

export default function VendorTableHeader() {
  const [search, setSearch] = useState('');
  const [activeTier, setActiveTier] = useState('ALL');
  const [activeState, setActiveState] = useState('ALL STATES');
  const [activeCategory, setActiveCategory] = useState('ALL CATEGORIES');
  const [kevOnly, setKevOnly] = useState(false);

  const tierColor: Record<string, string> = {
    ALL: 'bg-muted text-foreground border-border',
    CRITICAL: 'badge-critical',
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low',
  };

  const hasFilters = activeTier !== 'ALL' || activeState !== 'ALL STATES' || activeCategory !== 'ALL CATEGORIES' || kevOnly || search;

  return (
    <div className="card-elevated p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor name, registration no, contact…"
            className="w-full bg-input border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          )}
        </div>

        {/* State filter */}
        <select
          value={activeState}
          onChange={(e) => setActiveState(e.target.value)}
          className="bg-input border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {stateFilters.map((s) => (
            <option key={`state-opt-${s}`} value={s}>{s}</option>
          ))}
        </select>

        {/* Category filter */}
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="bg-input border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {categoryFilters.map((c) => (
            <option key={`cat-opt-${c}`} value={c}>{c}</option>
          ))}
        </select>

        {/* KEV toggle */}
        <button
          onClick={() => setKevOnly((p) => !p)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all duration-150 ${
            kevOnly ? 'badge-critical' : 'bg-muted text-muted-foreground border-border hover:border-status-critical/50 hover:text-status-critical'
          }`}
        >
          KEV Only
        </button>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setActiveTier('ALL'); setActiveState('ALL STATES'); setActiveCategory('ALL CATEGORIES'); setKevOnly(false); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Tier chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-2xs text-muted-foreground font-semibold uppercase tracking-wider">Risk Tier:</span>
        {tierFilters.map((tier) => (
          <button
            key={`tier-chip-${tier}`}
            onClick={() => setActiveTier(tier)}
            className={`text-2xs font-mono-data font-semibold px-2.5 py-1 rounded-md border transition-all duration-150 ${
              activeTier === tier
                ? tierColor[tier]
                : 'bg-transparent text-muted-foreground border-border hover:border-border/80 hover:text-foreground'
            }`}
          >
            {tier}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-2xs text-muted-foreground">
          <SlidersHorizontal size={11} />
          <span>Showing 53 vendors</span>
        </div>
      </div>
    </div>
  );
}