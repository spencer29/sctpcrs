'use client';

import React, { useState, useCallback, useRef } from 'react';
import VendorDetailModal, { type VendorDetailData } from '../../vendor-management/components/VendorDetailModal';

export interface GraphNode {
  id: string;
  label: string;
  tier: 'org' | 'tier1' | 'tier2' | 'tier3';
  risk: 'critical' | 'high' | 'medium' | 'low';
  vrs: number;
  category: string;
  x: number;
  y: number;
  isVulnChain?: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  isCriticalPath?: boolean;
  dependency: 'hard' | 'soft';
}

const NODES: GraphNode[] = [
  // Org root
  { id: 'org', label: 'Your Org', tier: 'org', risk: 'low', vrs: 12, category: 'Internal', x: 520, y: 60 },
  // Tier 1
  { id: 't1-cloud', label: 'CloudCore Ltd', tier: 'tier1', risk: 'critical', vrs: 82, category: 'Cloud Infra', x: 160, y: 200, isVulnChain: true },
  { id: 't1-sec', label: 'SecureNet AG', tier: 'tier1', risk: 'high', vrs: 67, category: 'Security', x: 400, y: 200 },
  { id: 't1-data', label: 'DataStream Inc', tier: 'tier1', risk: 'medium', vrs: 44, category: 'Data Services', x: 640, y: 200 },
  { id: 't1-net', label: 'NetBridge Corp', tier: 'tier1', risk: 'high', vrs: 71, category: 'Networking', x: 880, y: 200, isVulnChain: true },
  // Tier 2
  { id: 't2-os', label: 'OpenSys GmbH', tier: 'tier2', risk: 'critical', vrs: 88, category: 'OS/Platform', x: 80, y: 360, isVulnChain: true },
  { id: 't2-cdn', label: 'CDN Global', tier: 'tier2', risk: 'medium', vrs: 41, category: 'CDN', x: 240, y: 360 },
  { id: 't2-auth', label: 'AuthBase Ltd', tier: 'tier2', risk: 'high', vrs: 63, category: 'Identity', x: 400, y: 360 },
  { id: 't2-db', label: 'DBVault Co', tier: 'tier2', risk: 'low', vrs: 28, category: 'Database', x: 560, y: 360 },
  { id: 't2-api', label: 'APIGate Inc', tier: 'tier2', risk: 'medium', vrs: 49, category: 'API Gateway', x: 720, y: 360 },
  { id: 't2-hw', label: 'HardLink SA', tier: 'tier2', risk: 'critical', vrs: 79, category: 'Hardware', x: 880, y: 360, isVulnChain: true },
  // Tier 3
  { id: 't3-chip', label: 'ChipFab Asia', tier: 'tier3', risk: 'critical', vrs: 91, category: 'Semiconductor', x: 80, y: 520, isVulnChain: true },
  { id: 't3-raw', label: 'RawMat Corp', tier: 'tier3', risk: 'medium', vrs: 38, category: 'Raw Materials', x: 280, y: 520 },
  { id: 't3-log', label: 'LogiTrans Ltd', tier: 'tier3', risk: 'low', vrs: 22, category: 'Logistics', x: 480, y: 520 },
  { id: 't3-fw', label: 'FirmWare Co', tier: 'tier3', risk: 'high', vrs: 66, category: 'Firmware', x: 680, y: 520, isVulnChain: true },
  { id: 't3-net2', label: 'NetComp Ltd', tier: 'tier3', risk: 'medium', vrs: 45, category: 'Components', x: 880, y: 520 },
];

