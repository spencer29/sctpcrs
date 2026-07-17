'use client';

import React, { useState } from 'react';
import { ArrowUpCircle, CheckCircle, Clock, User, Bell, ChevronRight, AlertTriangle, Shield } from 'lucide-react';

interface EscalationStep {
  level: number;
  role: string;
  person: string;
  notifiedAt: string | null;
  acknowledged: boolean;
  action: string;
}

interface EscalationRecord {
  incidentId: string;
  triggered: boolean;
  triggeredAt: string | null;
  triggeredBy: string | null;
  policy: string;
  steps: EscalationStep[];
  slaBreached: boolean;
  nextEscalationIn: string | null;
}

const ESCALATION_DATA: Record<string, EscalationRecord> = {
  'INC-2024-001': {
    incidentId: 'INC-2024-001',
    triggered: true,
    triggeredAt: '2024-07-15 09:35',
    triggeredBy: 'Chidi Okonkwo',
    policy: 'CBN TPRMF §4.2 — Critical Vendor Incident',
    slaBreached: true,
    nextEscalationIn: null,
    steps: [
      { level: 1, role: 'SOC Lead', person: 'Chidi Okonkwo', notifiedAt: '2024-07-15 09:22', acknowledged: true, action: 'Initial triage and severity classification' },
      { level: 2, role: 'CISO', person: 'Dr. Emeka Nwosu', notifiedAt: '2024-07-15 09:35', acknowledged: true, action: 'Authorized vendor isolation and remediation tasks' },
      { level: 3, role: 'CEO / Board', person: 'Pending', notifiedAt: null, acknowledged: false, action: 'Regulatory notification approval (CBN)' },
    ],
  },
  'INC-2024-002': {
    incidentId: 'INC-2024-002',
    triggered: false,
    triggeredAt: null,
    triggeredBy: null,
    policy: 'Standard SLA Incident — No Escalation Required',
    slaBreached: false,
    nextEscalationIn: null,
    steps: [
      { level: 1, role: 'SOC Analyst', person: 'Amaka Eze', notifiedAt: '2024-07-14 16:15', acknowledged: true, action: 'Triaged and assigned remediation task' },
    ],
  },
  'INC-2024-003': {
    incidentId: 'INC-2024-003',
    triggered: false,
    triggeredAt: null,
    triggeredBy: null,
    policy: 'Phishing Incident Protocol — Escalate if credentials confirmed compromised',
    slaBreached: false,
    nextEscalationIn: '4h if no vendor acknowledgement',
    steps: [
      { level: 1, role: 'SOC Analyst', person: 'SOC Analyst', notifiedAt: '2024-07-16 09:00', acknowledged: true, action: 'Triaged and initiated phishing takedown' },
      { level: 2, role: 'SOC Lead', person: 'Chidi Okonkwo', notifiedAt: null, acknowledged: false, action: 'Pending — escalate if credentials confirmed stolen' },
    ],
  },
  'INC-2024-004': {
    incidentId: 'INC-2024-004',
    triggered: true,
    triggeredAt: '2024-07-13 12:00',
    triggeredBy: 'Tunde Adeyemi',
    policy: 'NDPR Data Residency Violation Protocol',
    slaBreached: false,
    nextEscalationIn: '48h if migration not complete',
    steps: [
      { level: 1, role: 'Compliance Analyst', person: 'Tunde Adeyemi', notifiedAt: '2024-07-13 11:30', acknowledged: true, action: 'Identified violation and assigned migration task' },
      { level: 2, role: 'DPO', person: 'Fatima Bello', notifiedAt: '2024-07-13 12:00', acknowledged: true, action: 'Assessing NDPR notification obligation' },
      { level: 3, role: 'CISO', person: 'Dr. Emeka Nwosu', notifiedAt: null, acknowledged: false, action: 'Pending — required if NITDA notification needed' },
    ],
  },
  'INC-2024-005': {
    incidentId: 'INC-2024-005',
    triggered: true,
    triggeredAt: '2024-07-10 07:20',
    triggeredBy: 'Ngozi Obi',
    policy: 'Critical CVE Supply Chain Protocol — Immediate Escalation',
    slaBreached: false,
    nextEscalationIn: null,
    steps: [
      { level: 1, role: 'Security Engineer', person: 'Ngozi Obi', notifiedAt: '2024-07-10 07:00', acknowledged: true, action: 'Detected CVE-2024-3094 in vendor SBOM' },
      { level: 2, role: 'CISO', person: 'Dr. Emeka Nwosu', notifiedAt: '2024-07-10 07:20', acknowledged: true, action: 'Authorized emergency patch and vendor isolation' },
      { level: 3, role: 'Vendor CISO', person: 'TechBridge CISO', notifiedAt: '2024-07-10 07:25', acknowledged: true, action: 'Coordinated emergency patch deployment' },
      { level: 4, role: 'CBN Liaison', person: 'Compliance Team', notifiedAt: '2024-07-10 09:00', acknowledged: true, action: 'Regulatory notification submitted per TPRMF' },
    ],
  },
};

