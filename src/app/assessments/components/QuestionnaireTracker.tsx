'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, XCircle, MessageSquare } from 'lucide-react';

interface QuestionnaireSection {
  section: string;
  total: number;
  answered: number;
  questions: QuestionItem[];
}

interface QuestionItem {
  id: string;
  question: string;
  response: string | null;
  status: 'ANSWERED' | 'PENDING' | 'OVERDUE' | 'NOT_APPLICABLE';
  compliant: boolean | null;
  evidence: string | null;
  dueDate: string;
}

interface QuestionnaireTrackerProps {
  assessmentId: string;
  vendorName: string;
}

const MOCK_SECTIONS: QuestionnaireSection[] = [
  {
    section: 'Data Governance',
    total: 6,
    answered: 5,
    questions: [
      { id: 'dg-1', question: 'Do you maintain a data inventory of all PII processed?', response: 'Yes', status: 'ANSWERED', compliant: true, evidence: 'Data Inventory v2.3 (2026-05)', dueDate: '2026-07-20' },
      { id: 'dg-2', question: 'Is data retention policy documented and enforced?', response: 'Partial', status: 'ANSWERED', compliant: false, evidence: 'Policy exists but enforcement gaps noted', dueDate: '2026-07-20' },
      { id: 'dg-3', question: 'Are data processing agreements in place with all sub-processors?', response: 'Yes', status: 'ANSWERED', compliant: true, evidence: 'DPA register updated Q2 2026', dueDate: '2026-07-20' },
      { id: 'dg-4', question: 'Is a Data Protection Officer (DPO) appointed?', response: 'Yes', status: 'ANSWERED', compliant: true, evidence: 'DPO: Chidi Okonkwo, appointed 2025-03', dueDate: '2026-07-20' },
      { id: 'dg-5', question: 'Are cross-border data transfers documented and lawful?', response: 'Yes', status: 'ANSWERED', compliant: true, evidence: 'Transfer impact assessments on file', dueDate: '2026-07-20' },
      { id: 'dg-6', question: 'Is data classification policy implemented across all systems?', response: null, status: 'OVERDUE', compliant: null, evidence: null, dueDate: '2026-07-15' },
    ],
  },
  {
    section: 'Access Control',
    total: 5,
    answered: 3,
    questions: [
      { id: 'ac-1', question: 'Is MFA enforced for all privileged accounts?', response: 'No', status: 'ANSWERED', compliant: false, evidence: 'MFA only on external-facing systems', dueDate: '2026-07-22' },
      { id: 'ac-2', question: 'Are access reviews conducted quarterly?', response: 'Yes', status: 'ANSWERED', compliant: true, evidence: 'Q1 2026 Access Review Report', dueDate: '2026-07-22' },
      { id: 'ac-3', question: 'Is privileged access management (PAM) solution deployed?', response: 'Partial', status: 'ANSWERED', compliant: false, evidence: 'CyberArk deployed for 60% of systems', dueDate: '2026-07-22' },
      { id: 'ac-4', question: 'Are service accounts inventoried and reviewed annually?', response: null, status: 'PENDING', compliant: null, evidence: null, dueDate: '2026-07-28' },
      { id: 'ac-5', question: 'Is role-based access control (RBAC) enforced?', response: null, status: 'PENDING', compliant: null, evidence: null, dueDate: '2026-07-28' },
    ],
  },
  {
    section: 'Incident Response',
    total: 4,
    answered: 4,
    questions: [
      { id: 'ir-1', question: 'Is an incident response plan documented?', response: 'Yes', status: 'ANSWERED', compliant: true, evidence: 'IRP v1.8 (2026-01)', dueDate: '2026-07-18' },
      { id: 'ir-2', question: 'Were any security incidents reported in the last 12 months?', response: 'Yes — 2 incidents', status: 'ANSWERED', compliant: false, evidence: 'Incident reports IR-2025-11, IR-2026-02', dueDate: '2026-07-18' },
      { id: 'ir-3', question: 'Is the IR plan tested at least annually?', response: 'Yes', status: 'ANSWERED', compliant: true, evidence: 'Tabletop exercise conducted 2026-04', dueDate: '2026-07-18' },
      { id: 'ir-4', question: 'Are breach notification procedures documented per NDPR?', response: 'Yes', status: 'ANSWERED', compliant: true, evidence: 'NDPR notification SOP v2.0', dueDate: '2026-07-18' },
    ],
  },
  {
    section: 'Vulnerability Management',
    total: 4,
    answered: 2,
    questions: [
      { id: 'vm-1', question: 'Is a vulnerability scanning programme in place?', response: 'Yes', status: 'ANSWERED', compliant: true, evidence: 'Qualys scan reports (monthly)', dueDate: '2026-07-25' },
      { id: 'vm-2', question: 'Are critical CVEs patched within 72 hours?', response: 'Partial', status: 'ANSWERED', compliant: false, evidence: 'SLA met for 78% of critical CVEs in H1 2026', dueDate: '2026-07-25' },
      { id: 'vm-3', question: 'Is penetration testing conducted annually?', response: null, status: 'PENDING', compliant: null, evidence: null, dueDate: '2026-07-30' },
      { id: 'vm-4', question: 'Are third-party components tracked in a software bill of materials (SBOM)?', response: null, status: 'PENDING', compliant: null, evidence: null, dueDate: '2026-07-30' },
    ],
  },
];