const EDGES: GraphEdge[] = [
  // Org → Tier 1
  { source: 'org', target: 't1-cloud', isCriticalPath: true, dependency: 'hard' },
  { source: 'org', target: 't1-sec', dependency: 'hard' },
  { source: 'org', target: 't1-data', dependency: 'soft' },
  { source: 'org', target: 't1-net', isCriticalPath: true, dependency: 'hard' },
  // Tier 1 → Tier 2
  { source: 't1-cloud', target: 't2-os', isCriticalPath: true, dependency: 'hard' },
  { source: 't1-cloud', target: 't2-cdn', dependency: 'soft' },
  { source: 't1-sec', target: 't2-auth', dependency: 'hard' },
  { source: 't1-data', target: 't2-db', dependency: 'hard' },
  { source: 't1-data', target: 't2-api', dependency: 'soft' },
  { source: 't1-net', target: 't2-hw', isCriticalPath: true, dependency: 'hard' },
  { source: 't1-net', target: 't2-api', dependency: 'soft' },
  // Tier 2 → Tier 3
  { source: 't2-os', target: 't3-chip', isCriticalPath: true, dependency: 'hard' },
  { source: 't2-cdn', target: 't3-raw', dependency: 'soft' },
  { source: 't2-auth', target: 't3-log', dependency: 'soft' },
  { source: 't2-api', target: 't3-log', dependency: 'soft' },
  { source: 't2-hw', target: 't3-fw', isCriticalPath: true, dependency: 'hard' },
  { source: 't2-hw', target: 't3-net2', dependency: 'hard' },
  { source: 't3-chip', target: 't3-fw', isCriticalPath: true, dependency: 'hard' },
];

const riskColors: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#22C55E',
};

const tierColors: Record<string, string> = {
  org: '#00D4FF',
  tier1: '#8B5CF6',
  tier2: '#3B82F6',
  tier3: '#6B7280',
};

const tierLabels: Record<string, string> = {
  org: 'Your Org',
  tier1: 'Tier 1 — Direct',
  tier2: 'Tier 2 — Sub-Vendors',
  tier3: 'Tier 3 — Nth Party',
};

function getNodeById(id: string) {
  return NODES.find((n) => n.id === id);
}

interface DependencyGraphProps {
  filterRisk: string;
  showVulnChainOnly: boolean;
}

