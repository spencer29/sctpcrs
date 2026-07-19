'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Eye, FileSearch, PauseCircle, MoreHorizontal, AlertTriangle, ChevronUp, ChevronDown, ChevronsUpDown, CheckSquare, Square, Send, Download, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import VendorDetailModal from './VendorDetailModal';
import VendorRiskWorkflowModal from './VendorRiskWorkflowModal';

// Backend integration point: GET /api/v1/vendors?page=1&size=12&sort=vrs_desc
const vendorData = [
  {
    id: 'vendor-001',
    legalName: 'Paystack Integration Ltd',
    registrationNo: 'RC-1234567',
    riskTier: 'CRITICAL' as const,
    vrs: 82,
    vrsChange: +7,
    lifecycleState: 'ACTIVE',
    category: 'Payment Gateway',
    integrationType: 'API',
    dataAccess: ['Card_Data', 'PII', 'Credentials'],
    contractEnd: '2025-03-15',
    lastAssessed: '2026-07-14',
    kevExposed: true,
    country: 'NG',
    contact: 'Chidi Okafor',
    compliancePct: 61,
  },
  {
    id: 'vendor-002',
    legalName: 'Interswitch Cloud Services',
    registrationNo: 'RC-7654321',
    riskTier: 'CRITICAL' as const,
    vrs: 79,
    vrsChange: +18,
    lifecycleState: 'ACTIVE',
    category: 'Cloud Infra',
    integrationType: 'API',
    dataAccess: ['PII', 'Credentials', 'Banking_Data'],
    contractEnd: '2026-11-30',
    lastAssessed: '2026-07-16',
    kevExposed: false,
    country: 'NG',
    contact: 'Ngozi Adeyemi',
    compliancePct: 54,
  },
  {
    id: 'vendor-003',
    legalName: 'Flutterwave SDK Services',
    registrationNo: 'RC-9988776',
    riskTier: 'CRITICAL' as const,
    vrs: 76,
    vrsChange: +4,
    lifecycleState: 'ACTIVE',
    category: 'Payment Gateway',
    integrationType: 'SDK',
    dataAccess: ['Card_Data', 'PII'],
    contractEnd: '2025-08-20',
    lastAssessed: '2026-07-16',
    kevExposed: true,
    country: 'NG',
    contact: 'Emeka Nwosu',
    compliancePct: 68,
  },
  {
    id: 'vendor-004',
    legalName: 'CloudPay Africa Ltd',
    registrationNo: 'RC-5544332',
    riskTier: 'CRITICAL' as const,
    vrs: 74,
    vrsChange: +9,
    lifecycleState: 'ACTIVE',
    category: 'Payment Processor',
    integrationType: 'API',
    dataAccess: ['Card_Data', 'Banking_Data'],
    contractEnd: '2026-05-01',
    lastAssessed: '2026-07-15',
    kevExposed: true,
    country: 'NG',
    contact: 'Aisha Bello',
    compliancePct: 57,
  },
  {
    id: 'vendor-005',
    legalName: 'GTCo Digital Labs',
    registrationNo: 'RC-3322110',
    riskTier: 'HIGH' as const,
    vrs: 71,
    vrsChange: -3,
    lifecycleState: 'UNDER_REVIEW',
    category: 'KYC/AML',
    integrationType: 'API',
    dataAccess: ['PII', 'Identity_Data'],
    contractEnd: '2026-12-31',
    lastAssessed: '2026-07-07',
    kevExposed: false,
    country: 'NG',
    contact: 'Olumide Fashola',
    compliancePct: 72,
  },
  {
    id: 'vendor-006',
    legalName: 'RemitaNet Technologies',
    registrationNo: 'RC-6677889',
    riskTier: 'HIGH' as const,
    vrs: 68,
    vrsChange: +2,
    lifecycleState: 'ACTIVE',
    category: 'Payment Processor',
    integrationType: 'API',
    dataAccess: ['Banking_Data', 'PII'],
    contractEnd: '2025-10-15',
    lastAssessed: '2026-07-12',
    kevExposed: false,
    country: 'NG',
    contact: 'Fatima Aliyu',
    compliancePct: 76,
  },
  {
    id: 'vendor-007',
    legalName: 'Unified Payments Ltd',
    registrationNo: 'RC-1122334',
    riskTier: 'HIGH' as const,
    vrs: 65,
    vrsChange: -5,
    lifecycleState: 'ACTIVE',
    category: 'Payment Gateway',
    integrationType: 'API',
    dataAccess: ['Card_Data'],
    contractEnd: '2027-01-20',
    lastAssessed: '2026-07-10',
    kevExposed: false,
    country: 'NG',
    contact: 'Tunde Badmus',
    compliancePct: 81,
  },
  {
    id: 'vendor-008',
    legalName: 'Veritas KYC Solutions',
    registrationNo: 'RC-4455667',
    riskTier: 'HIGH' as const,
    vrs: 63,
    vrsChange: +1,
    lifecycleState: 'QUESTIONNAIRE_SENT',
    category: 'Identity Verification',
    integrationType: 'API',
    dataAccess: ['PII', 'Identity_Data', 'Biometrics'],
    contractEnd: '2026-09-30',
    lastAssessed: '2026-06-20',
    kevExposed: false,
    country: 'NG',
    contact: 'Chinwe Obi',
    compliancePct: 43,
  },
  {
    id: 'vendor-009',
    legalName: 'FinEdge Analytics',
    registrationNo: 'RC-8899001',
    riskTier: 'MEDIUM' as const,
    vrs: 48,
    vrsChange: -2,
    lifecycleState: 'ACTIVE',
    category: 'Analytics',
    integrationType: 'SaaS',
    dataAccess: ['Anonymised_Data'],
    contractEnd: '2026-06-30',
    lastAssessed: '2026-07-01',
    kevExposed: false,
    country: 'NG',
    contact: 'Bayo Adewale',
    compliancePct: 88,
  },
  {
    id: 'vendor-010',
    legalName: 'TrustID Africa Ltd',
    registrationNo: 'RC-2233445',
    riskTier: 'MEDIUM' as const,
    vrs: 44,
    vrsChange: 0,
    lifecycleState: 'ACTIVE',
    category: 'Identity Verification',
    integrationType: 'API',
    dataAccess: ['PII', 'Identity_Data'],
    contractEnd: '2026-08-15',
    lastAssessed: '2026-06-28',
    kevExposed: false,
    country: 'NG',
    contact: 'Yetunde Ojo',
    compliancePct: 79,
  },
  {
    id: 'vendor-011',
    legalName: 'NigeriaHost Cloud Ltd',
    registrationNo: 'RC-5566778',
    riskTier: 'MEDIUM' as const,
    vrs: 41,
    vrsChange: -4,
    lifecycleState: 'ACTIVE',
    category: 'Cloud Infra',
    integrationType: 'SaaS',
    dataAccess: ['System_Data'],
    contractEnd: '2027-03-01',
    lastAssessed: '2026-07-05',
    kevExposed: false,
    country: 'NG',
    contact: 'Ikenna Eze',
    compliancePct: 83,
  },
  {
    id: 'vendor-012',
    legalName: 'SecureSign Digital',
    registrationNo: 'RC-9900112',
    riskTier: 'LOW' as const,
    vrs: 22,
    vrsChange: +1,
    lifecycleState: 'ACTIVE',
    category: 'Document Management',
    integrationType: 'SaaS',
    dataAccess: ['Contract_Data'],
    contractEnd: '2026-12-01',
    lastAssessed: '2026-06-15',
    kevExposed: false,
    country: 'NG',
    contact: 'Amara Osei',
    compliancePct: 94,
  },
];

