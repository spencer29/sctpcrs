'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ClipboardList,
  Paperclip,
  CheckSquare,
  ChevronDown,
  Upload,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Shield,
  Activity,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  legalName: string;
  riskTier: string;
  vrs: number;
  category: string;
  lastAssessed: string;
  compliancePct: number;
  dataAccess: string[];
  lifecycleState: string;
}

interface VendorRiskWorkflowModalProps {
  vendor: Vendor | null;
  onClose: () => void;
}

type WorkflowTab = 'assessment' | 'details' | 'evidence' | 'compliance';

const RISK_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const FRAMEWORKS = ['ISO 27001', 'NDPR', 'PCI-DSS', 'SOC 2 Type II', 'CBN TPRMF', 'NIST CSF'];
const ASSESSMENT_TYPES = ['Full Risk Assessment', 'Questionnaire Only', 'Control Spot-Check', 'Annual Review', 'Incident-Triggered'];
const CONTROL_DOMAINS = [
  { id: 'access', label: 'Access Control', status: 'PASS' as const },
  { id: 'encrypt', label: 'Data Encryption', status: 'FAIL' as const },
  { id: 'incident', label: 'Incident Response', status: 'PARTIAL' as const },
  { id: 'vuln', label: 'Vulnerability Mgmt', status: 'PASS' as const },
  { id: 'bcp', label: 'Business Continuity', status: 'PARTIAL' as const },
  { id: 'audit', label: 'Audit Logging', status: 'PASS' as const },
  { id: 'patch', label: 'Patch Management', status: 'FAIL' as const },
  { id: 'third', label: 'Third-Party Controls', status: 'PENDING' as const },
];

const COMPLIANCE_CHECKS = [
  { id: 'cc-001', framework: 'ISO 27001', control: 'A.12.6.1 — Technical Vulnerability Management', status: 'NON_COMPLIANT' as const, severity: 'HIGH' },
  { id: 'cc-002', framework: 'PCI-DSS', control: 'Req 6.3 — Security Vulnerabilities', status: 'NON_COMPLIANT' as const, severity: 'CRITICAL' },
  { id: 'cc-003', framework: 'NDPR', control: 'Art. 2.6 — Data Protection Measures', status: 'COMPLIANT' as const, severity: 'MEDIUM' },
  { id: 'cc-004', framework: 'CBN TPRMF', control: 'Sec 4.2 — Vendor Risk Assessment', status: 'PARTIAL' as const, severity: 'HIGH' },
  { id: 'cc-005', framework: 'NIST CSF', control: 'ID.SC-2 — Supplier Risk Assessment', status: 'COMPLIANT' as const, severity: 'LOW' },
  { id: 'cc-006', framework: 'SOC 2 Type II', control: 'CC9.2 — Vendor Management', status: 'PENDING' as const, severity: 'MEDIUM' },
];

const controlStatusConfig = {
  PASS: { label: 'Pass', cls: 'text-status-low bg-status-low/10 border-status-low/30', icon: <CheckCircle2 size={11} /> },
  FAIL: { label: 'Fail', cls: 'text-status-critical bg-status-critical/10 border-status-critical/30', icon: <XCircle size={11} /> },
  PARTIAL: { label: 'Partial', cls: 'text-status-medium bg-status-medium/10 border-status-medium/30', icon: <AlertTriangle size={11} /> },
  PENDING: { label: 'Pending', cls: 'text-muted-foreground bg-muted border-border', icon: <Clock size={11} /> },
};

const complianceStatusConfig = {
  COMPLIANT: { label: 'Compliant', cls: 'text-status-low bg-status-low/10 border-status-low/30', icon: <CheckCircle2 size={11} /> },
  NON_COMPLIANT: { label: 'Non-Compliant', cls: 'text-status-critical bg-status-critical/10 border-status-critical/30', icon: <XCircle size={11} /> },
  PARTIAL: { label: 'Partial', cls: 'text-status-medium bg-status-medium/10 border-status-medium/30', icon: <AlertTriangle size={11} /> },
  PENDING: { label: 'Pending', cls: 'text-muted-foreground bg-muted border-border', icon: <Clock size={11} /> },
};