export default function EscalationWorkflowPanel({ selectedId }: { selectedId: string | null }) {
  const [showAddEscalation, setShowAddEscalation] = useState(false);
  const data = ESCALATION_DATA[selectedId ?? 'INC-2024-001'] ?? ESCALATION_DATA['INC-2024-001'];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpCircle size={14} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Escalation Workflow</h3>
        </div>
        {data.triggered && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-critical/10 border border-status-critical/30 text-2xs font-semibold text-status-critical">
            <AlertTriangle size={10} />
            ESCALATED
          </span>
        )}
      </div>

      {/* Policy */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
        <Shield size={13} className="text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Active Policy</p>
          <p className="text-xs text-foreground mt-0.5">{data.policy}</p>
          {data.triggeredAt && (
            <p className="text-2xs text-muted-foreground mt-1">
              Triggered {data.triggeredAt} by {data.triggeredBy}
            </p>
          )}
        </div>
      </div>

      {/* SLA breach warning */}
      {data.slaBreached && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-status-critical/10 border border-status-critical/30">
          <AlertTriangle size={13} className="text-status-critical flex-shrink-0" />
          <p className="text-xs text-status-critical font-medium">Regulatory notification SLA breached — CBN 24h window exceeded</p>
        </div>
      )}

      {/* Next escalation warning */}
      {data.nextEscalationIn && !data.slaBreached && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-status-medium/10 border border-status-medium/30">
          <Clock size={13} className="text-status-medium flex-shrink-0" />
          <p className="text-xs text-status-medium font-medium">Auto-escalate in: {data.nextEscalationIn}</p>
        </div>
      )}

      {/* Escalation chain */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Escalation Chain</p>
        <div className="space-y-2">
          {data.steps.map((step, idx) => {
            const isLast = idx === data.steps.length - 1;
            return (
              <div key={step.level} className="flex gap-3">
                {/* Level indicator + connector */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-2xs font-bold ${
                    step.acknowledged
                      ? 'border-status-low bg-status-low/10 text-status-low'
                      : step.notifiedAt
                      ? 'border-status-medium bg-status-medium/10 text-status-medium' :'border-border bg-muted text-muted-foreground'
                  }`}>
                    {step.acknowledged ? <CheckCircle size={13} /> : step.level}
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-4" />}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-3 ${isLast ? '' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{step.role}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User size={10} className="text-muted-foreground" />
                        <span className="text-2xs text-muted-foreground">{step.person}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {step.notifiedAt && (
                        <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                          <Bell size={10} />
                          {step.notifiedAt.split(' ')[1]}
                        </span>
                      )}
                      {step.acknowledged ? (
                        <span className="text-2xs font-semibold text-status-low flex items-center gap-0.5">
                          <CheckCircle size={10} /> ACK
                        </span>
                      ) : step.notifiedAt ? (
                        <span className="text-2xs font-semibold text-status-medium flex items-center gap-0.5">
                          <Clock size={10} /> PENDING
                        </span>
                      ) : (
                        <span className="text-2xs font-semibold text-muted-foreground">WAITING</span>
                      )}
                    </div>
                  </div>
                  <p className="text-2xs text-muted-foreground mt-1 leading-relaxed">{step.action}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual escalate button */}
      {!data.slaBreached && (
        <button
          onClick={() => setShowAddEscalation(!showAddEscalation)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <ArrowUpCircle size={13} />
          Manually Escalate
          <ChevronRight size={12} />
        </button>
      )}

      {showAddEscalation && (
        <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
          <p className="text-xs font-semibold text-foreground">Escalate to next level</p>
          <select className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground">
            <option>CISO — Dr. Emeka Nwosu</option>
            <option>CEO — Executive Level</option>
            <option>Board — Risk Committee</option>
            <option>CBN Liaison — Regulatory</option>
          </select>
          <textarea
            className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground resize-none"
            rows={2}
            placeholder="Escalation reason..."
          />
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-1.5 rounded-md bg-status-critical text-white text-xs font-semibold hover:bg-status-critical/90 transition-colors">
              Escalate Now
            </button>
            <button
              onClick={() => setShowAddEscalation(false)}
              className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