type SortField = 'legalName' | 'riskTier' | 'vrs' | 'lifecycleState' | 'contractEnd' | 'lastAssessed' | 'compliancePct';
type SortDir = 'asc' | 'desc' | null;

const tierOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, PENDING: 0 };

const tierBadge: Record<string, string> = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
};

const stateColor: Record<string, string> = {
  ACTIVE: 'text-status-low bg-status-low/10 border-status-low/30',
  UNDER_REVIEW: 'text-status-info bg-status-info/10 border-status-info/30',
  QUESTIONNAIRE_SENT: 'text-primary bg-primary/10 border-primary/30',
  PENDING_REGISTRATION: 'text-muted-foreground bg-muted border-border',
  SUSPENDED: 'text-status-high bg-status-high/10 border-status-high/30',
  OFFBOARDING: 'text-status-medium bg-status-medium/10 border-status-medium/30',
  TERMINATED: 'text-status-critical bg-status-critical/10 border-status-critical/30',
  REMEDIATION_REQUIRED: 'text-status-medium bg-status-medium/10 border-status-medium/30',
  APPROVED: 'text-status-low bg-status-low/10 border-status-low/30',
};

const dataAccessColor: Record<string, string> = {
  Card_Data: 'badge-critical',
  PII: 'badge-high',
  Credentials: 'badge-critical',
  Banking_Data: 'badge-high',
  Identity_Data: 'badge-medium',
  Biometrics: 'badge-high',
  Anonymised_Data: 'badge-low',
  System_Data: 'badge-info',
  Contract_Data: 'badge-info',
};