const severityBadge: Record<string, string> = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
};

const tierBadge: Record<string, string> = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
};

interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  category: string;
}

const INITIAL_EVIDENCE: EvidenceFile[] = [
  { id: 'ev-001', name: 'ISO27001_Certificate_2026.pdf', type: 'PDF', size: '1.2 MB', uploadedAt: '2026-07-10', category: 'Certification' },
  { id: 'ev-002', name: 'PenTest_Report_Q2_2026.pdf', type: 'PDF', size: '3.8 MB', uploadedAt: '2026-07-12', category: 'Security Report' },
  { id: 'ev-003', name: 'DataProcessingAgreement.docx', type: 'DOCX', size: '0.4 MB', uploadedAt: '2026-06-28', category: 'Legal' },
];

const EVIDENCE_CATEGORIES = ['Certification', 'Security Report', 'Legal', 'Audit Report', 'Questionnaire Response', 'Other'];

export default function VendorRiskWorkflowModal({ vendor, onClose }: VendorRiskWorkflowModalProps) {
  const [activeTab, setActiveTab] = useState<WorkflowTab>('assessment');
  const [assessmentForm, setAssessmentForm] = useState({
    riskLevel: vendor?.riskTier ?? 'HIGH',
    assessmentType: 'Full Risk Assessment',
    frameworks: ['ISO 27001', 'PCI-DSS'],
    assignee: 'Olumide Fashola',
    dueDate: '2026-08-15',
    priority: 'HIGH',
    notes: '',
  });
  const [detailsForm, setDetailsForm] = useState({
    inherentRisk: vendor?.riskTier ?? 'HIGH',
    residualRisk: 'MEDIUM',
    riskAppetite: 'LOW',
    controlEffectiveness: '65',
    riskScore: String(vendor?.vrs ?? 70),
    mitigationPlan: '',
    reviewCycle: 'Quarterly',
    nextReviewDate: '2026-10-17',
    controlDomains: CONTROL_DOMAINS,
  });
  const [evidence, setEvidence] = useState<EvidenceFile[]>(INITIAL_EVIDENCE);
  const [newEvidenceCategory, setNewEvidenceCategory] = useState('Certification');
  const [complianceChecks, setComplianceChecks] = useState(COMPLIANCE_CHECKS);
  const [runningCheck, setRunningCheck] = useState(false);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['ISO 27001', 'PCI-DSS']);

  if (!vendor) return null;

  const tabs: { id: WorkflowTab; label: string; icon: React.ReactNode }[] = [
    { id: 'assessment', label: 'Risk Assessment', icon: <ShieldAlert size={13} /> },
    { id: 'details', label: 'Assessment Details', icon: <BarChart3 size={13} /> },
    { id: 'evidence', label: 'Evidence', icon: <Paperclip size={13} /> },
    { id: 'compliance', label: 'Compliance Checks', icon: <CheckSquare size={13} /> },
  ];

  const toggleFramework = (fw: string) => {
    setAssessmentForm((prev) => ({
      ...prev,
      frameworks: prev.frameworks.includes(fw)
        ? prev.frameworks.filter((f) => f !== fw)
        : [...prev.frameworks, fw],
    }));
  };

  const toggleSelectedFramework = (fw: string) => {
    setSelectedFrameworks((prev) =>
      prev.includes(fw) ? prev.filter((f) => f !== fw) : [...prev, fw]
    );
  };

  const handleSaveAssessment = () => {
    toast.success(`Risk assessment initiated for ${vendor.legalName}`);
    onClose();
  };

  const handleSaveDetails = () => {
    toast.success(`Assessment details updated for ${vendor.legalName}`);
  };

  const handleAttachFile = () => {
    const newFile: EvidenceFile = {
      id: `ev-${Date.now()}`,
      name: `Evidence_${vendor.legalName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
      type: 'PDF',
      size: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`,
      uploadedAt: '2026-07-17',
      category: newEvidenceCategory,
    };
    setEvidence((prev) => [newFile, ...prev]);
    toast.success('Evidence file attached successfully');
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
    toast.success('Evidence removed');
  };

  const handleRunComplianceCheck = () => {
    if (selectedFrameworks.length === 0) {
      toast.error('Select at least one framework to run compliance check');
      return;
    }
    setRunningCheck(true);
    setTimeout(() => {
      setComplianceChecks((prev) =>
        prev.map((c) =>
          selectedFrameworks.includes(c.framework)
            ? { ...c, status: Math.random() > 0.5 ? 'COMPLIANT' : Math.random() > 0.5 ? 'NON_COMPLIANT' : 'PARTIAL' }
            : c
        )
      );
      setRunningCheck(false);
      toast.success(`Compliance check completed for ${selectedFrameworks.join(', ')}`);
    }, 1800);
  };

  const handleUpdateControlStatus = (id: string, status: 'PASS' | 'FAIL' | 'PARTIAL' | 'PENDING') => {
    setDetailsForm((prev) => ({
      ...prev,
      controlDomains: prev.controlDomains.map((d) => (d.id === id ? { ...d, status } : d)),
    }));
  };

  const passCount = detailsForm.controlDomains.filter((d) => d.status === 'PASS').length;
  const failCount = detailsForm.controlDomains.filter((d) => d.status === 'FAIL').length;
  const compliantCount = complianceChecks.filter((c) => c.status === 'COMPLIANT').length;
  const nonCompliantCount = complianceChecks.filter((c) => c.status === 'NON_COMPLIANT').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl mx-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-status-high/10 border border-status-high/30 flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-status-high" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">Risk Officer Workflow</h2>
                <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded ${tierBadge[vendor.riskTier] ?? 'badge-medium'}`}>
                  {vendor.riskTier}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {vendor.legalName} · {vendor.category} · VRS <span className="font-mono-data text-foreground">{vendor.vrs}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-border px-6 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all duration-150 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── TAB: Risk Assessment ── */}
          {activeTab === 'assessment' && (
            <div className="space-y-5">
              {/* Vendor snapshot */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'VRS Score', value: String(vendor.vrs), cls: vendor.vrs >= 70 ? 'text-status-critical' : vendor.vrs >= 50 ? 'text-status-high' : 'text-status-medium', icon: <Activity size={13} /> },
                  { label: 'Compliance', value: `${vendor.compliancePct}%`, cls: vendor.compliancePct >= 80 ? 'text-status-low' : vendor.compliancePct >= 60 ? 'text-status-medium' : 'text-status-high', icon: <CheckCircle2 size={13} /> },
                  { label: 'Data Access', value: String(vendor.dataAccess.length), cls: 'text-foreground', icon: <FileText size={13} /> },
                  { label: 'Last Assessed', value: vendor.lastAssessed, cls: 'text-muted-foreground font-mono-data text-xs', icon: <Clock size={13} /> },
                ].map((m) => (
                  <div key={m.label} className="bg-muted/50 border border-border rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      {m.icon}
                      <span className="text-2xs uppercase tracking-wider font-semibold">{m.label}</span>
                    </div>
                    <span className={`text-sm font-semibold font-mono-data ${m.cls}`}>{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Assessment type + risk level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Assessment Type *</label>
                  <div className="relative">
                    <select
                      value={assessmentForm.assessmentType}
                      onChange={(e) => setAssessmentForm((p) => ({ ...p, assessmentType: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {ASSESSMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Risk Level *</label>
                  <div className="relative">
                    <select
                      value={assessmentForm.riskLevel}
                      onChange={(e) => setAssessmentForm((p) => ({ ...p, riskLevel: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Frameworks */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Compliance Frameworks *</label>
                <div className="flex flex-wrap gap-2">
                  {FRAMEWORKS.map((fw) => {
                    const sel = assessmentForm.frameworks.includes(fw);
                    return (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => toggleFramework(fw)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150 ${
                          sel
                            ? 'bg-primary/20 border-primary text-primary' :'bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        {fw}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assignee + Due date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Assigned To *</label>
                  <input
                    type="text"
                    value={assessmentForm.assignee}
                    onChange={(e) => setAssessmentForm((p) => ({ ...p, assignee: e.target.value }))}
                    placeholder="Risk Officer name"
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Due Date *</label>
                  <input
                    type="date"
                    value={assessmentForm.dueDate}
                    onChange={(e) => setAssessmentForm((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Scope / Notes</label>
                <textarea
                  rows={3}
                  value={assessmentForm.notes}
                  onChange={(e) => setAssessmentForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Describe assessment scope, triggers, or special instructions…"
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>
          )}

          {/* ── TAB: Assessment Details ── */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Risk scoring */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Inherent Risk</label>
                  <div className="relative">
                    <select
                      value={detailsForm.inherentRisk}
                      onChange={(e) => setDetailsForm((p) => ({ ...p, inherentRisk: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Residual Risk</label>
                  <div className="relative">
                    <select
                      value={detailsForm.residualRisk}
                      onChange={(e) => setDetailsForm((p) => ({ ...p, residualRisk: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Risk Appetite</label>
                  <div className="relative">
                    <select
                      value={detailsForm.riskAppetite}
                      onChange={(e) => setDetailsForm((p) => ({ ...p, riskAppetite: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Risk Score (0–100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={detailsForm.riskScore}
                    onChange={(e) => setDetailsForm((p) => ({ ...p, riskScore: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Control Effectiveness (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={detailsForm.controlEffectiveness}
                    onChange={(e) => setDetailsForm((p) => ({ ...p, controlEffectiveness: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Control domains */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Control Domain Status</label>
                  <div className="flex items-center gap-3 text-2xs text-muted-foreground">
                    <span className="text-status-low font-mono-data">{passCount} Pass</span>
                    <span className="text-status-critical font-mono-data">{failCount} Fail</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {detailsForm.controlDomains.map((domain) => {
                    const sc = controlStatusConfig[domain.status];
                    return (
                      <div key={domain.id} className="flex items-center justify-between bg-muted/50 border border-border rounded-lg px-3 py-2">
                        <span className="text-xs text-foreground">{domain.label}</span>
                        <div className="relative">
                          <select
                            value={domain.status}
                            onChange={(e) => handleUpdateControlStatus(domain.id, e.target.value as 'PASS' | 'FAIL' | 'PARTIAL' | 'PENDING')}
                            className={`text-2xs font-medium px-2 py-0.5 rounded border appearance-none pr-5 cursor-pointer focus:outline-none ${sc.cls}`}
                          >
                            <option value="PASS">Pass</option>
                            <option value="FAIL">Fail</option>
                            <option value="PARTIAL">Partial</option>
                            <option value="PENDING">Pending</option>
                          </select>
                          <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mitigation plan */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Mitigation Plan</label>
                <textarea
                  rows={3}
                  value={detailsForm.mitigationPlan}
                  onChange={(e) => setDetailsForm((p) => ({ ...p, mitigationPlan: e.target.value }))}
                  placeholder="Describe risk mitigation actions, timelines, and owners…"
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Review cycle + next review */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Review Cycle</label>
                  <div className="relative">
                    <select
                      value={detailsForm.reviewCycle}
                      onChange={(e) => setDetailsForm((p) => ({ ...p, reviewCycle: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Next Review Date</label>
                  <input
                    type="date"
                    value={detailsForm.nextReviewDate}
                    onChange={(e) => setDetailsForm((p) => ({ ...p, nextReviewDate: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Evidence ── */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              {/* Attach new */}
              <div className="border border-dashed border-border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Category</label>
                    <div className="relative">
                      <select
                        value={newEvidenceCategory}
                        onChange={(e) => setNewEvidenceCategory(e.target.value)}
                        className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {EVIDENCE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-5">
                    <button
                      onClick={handleAttachFile}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95"
                    >
                      <Upload size={13} />
                      Attach File
                    </button>
                  </div>
                </div>
                <p className="text-2xs text-muted-foreground mt-2">Supported: PDF, DOCX, XLSX, PNG, JPG · Max 25 MB per file</p>
              </div>

              {/* Evidence list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attached Evidence ({evidence.length})</span>
                </div>
                {evidence.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No evidence attached yet</div>
                )}
                {evidence.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 bg-muted/40 border border-border rounded-lg px-4 py-3 group hover:border-primary/30 transition-all">
                    <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-2xs font-mono-data text-muted-foreground">{file.type}</span>
                        <span className="text-2xs text-muted-foreground">·</span>
                        <span className="text-2xs text-muted-foreground">{file.size}</span>
                        <span className="text-2xs text-muted-foreground">·</span>
                        <span className="text-2xs text-muted-foreground">{file.uploadedAt}</span>
                      </div>
                    </div>
                    <span className="text-2xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                      {file.category}
                    </span>
                    <button
                      onClick={() => handleRemoveEvidence(file.id)}
                      className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-status-critical hover:bg-status-critical/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB: Compliance Checks ── */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Compliant', value: compliantCount, cls: 'text-status-low', borderCls: 'border-status-low/30' },
                  { label: 'Non-Compliant', value: nonCompliantCount, cls: 'text-status-critical', borderCls: 'border-status-critical/30' },
                  { label: 'Partial', value: complianceChecks.filter((c) => c.status === 'PARTIAL').length, cls: 'text-status-medium', borderCls: 'border-status-medium/30' },
                  { label: 'Pending', value: complianceChecks.filter((c) => c.status === 'PENDING').length, cls: 'text-muted-foreground', borderCls: 'border-border' },
                ].map((s) => (
                  <div key={s.label} className={`bg-card border ${s.borderCls} rounded-lg p-3 text-center`}>
                    <p className={`text-2xl font-bold font-mono-data ${s.cls}`}>{s.value}</p>
                    <p className="text-2xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Framework selector for triggering checks */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Trigger Compliance Check For</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {FRAMEWORKS.map((fw) => {
                    const sel = selectedFrameworks.includes(fw);
                    return (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => toggleSelectedFramework(fw)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150 ${
                          sel
                            ? 'bg-primary/20 border-primary text-primary' :'bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        {fw}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleRunComplianceCheck}
                  disabled={runningCheck || selectedFrameworks.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {runningCheck ? (
                    <>
                      <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Running Check…
                    </>
                  ) : (
                    <>
                      <Activity size={13} />
                      Run Compliance Check
                    </>
                  )}
                </button>
              </div>

              {/* Compliance check results */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Control Results</span>
                {complianceChecks.map((check) => {
                  const sc = complianceStatusConfig[check.status];
                  return (
                    <div key={check.id} className="flex items-center gap-3 bg-muted/40 border border-border rounded-lg px-4 py-3 hover:border-primary/30 transition-all">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium border flex-shrink-0 ${sc.cls}`}>
                        {sc.icon}{sc.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground font-medium truncate">{check.control}</p>
                        <p className="text-2xs text-muted-foreground mt-0.5">{check.framework}</p>
                      </div>
                      <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${severityBadge[check.severity] ?? 'badge-low'}`}>
                        {check.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-border flex-shrink-0">
          <div className="text-2xs text-muted-foreground">
            Risk Officer Workflow · {vendor.legalName}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-muted border border-border text-sm font-medium text-foreground hover:bg-secondary transition-all duration-150"
            >
              Cancel
            </button>
            {activeTab === 'assessment' && (
              <button
                onClick={handleSaveAssessment}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95"
              >
                <Plus size={14} />
                Initiate Assessment
              </button>
            )}
            {activeTab === 'details' && (
              <button
                onClick={handleSaveDetails}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95"
              >
                <ClipboardList size={14} />
                Save Details
              </button>
            )}
            {activeTab === 'evidence' && (
              <button
                onClick={() => toast.success('Evidence record saved')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95"
              >
                <Paperclip size={14} />
                Save Evidence
              </button>
            )}
            {activeTab === 'compliance' && (
              <button
                onClick={() => toast.success('Compliance check results saved')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95"
              >
                <CheckSquare size={14} />
                Save Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
