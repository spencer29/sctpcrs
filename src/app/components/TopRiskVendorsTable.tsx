'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import VendorDetailModal, { type VendorDetailData } from '../vendor-management/components/VendorDetailModal';
import { createClient } from '@/lib/supabase/client';

interface VendorRow {
  id: string;
  name: string;
  tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  vrs: number;
  vrsChange: number;
  category: string;
  lifecycle: string;
  kevExposed: boolean;
  lastAssessed: string;
  compliancePct: number;
}

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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TopRiskVendorsTable() {
  const [detailVendor, setDetailVendor] = useState<VendorDetailData | null>(null);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data: alerts } = await supabase
        .from('alerts')
        .select('vendor, severity, alert_type, created_at, updated_at')
        .neq('status', 'dismissed')
        .order('created_at', { ascending: false });

      if (!alerts || alerts.length === 0) {
        setLoading(false);
        return;
      }

      // Aggregate per vendor
      const vendorMap = new Map<string, {
        alerts: typeof alerts;
        maxSeverity: string;
        kevExposed: boolean;
        lastSeen: string;
      }>();

      const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

      alerts.forEach((a) => {
        if (!a.vendor) return;
        const existing = vendorMap.get(a.vendor);
        if (!existing) {
          vendorMap.set(a.vendor, {
            alerts: [a],
            maxSeverity: a.severity,
            kevExposed: a.alert_type === 'KEV_MATCH',
            lastSeen: a.updated_at || a.created_at,
          });
        } else {
          existing.alerts.push(a);
          if (severityOrder.indexOf(a.severity) < severityOrder.indexOf(existing.maxSeverity)) {
            existing.maxSeverity = a.severity;
          }
          if (a.alert_type === 'KEV_MATCH') existing.kevExposed = true;
          if (new Date(a.updated_at || a.created_at) > new Date(existing.lastSeen)) {
            existing.lastSeen = a.updated_at || a.created_at;
          }
        }
      });

      // Build vendor rows sorted by severity then alert count
      const rows: VendorRow[] = [];
      vendorMap.forEach((val, name) => {
        const tier = val.maxSeverity as VendorRow['tier'];
        const alertCount = val.alerts.length;
        const critCount = val.alerts.filter((a) => a.severity === 'CRITICAL').length;
        // VRS proxy: higher alert count + severity = higher VRS
        const vrs = Math.min(99, 30 + critCount * 15 + alertCount * 5);
        // Compliance proxy: inverse of alert density
        const compliancePct = Math.max(20, 100 - alertCount * 8);

        rows.push({
          id: `vendor-${name.replace(/\s+/g, '-').toLowerCase()}`,
          name,
          tier,
          vrs,
          vrsChange: critCount > 0 ? critCount * 3 : 0,
          category: 'Vendor',
          lifecycle: 'ACTIVE',
          kevExposed: val.kevExposed,
          lastAssessed: timeAgo(val.lastSeen),
          compliancePct,
        });
      });

      // Sort: CRITICAL first, then by VRS desc
      rows.sort((a, b) => {
        const tierA = severityOrder.indexOf(a.tier);
        const tierB = severityOrder.indexOf(b.tier);
        if (tierA !== tierB) return tierA - tierB;
        return b.vrs - a.vrs;
      });

      setVendors(rows.slice(0, 5));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

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

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      ) : vendors.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No vendor risk data available</p>
      ) : (
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
              {vendors.map((v) => {
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
                        href={`/vendor-management`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-2xs text-primary hover:text-primary/80"
                        onClick={(e) => e.stopPropagation()}
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
      )}
    </div>
  );
}