const vrsColor = (vrs: number) => {
  if (vrs >= 70) return 'text-status-critical';
  if (vrs >= 50) return 'text-status-high';
  if (vrs >= 30) return 'text-status-medium';
  return 'text-status-low';
};

const isContractExpiringSoon = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date('2026-07-17');
  const diffDays = Math.floor((d.getTime() - now.getTime()) / 86400000);
  return diffDays >= 0 && diffDays <= 90;
};

const isContractExpired = (dateStr: string) => {
  return new Date(dateStr) < new Date('2026-07-17');
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const PAGE_SIZE_OPTIONS = [10, 12, 20, 50];

export default function VendorDataTable() {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('vrs');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [detailVendor, setDetailVendor] = useState<typeof vendorData[0] | null>(null);
  const [riskWorkflowVendor, setRiskWorkflowVendor] = useState<typeof vendorData[0] | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const sorted = [...vendorData].sort((a, b) => {
    if (!sortDir) return 0;
    let aVal: any, bVal: any;
    switch (sortField) {
      case 'legalName': aVal = a.legalName; bVal = b.legalName; break;
      case 'riskTier': aVal = tierOrder[a.riskTier] ?? 0; bVal = tierOrder[b.riskTier] ?? 0; break;
      case 'vrs': aVal = a.vrs; bVal = b.vrs; break;
      case 'lifecycleState': aVal = a.lifecycleState; bVal = b.lifecycleState; break;
      case 'contractEnd': aVal = new Date(a.contractEnd).getTime(); bVal = new Date(b.contractEnd).getTime(); break;
      case 'lastAssessed': aVal = new Date(a.lastAssessed).getTime(); bVal = new Date(b.lastAssessed).getTime(); break;
      case 'compliancePct': aVal = a.compliancePct; bVal = b.compliancePct; break;
      default: return 0;
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const allSelected = paginated.length > 0 && paginated.every((v) => selected.has(v.id));
  const someSelected = paginated.some((v) => selected.has(v.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        paginated.forEach((v) => next.delete(v.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        paginated.forEach((v) => next.add(v.id));
        return next;
      });
    }
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field || !sortDir) return <ChevronsUpDown size={11} className="text-muted-foreground/50" />;
    return sortDir === 'asc' ? <ChevronUp size={11} className="text-primary" /> : <ChevronDown size={11} className="text-primary" />;
  };

  const handleBulkSuspend = () => {
    toast.warning(`${selected.size} vendor(s) flagged for suspension review`);
    setSelected(new Set());
  };

  const handleBulkAssess = () => {
    toast.success(`Assessment triggered for ${selected.size} vendor(s)`);
    setSelected(new Set());
  };

  const handleBulkExport = () => {
    toast.success(`Exporting ${selected.size} vendor records as CSV`);
    setSelected(new Set());
  };

  const columns: { label: string; field?: SortField; align?: string }[] = [
    { label: '' },
    { label: 'Vendor', field: 'legalName' },
    { label: 'Tier', field: 'riskTier' },
    { label: 'VRS', field: 'vrs' },
    { label: '30d Δ' },
    { label: 'Lifecycle', field: 'lifecycleState' },
    { label: 'Category' },
    { label: 'Integration' },
    { label: 'Data Access' },
    { label: 'Contract End', field: 'contractEnd' },
    { label: 'Compliance', field: 'compliancePct' },
    { label: 'Last Assessed', field: 'lastAssessed' },
    { label: '' },
  ];

  return (
    <div className="space-y-3">
      {/* Vendor Detail Modal */}
      <VendorDetailModal vendor={detailVendor} onClose={() => setDetailVendor(null)} />

      {/* Risk Officer Workflow Modal */}
      <VendorRiskWorkflowModal vendor={riskWorkflowVendor} onClose={() => setRiskWorkflowVendor(null)} />

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="slide-up flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-sm">
          <span className="text-primary font-semibold font-mono-data">{selected.size} selected</span>
          <div className="h-4 w-px bg-border" />
          <button onClick={handleBulkAssess} className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors">
            <Send size={13} /> Trigger Assessment
          </button>
          <button onClick={handleBulkSuspend} className="flex items-center gap-1.5 text-xs text-foreground hover:text-status-high transition-colors">
            <PauseCircle size={13} /> Suspend
          </button>
          <button onClick={handleBulkExport} className="flex items-center gap-1.5 text-xs text-foreground hover:text-status-info transition-colors">
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[1200px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {/* Checkbox */}
                <th className="w-10 pl-4 py-3 text-left">
                  <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground transition-colors">
                    {allSelected ? (
                      <CheckSquare size={14} className="text-primary" />
                    ) : someSelected ? (
                      <CheckSquare size={14} className="text-primary/50" />
                    ) : (
                      <Square size={14} />
                    )}
                  </button>
                </th>
                {columns.slice(1).map((col, i) => (
                  <th
                    key={`col-hdr-${i}`}
                    onClick={col.field ? () => handleSort(col.field!) : undefined}
                    className={`py-3 pr-4 text-left text-2xs font-semibold tracking-widest uppercase text-muted-foreground whitespace-nowrap ${
                      col.field ? 'cursor-pointer hover:text-foreground select-none' : ''
                    } ${col.align === 'right' ? 'text-right' : ''}`}
                  >
                    <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      {col.label}
                      {col.field && <SortIcon field={col.field} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((vendor) => {
                const TrendIcon = vendor.vrsChange > 0 ? TrendingUp : vendor.vrsChange < 0 ? TrendingDown : Minus;
                const trendColor = vendor.vrsChange > 0 ? 'text-status-critical' : vendor.vrsChange < 0 ? 'text-status-low' : 'text-muted-foreground';
                const contractExpiring = isContractExpiringSoon(vendor.contractEnd);
                const contractExpired = isContractExpired(vendor.contractEnd);
                const isSelected = selected.has(vendor.id);

                return (
                  <tr
                    key={vendor.id}
                    className={`border-b border-border/50 table-row-hover transition-colors group ${isSelected ? 'bg-primary/5' : ''}`}
                    onClick={(e) => {
                      // Don't open modal when clicking checkbox or action buttons
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('a')) return;
                      router.push(`/vendor-management/${vendor.id}`);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Checkbox */}
                    <td className="pl-4 py-3">
                      <button onClick={() => toggleRow(vendor.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {isSelected ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} />}
                      </button>
                    </td>

                    {/* Vendor name */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5 max-w-[200px]">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground truncate">{vendor.legalName}</span>
                            {vendor.kevExposed && (
                              <AlertTriangle size={11} className="text-status-critical flex-shrink-0 alert-pulse" title="KEV-exposed" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono-data text-2xs text-muted-foreground">{vendor.registrationNo}</span>
                            <span className="text-2xs text-muted-foreground">·</span>
                            <span className="text-2xs text-muted-foreground">{vendor.country}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-3 pr-4">
                      <span className={`text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded ${tierBadge[vendor.riskTier]}`}>
                        {vendor.riskTier}
                      </span>
                    </td>

                    {/* VRS */}
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-mono-data font-bold text-base leading-none ${vrsColor(vendor.vrs)}`}>
                          {vendor.vrs}
                        </span>
                        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              vendor.vrs >= 70 ? 'bg-status-critical' :
                              vendor.vrs >= 50 ? 'bg-status-high' :
                              vendor.vrs >= 30 ? 'bg-status-medium' : 'bg-status-low'
                            }`}
                            style={{ width: `${vendor.vrs}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* VRS Change */}
                    <td className="py-3 pr-4">
                      <div className={`flex items-center gap-0.5 ${trendColor}`}>
                        <TrendIcon size={11} />
                        <span className="font-mono-data text-2xs font-semibold">
                          {vendor.vrsChange > 0 ? '+' : ''}{vendor.vrsChange}
                        </span>
                      </div>
                    </td>

                    {/* Lifecycle state */}
                    <td className="py-3 pr-4">
                      <span className={`text-2xs font-mono-data font-medium px-1.5 py-0.5 rounded border whitespace-nowrap ${stateColor[vendor.lifecycleState] ?? 'text-muted-foreground bg-muted border-border'}`}>
                        {vendor.lifecycleState.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{vendor.category}</td>

                    {/* Integration type */}
                    <td className="py-3 pr-4">
                      <span className="text-2xs font-mono-data text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {vendor.integrationType}
                      </span>
                    </td>

                    {/* Data access */}
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {vendor.dataAccess.slice(0, 2).map((d) => (
                          <span key={`${vendor.id}-da-${d}`} className={`text-2xs font-mono-data px-1 py-0.5 rounded ${dataAccessColor[d] ?? 'badge-info'}`}>
                            {d.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {vendor.dataAccess.length > 2 && (
                          <span className="text-2xs text-muted-foreground">+{vendor.dataAccess.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Contract end */}
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-mono-data text-xs ${
                          contractExpired ? 'text-status-critical' : contractExpiring ?'text-status-medium' : 'text-foreground'
                        }`}>
                          {formatDate(vendor.contractEnd)}
                        </span>
                        {contractExpired && (
                          <span className="text-2xs text-status-critical">EXPIRED</span>
                        )}
                        {!contractExpired && contractExpiring && (
                          <span className="text-2xs text-status-medium">Expiring soon</span>
                        )}
                      </div>
                    </td>

                    {/* Compliance */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              vendor.compliancePct >= 80 ? 'bg-status-low' :
                              vendor.compliancePct >= 60 ? 'bg-status-medium' : 'bg-status-high'
                            }`}
                            style={{ width: `${vendor.compliancePct}%` }}
                          />
                        </div>
                        <span className="font-mono-data text-2xs text-muted-foreground">{vendor.compliancePct}%</span>
                      </div>
                    </td>

                    {/* Last assessed */}
                    <td className="py-3 pr-4 font-mono-data text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(vendor.lastAssessed)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="View vendor profile"
                          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
                          onClick={(e) => { e.stopPropagation(); router.push(`/vendor-management/${vendor.id}`); }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          title="Assess vendor risk"
                          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-status-high hover:bg-status-high/10 transition-all duration-150"
                          onClick={(e) => { e.stopPropagation(); setRiskWorkflowVendor(vendor); }}
                        >
                          <FileSearch size={13} />
                        </button>
                        <button
                          title="Suspend vendor"
                          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-status-high hover:bg-status-high/10 transition-all duration-150"
                          onClick={() => toast.warning(`Suspension review started for ${vendor.legalName}`)}
                        >
                          <PauseCircle size={13} />
                        </button>
                        <div className="relative">
                          <button
                            title="More actions"
                            onClick={() => setActionMenuOpen(actionMenuOpen === vendor.id ? null : vendor.id)}
                            className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                          >
                            <MoreHorizontal size={13} />
                          </button>
                          {actionMenuOpen === vendor.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-xl z-20 py-1 fade-in">
                              {[
                                { label: 'View Timeline', icon: <Eye size={12} /> },
                                { label: 'Assess Vendor Risk', icon: <ShieldAlert size={12} />, action: () => { setRiskWorkflowVendor(vendor); setActionMenuOpen(null); } },
                                { label: 'Upload Document', icon: <Download size={12} /> },
                                { label: 'Trigger Re-Score', icon: <FileSearch size={12} /> },
                                { label: 'Initiate Offboarding', icon: <PauseCircle size={12} />, danger: true },
                              ].map((action) => (
                                <button
                                  key={`menu-${vendor.id}-${action.label}`}
                                  onClick={() => { if (action.action) { action.action(); } else { toast.success(`${action.label}: ${vendor.legalName}`); setActionMenuOpen(null); } }}
                                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors hover:bg-muted ${
                                    action.danger ? 'text-status-critical' : 'text-foreground'
                                  }`}
                                >
                                  {action.icon}
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="bg-input border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={`pgsz-${s}`} value={s}>{s}</option>
              ))}
            </select>
            <span className="font-mono-data">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-7 h-7 rounded flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={`page-btn-${p}`}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono-data transition-all ${
                    page === p
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 rounded flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="w-7 h-7 rounded flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}