const statusConfig: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  ANSWERED: { label: 'Answered', icon: <CheckCircle2 size={13} />, cls: 'text-status-low bg-status-low/10 border-status-low/30' },
  PENDING: { label: 'Pending', icon: <Clock size={13} />, cls: 'text-status-info bg-status-info/10 border-status-info/30' },
  OVERDUE: { label: 'Overdue', icon: <AlertCircle size={13} />, cls: 'text-status-critical bg-status-critical/10 border-status-critical/30' },
  NOT_APPLICABLE: { label: 'N/A', icon: <XCircle size={13} />, cls: 'text-muted-foreground bg-muted border-border' },
};

export default function QuestionnaireTracker({ assessmentId, vendorName }: QuestionnaireTrackerProps) {
  const [expanded, setExpanded] = useState<string[]>(['Data Governance']);

  const toggleSection = (section: string) => {
    setExpanded((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const totalQuestions = MOCK_SECTIONS.reduce((a, s) => a + s.total, 0);
  const totalAnswered = MOCK_SECTIONS.reduce((a, s) => a + s.answered, 0);
  const overallPct = Math.round((totalAnswered / totalQuestions) * 100);

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-foreground">Questionnaire Completion</p>
            <p className="text-xs text-muted-foreground mt-0.5">{vendorName} · Assessment {assessmentId}</p>
          </div>
          <span className="text-2xl font-bold font-mono-data text-primary">{overallPct}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2.5">
          {MOCK_SECTIONS.map((s) => {
            const pct = Math.round((s.answered / s.total) * 100);
            return (
              <div key={s.section} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary/60" />
                <span className="text-xs text-muted-foreground">{s.section.split(' ')[0]}: <span className="text-foreground font-mono-data">{pct}%</span></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      {MOCK_SECTIONS.map((sec) => {
        const isOpen = expanded.includes(sec.section);
        const pct = Math.round((sec.answered / sec.total) * 100);
        const overdueCount = sec.questions.filter((q) => q.status === 'OVERDUE').length;
        return (
          <div key={sec.section} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(sec.section)}
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown size={15} className="text-muted-foreground" /> : <ChevronRight size={15} className="text-muted-foreground" />}
                <span className="text-sm font-medium text-foreground">{sec.section}</span>
                {overdueCount > 0 && (
                  <span className="text-2xs font-mono-data px-1.5 py-0.5 rounded-full bg-status-critical/10 text-status-critical border border-status-critical/30">
                    {overdueCount} overdue
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono-data text-muted-foreground">{sec.answered}/{sec.total}</span>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="divide-y divide-border">
                {sec.questions.map((q) => {
                  const sc = statusConfig[q.status];
                  return (
                    <div key={q.id} className="px-4 py-3 bg-background/40 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">{q.question}</p>
                          {q.response && (
                            <div className="flex items-start gap-2 mt-1.5">
                              <MessageSquare size={12} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                <span className={`font-medium ${q.compliant ? 'text-status-low' : 'text-status-high'}`}>{q.response}</span>
                                {q.evidence && <span className="ml-1.5 text-muted-foreground">· {q.evidence}</span>}
                              </p>
                            </div>
                          )}
                          {!q.response && (
                            <p className="text-xs text-muted-foreground mt-1">Due: <span className="font-mono-data">{q.dueDate}</span></p>
                          )}
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium border flex-shrink-0 ${sc.cls}`}>
                          {sc.icon}
                          {sc.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
