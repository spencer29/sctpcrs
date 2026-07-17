'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import VendorDetailModal, { type VendorDetailData } from '../vendor-management/components/VendorDetailModal';

// Backend integration point: GET /api/v1/vendors?sort=vrs_desc&limit=5&tier=CRITICAL,HIGH
const topRiskVendors = [
  {
    id: 'vendor-001',
    name: 'Paystack Integration Ltd',
    tier: 'CRITICAL' as const,
    vrs: 82,
    vrsChange: +7,
    category: 'Payment Gateway',
    lifecycle: 'ACTIVE',
    kevExposed: true,
    lastAssessed: '3d ago',
    compliancePct: 61,
  },
  {
    id: 'vendor-002',
    name: 'Interswitch Cloud Services',
    tier: 'CRITICAL' as const,
    vrs: 79,
    vrsChange: +18,
    category: 'Cloud Infra',
    lifecycle: 'ACTIVE',
    kevExposed: false,
    lastAssessed: '1d ago',
    compliancePct: 54,
  },
  {
    id: 'vendor-003',
    name: 'Flutterwave SDK Services',
    tier: 'CRITICAL' as const,
    vrs: 76,
    vrsChange: +4,
    category: 'Payment Gateway',
    lifecycle: 'ACTIVE',
    kevExposed: true,
    lastAssessed: '1d ago',
    compliancePct: 68,
  },
  {
    id: 'vendor-004',
    name: 'GTCo Digital Labs',
    tier: 'HIGH' as const,
    vrs: 71,
    vrsChange: -3,
    category: 'KYC/AML',
    lifecycle: 'UNDER_REVIEW',
    kevExposed: false,
    lastAssessed: '10d ago',
    compliancePct: 72,
  },
  {
    id: 'vendor-005',
    name: 'RemitaNet Technologies',
    tier: 'HIGH' as const,
    vrs: 68,
    vrsChange: +2,
    category: 'Payment Processor',
    lifecycle: 'ACTIVE',
    kevExposed: false,
    lastAssessed: '5d ago',
    compliancePct: 76,
  },
];

const tierBadge: Record<string, string> = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
};

const vrsColor = (vrs: number) => {
  if (vrs >= 70) return 'text-status-critical';
  if (vrs >= 50) return 'text-status-high';
  if (vrs >= 30) return 'text-status-medium';
  return 'text-status-low';
};

export default function TopRiskVendorsTable() {
  const [detailVendor, setDetailVendor] = useState<VendorDetailData | null>(null);

  return (
    <div className="card-elevated p-5">
      {/* Vendor Detail Modal */}
      <VendorDetailModal vendor={detailVendor} onClose={() => setDetailVendor(null)} />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Top Risk Vendors</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Highest VRS — requires immediate attention</p>
        </div>
        <Link href="/vendor-management" className="text-2xs text-primary hover:text-primary/80 font-medium transition-colors">
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {['Vendor', 'Tier', 'VRS', '30d', 'Category', 'Compliance', 'Assessed', ''].map((h, i) => (
                <th
                  key={`th-topvend-${i}`}
                  className="text-left text-2xs font-semibold tracking-widest uppercase text-muted-foreground pb-2.5 pr-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topRiskVendors.map((v) => {
              const TrendIcon = v.vrsChange > 0 ? TrendingUp : v.vrsChange < 0 ? TrendingDown : Minus;
              const trendColor = v.vrsChange > 0 ? 'text-status-critical' : v.vrsChange < 0 ? 'text-status-low' : 'text-muted-foreground';

              return (
                <tr
                  key={v.id}
                  className="border-b border-border/50 table-row-hover transition-colors group"
                  onClick={() => setDetailVendor({
                    id: v.id,
                    legalName: v.name,
                    riskTier: v.tier,
                    vrs: v.vrs,
                    vrsChange: v.vrsChange,
                    lifecycleState: v.lifecycle,
                    category: v.category,
                    kevExposed: v.kevExposed,
                    lastAssessed: v.lastAssessed,
                    compliancePct: v.compliancePct,
                  })}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground truncate max-w-[160px]">{v.name}</span>
                      {v.kevExposed && (
                        <span title="KEV-exposed vendor" className="flex-shrink-0">
                          <AlertTriangle size={11} className="text-status-critical alert-pulse" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded ${tierBadge[v.tier]}`}>
                      {v.tier}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`font-mono-data font-bold text-sm ${vrsColor(v.vrs)}`}>{v.vrs}</span>
                    <span className="text-muted-foreground font-mono-data">/100</span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className={`flex items-center gap-0.5 ${trendColor}`}>
                      <TrendIcon size={11} />
                      <span className="font-mono-data text-2xs font-semibold">
                        {v.vrsChange > 0 ? '+' : ''}{v.vrsChange}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{v.category}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            v.compliancePct >= 75 ? 'bg-status-low' :
                            v.compliancePct >= 60 ? 'bg-status-medium' : 'bg-status-high'
                          }`}
                          style={{ width: `${v.compliancePct}%` }}
                        />
                      </div>
                      <span className="font-mono-data text-2xs text-muted-foreground">{v.compliancePct}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 font-mono-data text-muted-foreground whitespace-nowrap">{v.lastAssessed}</td>
                  <td className="py-2.5">
                    <Link
                      href={`/vendors/${v.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-2xs text-primary hover:text-primary/80"
                    >
                      View <ExternalLink size={10} />
                    </Link>
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