export default function DependencyGraph({ filterRisk, showVulnChainOnly }: DependencyGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [detailVendor, setDetailVendor] = useState<VendorDetailData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const visibleNodes = NODES.filter((n) => {
    if (showVulnChainOnly && !n.isVulnChain && n.id !== 'org') return false;
    if (filterRisk !== 'all' && n.risk !== filterRisk && n.id !== 'org') return false;
    return true;
  });

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

  const visibleEdges = EDGES.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  const getConnectedIds = useCallback(
    (nodeId: string): Set<string> => {
      const connected = new Set<string>([nodeId]);
      const addConnected = (id: string) => {
        EDGES.forEach((e) => {
          if (e.source === id && !connected.has(e.target)) {
            connected.add(e.target);
            addConnected(e.target);
          }
          if (e.target === id && !connected.has(e.source)) {
            connected.add(e.source);
          }
        });
      };
      addConnected(nodeId);
      return connected;
    },
    []
  );

  const activeNodeId = selectedNode || hoveredNode;
  const connectedIds = activeNodeId ? getConnectedIds(activeNodeId) : null;

  const selectedNodeData = selectedNode ? NODES.find((n) => n.id === selectedNode) : null;

  const openVendorDetail = (node: GraphNode) => {
    const vendorDetail: VendorDetailData = {
      id: node.id,
      legalName: node.label,
      riskTier: node.risk.toUpperCase(),
      vrs: node.vrs,
      vrsChange: node.risk === 'critical' ? +7 : node.risk === 'high' ? +3 : -2,
      lifecycleState: node.risk === 'critical' ? 'UNDER_REVIEW' : 'ACTIVE',
      category: node.category,
      integrationType: 'API',
      dataAccess: node.risk === 'critical' ? ['PII', 'Credentials'] : node.risk === 'high' ? ['PII'] : ['System_Data'],
      lastAssessed: '2026-07-14',
      kevExposed: node.risk === 'critical' && node.isVulnChain,
      country: 'NG',
      compliancePct: node.vrs >= 70 ? 58 : node.vrs >= 50 ? 72 : 85,
    };
    setDetailVendor(vendorDetail);
  };

  return (
    <div className="relative w-full">
      {/* Vendor Detail Modal */}
      <VendorDetailModal vendor={detailVendor} onClose={() => setDetailVendor(null)} />

      {/* SVG Graph */}
      <div className="card-elevated overflow-hidden" style={{ height: '620px' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 1040 600"
          className="w-full h-full"
          style={{ background: 'transparent' }}
        >
          <defs>
            {/* Arrow markers */}
            <marker id="arrow-normal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="rgba(107,114,128,0.5)" />
            </marker>
            <marker id="arrow-critical" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
            </marker>
            <marker id="arrow-hover" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#00D4FF" />
            </marker>
            {/* Glow filter */}
            <filter id="glow-red">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-cyan">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Tier lane backgrounds */}
          {[
            { y: 30, h: 100, label: 'YOUR ORGANIZATION', color: 'rgba(0,212,255,0.03)' },
            { y: 160, h: 110, label: 'TIER 1 — DIRECT VENDORS', color: 'rgba(139,92,246,0.04)' },
            { y: 310, h: 110, label: 'TIER 2 — SUB-VENDORS', color: 'rgba(59,130,246,0.04)' },
            { y: 470, h: 110, label: 'TIER 3 — NTH PARTY', color: 'rgba(107,114,128,0.04)' },
          ].map((lane) => (
            <g key={`lane-${lane.y}`}>
              <rect x="10" y={lane.y} width="1020" height={lane.h} rx="6" fill={lane.color} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x="24" y={lane.y + 16} fontSize="9" fill="rgba(107,114,128,0.7)" fontFamily="monospace" letterSpacing="2">
                {lane.label}
              </text>
            </g>
          ))}

          {/* Edges */}
          {visibleEdges.map((edge, i) => {
            const src = getNodeById(edge.source);
            const tgt = getNodeById(edge.target);
            if (!src || !tgt) return null;

            const isHighlighted = connectedIds
              ? connectedIds.has(edge.source) && connectedIds.has(edge.target)
              : false;
            const isFaded = connectedIds ? !isHighlighted : false;

            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const nodeR = 28;
            const srcX = src.x + (dx / len) * nodeR;
            const srcY = src.y + (dy / len) * nodeR;
            const tgtX = tgt.x - (dx / len) * (nodeR + 6);
            const tgtY = tgt.y - (dy / len) * (nodeR + 6);

            const pathD = `M ${srcX} ${srcY} Q ${midX} ${midY - 20} ${tgtX} ${tgtY}`;

            let stroke = edge.isCriticalPath ? 'rgba(239,68,68,0.5)' : 'rgba(107,114,128,0.25)';
            let strokeWidth = edge.isCriticalPath ? 2 : 1;
            let marker = edge.isCriticalPath ? 'url(#arrow-critical)' : 'url(#arrow-normal)';
            let opacity = 1;

            if (isHighlighted) {
              stroke = '#00D4FF';
              strokeWidth = 2.5;
              marker = 'url(#arrow-hover)';
              opacity = 1;
            } else if (isFaded) {
              opacity = 0.1;
            }

            return (
              <path
                key={`edge-${i}`}
                d={pathD}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={edge.dependency === 'soft' ? '4 3' : undefined}
                markerEnd={marker}
                opacity={opacity}
                style={{ transition: 'opacity 200ms ease, stroke 200ms ease' }}
              />
            );
          })}

          {/* Nodes */}
          {visibleNodes.map((node) => {
            const isActive = activeNodeId === node.id;
            const isConnected = connectedIds ? connectedIds.has(node.id) : false;
            const isFaded = connectedIds ? !isConnected : false;
            const riskColor = riskColors[node.risk];
            const tierColor = tierColors[node.tier];

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: 'pointer', transition: 'opacity 200ms ease' }}
                opacity={isFaded ? 0.2 : 1}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  setSelectedNode(selectedNode === node.id ? null : node.id);
                  if (node.id !== 'org') openVendorDetail(node);
                }}
              >
                {/* Outer ring for vuln chain */}
                {node.isVulnChain && (
                  <circle
                    r="36"
                    fill="none"
                    stroke={riskColor}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.6"
                    filter={node.risk === 'critical' ? 'url(#glow-red)' : undefined}
                  />
                )}

                {/* Node circle */}
                <circle
                  r="28"
                  fill={isActive ? `${tierColor}22` : '#111827'}
                  stroke={isActive ? tierColor : node.isVulnChain ? riskColor : 'rgba(255,255,255,0.12)'}
                  strokeWidth={isActive ? 2.5 : node.isVulnChain ? 2 : 1}
                  filter={isActive ? 'url(#glow-cyan)' : undefined}
                />

                {/* Risk indicator arc (top-right) */}
                <circle
                  cx="18"
                  cy="-18"
                  r="8"
                  fill={riskColor}
                  opacity="0.9"
                />
                <text x="18" y="-14" textAnchor="middle" fontSize="7" fill="white" fontFamily="monospace" fontWeight="bold">
                  {node.vrs}
                </text>

                {/* Tier color dot */}
                <circle cx="0" cy="0" r="5" fill={tierColor} opacity="0.8" />

                {/* Label */}
                <text
                  y="42"
                  textAnchor="middle"
                  fontSize="9.5"
                  fill={isActive ? '#F0F4FF' : 'rgba(240,244,255,0.75)'}
                  fontFamily="system-ui, sans-serif"
                  fontWeight={isActive ? '600' : '400'}
                >
                  {node.label}
                </text>
                <text
                  y="54"
                  textAnchor="middle"
                  fontSize="8"
                  fill="rgba(107,114,128,0.8)"
                  fontFamily="monospace"
                >
                  {node.category}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected node detail panel */}
      {selectedNodeData && (
        <div className="absolute top-4 right-4 w-56 card-elevated p-4 space-y-3 z-10 slide-up">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">{selectedNodeData.label}</p>
              <p className="text-2xs text-muted-foreground mt-0.5">{selectedNodeData.category}</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-muted-foreground hover:text-foreground text-xs leading-none"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-muted-foreground">VRS Score</span>
              <span className="font-mono-data text-xs font-bold" style={{ color: riskColors[selectedNodeData.risk] }}>
                {selectedNodeData.vrs}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs text-muted-foreground">Risk Tier</span>
              <span
                className="text-2xs font-semibold px-1.5 py-0.5 rounded uppercase"
                style={{
                  color: riskColors[selectedNodeData.risk],
                  background: `${riskColors[selectedNodeData.risk]}18`,
                  border: `1px solid ${riskColors[selectedNodeData.risk]}40`,
                }}
              >
                {selectedNodeData.risk}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs text-muted-foreground">Network Tier</span>
              <span className="text-2xs font-mono-data text-foreground capitalize">{tierLabels[selectedNodeData.tier]?.split('—')[0]?.trim()}</span>
            </div>
            {selectedNodeData.isVulnChain && (
              <div className="flex items-center gap-1.5 mt-1 px-2 py-1.5 rounded bg-status-critical-bg border border-status-critical/30">
                <span className="w-1.5 h-1.5 rounded-full bg-status-critical alert-pulse flex-shrink-0" />
                <span className="text-2xs text-status-critical font-semibold">Vulnerability Chain Node</span>
              </div>
            )}
          </div>
          <div className="pt-1 border-t border-border">
            <p className="text-2xs text-muted-foreground">
              {EDGES.filter((e) => e.target === selectedNodeData.id).length} upstream ·{' '}
              {EDGES.filter((e) => e.source === selectedNodeData.id).length} downstream
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
