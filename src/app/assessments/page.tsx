'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AssessmentInitiateModal, { InitiateFormData } from './components/AssessmentInitiateModal';
import QuestionnaireTracker from './components/QuestionnaireTracker';
import ControlFindingsPanel from './components/ControlFindingsPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleFilter, filterByAssignee } from '@/lib/rbac/useRoleFilter';
import { PermissionGate } from '@/components/rbac/PermissionGate';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Calendar,
  User,
  Building2,
  ShieldAlert,
  ShieldOff,
} from 'lucide-react';

interface Assessment {
  id: string;
  vendorId: string;
  vendorName: string;
  type: string;
  frameworks: string[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'PENDING' | 'CANCELLED';
  questionnairePct: number;
  findingsOpen: number;
  findingsCritical: number;
  initiated: string;
  dueDate: string;
  assignee: string;
  riskTier: string;
}

const MOCK_ASSESSMENTS: Assessment[] = [
  { id: 'ASM-2026-007', vendorId: 'vendor-001', vendorName: 'Interswitch Group', type: 'Full Risk Assessment', frameworks: ['ISO 27001', 'NDPR', 'PCI-DSS'], status: 'IN_PROGRESS', questionnairePct: 72, findingsOpen: 3, findingsCritical: 1, initiated: '2026-07-10', dueDate: '2026-07-28', assignee: 'Olumide Fashola', riskTier: 'CRITICAL' },
  { id: 'ASM-2026-006', vendorId: 'vendor-002', vendorName: 'Flutterwave Inc.', type: 'Annual Review', frameworks: ['PCI-DSS', 'SOC 2 Type II'], status: 'OVERDUE', questionnairePct: 45, findingsOpen: 2, findingsCritical: 0, initiated: '2026-06-01', dueDate: '2026-06-30', assignee: 'Ngozi Adeyemi', riskTier: 'HIGH' },
  { id: 'ASM-2026-005', vendorId: 'vendor-004', vendorName: 'MTN Nigeria', type: 'Quarterly Assessment', frameworks: ['ISO 27001', 'CBN TPRMF'], status: 'COMPLETED', questionnairePct: 100, findingsOpen: 1, findingsCritical: 0, initiated: '2026-05-15', dueDate: '2026-06-15', assignee: 'Fatima Aliyu', riskTier: 'HIGH' },
  { id: 'ASM-2026-004', vendorId: 'vendor-005', vendorName: 'Huawei Technologies', type: 'Control Spot-Check', frameworks: ['NIST CSF', 'ISO 27001'], status: 'IN_PROGRESS', questionnairePct: 30, findingsOpen: 1, findingsCritical: 1, initiated: '2026-07-08', dueDate: '2026-07-31', assignee: 'Chidi Okonkwo', riskTier: 'CRITICAL' },
  { id: 'ASM-2026-003', vendorId: 'vendor-003', vendorName: 'Paystack (Stripe)', type: 'Questionnaire Only', frameworks: ['PCI-DSS'], status: 'COMPLETED', questionnairePct: 100, findingsOpen: 1, findingsCritical: 0, initiated: '2026-05-01', dueDate: '2026-05-20', assignee: 'Olumide Fashola', riskTier: 'MEDIUM' },
  { id: 'ASM-2026-002', vendorId: 'vendor-007', vendorName: 'Oracle Financial', type: 'Annual Review', frameworks: ['ISO 27001', 'SOC 2 Type II'], status: 'COMPLETED', questionnairePct: 100, findingsOpen: 0, findingsCritical: 0, initiated: '2026-04-01', dueDate: '2026-04-30', assignee: 'Ngozi Adeyemi', riskTier: 'MEDIUM' },
  { id: 'ASM-2026-001', vendorId: 'vendor-006', vendorName: 'Microsoft Nigeria', type: 'Onboarding Assessment', frameworks: ['ISO 27001', 'NDPR', 'SOC 2 Type II'], status: 'PENDING', questionnairePct: 0, findingsOpen: 0, findingsCritical: 0, initiated: '2026-07-15', dueDate: '2026-08-15', assignee: 'Fatima Aliyu', riskTier: 'LOW' },
];

const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  IN_PROGRESS: { label: 'In Progress', cls: 'text-status-info bg-status-info/10 border-status-info/30', icon: <Clock size={12} /> },
  COMPLETED: { label: 'Completed', cls: 'text-status-low bg-status-low/10 border-status-low/30', icon: <CheckCircle2 size={12} /> },
  OVERDUE: { label: 'Overdue', cls: 'text-status-critical bg-status-critical/10 border-status-critical/30', icon: <AlertTriangle size={12} /> },
  PENDING: { label: 'Pending', cls: 'text-muted-foreground bg-muted border-border', icon: <Clock size={12} /> },
  CANCELLED: { label: 'Cancelled', cls: 'text-muted-foreground bg-muted border-border', icon: <XCircle size={12} /> },
};

const tierBadge: Record<string, string> = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
};

type ActiveTab = 'timeline' | 'questionnaire' | 'findings';

export default function AssessmentsPage() {
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>(MOCK_ASSESSMENTS);

  const { profile } = useAuth();
  const roleFilter = useRoleFilter();

  // Scope assessments to assigned ones for Auditor/Vendor Manager personas
  const scopedAssessments = filterByAssignee(
    assessments,
    roleFilter.assessmentScope,
    profile?.full_name
  );

  const handleInitiate = (data: InitiateFormData) => {
    const newId = `ASM-2026-${String(assessments.length + 1).padStart(3, '0')}`;
    const newAssessment: Assessment = {
      id: newId,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      type: data.assessmentType,
      frameworks: data.frameworks,
      status: 'PENDING',
      questionnairePct: 0,
      findingsOpen: 0,
      findingsCritical: 0,
      initiated: new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      assignee: data.assignee,
      riskTier: 'MEDIUM',
    };
    setAssessments((prev) => [newAssessment, ...prev]);
    setShowInitiateModal(false);
  };

  const inProgress = scopedAssessments.filter((a) => a.status === 'IN_PROGRESS').length;
  const overdue = scopedAssessments.filter((a) => a.status === 'OVERDUE').length;
  const completed = scopedAssessments.filter((a) => a.status === 'COMPLETED').length;
  const criticalFindings = scopedAssessments.reduce((a, c) => a + c.findingsCritical, 0);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'timeline', label: 'Assessment Timeline', icon: <Calendar size={14} /> },
    { id: 'questionnaire', label: 'Questionnaire Tracker', icon: <ClipboardList size={14} /> },
    { id: 'findings', label: 'Control Findings', icon: <ShieldAlert size={14} /> },
  ];

  return (
    <AppLayout>
      <div className="space-y-5 fade-in">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Vendor Risk Assessments</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {scopedAssessments.length} assessments ·{' '}
              <span className="text-status-info font-mono-data">{inProgress} IN PROGRESS</span> ·{' '}
              <span className="text-status-critical font-mono-data">{overdue} OVERDUE</span> ·{' '}
              <span className="text-status-low font-mono-data">{completed} COMPLETED</span>
              {roleFilter.assessmentScope === 'assigned' && (
                <span className="ml-2 text-2xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                  Scoped to your assignments
                </span>
              )}
            </p>
          </div>
          <PermissionGate resource="assessments" action="create" silent>
            <button
              onClick={() => setShowInitiateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95"
            >
              <Plus size={14} />
              Initiate Assessment
            </button>
          </PermissionGate>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'In Progress', value: inProgress, sub: 'active assessments', cls: 'text-status-info', borderCls: 'border-status-info/30' },
            { label: 'Overdue', value: overdue, sub: 'past due date', cls: 'text-status-critical', borderCls: 'border-status-critical/30' },
            { label: 'Completed', value: completed, sub: 'this cycle', cls: 'text-status-low', borderCls: 'border-status-low/30' },
            { label: 'Critical Findings', value: criticalFindings, sub: 'open critical controls', cls: 'text-status-critical', borderCls: 'border-status-critical/30' },
          ].map((kpi) => (
            <div key={kpi.label} className={`bg-card border ${kpi.borderCls} rounded-xl p-4`}>
              <p className={`text-3xl font-bold font-mono-data ${kpi.cls}`}>{kpi.value}</p>
              <p className="text-sm font-medium text-foreground mt-1">{kpi.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'timeline' && (
          <div className="space-y-2">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span className="col-span-1">ID</span>
              <span className="col-span-2">Vendor</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-1">Tier</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-1">Q. Progress</span>
              <span className="col-span-1">Findings</span>
              <span className="col-span-1">Initiated</span>
              <span className="col-span-1">Due</span>
              <span className="col-span-1">Assignee</span>
            </div>

            {scopedAssessments.map((a) => {
              const sc = statusConfig[a.status];
              return (
                <div
                  key={a.id}
                  className="grid grid-cols-12 gap-3 px-4 py-3 bg-card border border-border rounded-lg items-center hover:border-primary/40 hover:bg-muted/30 transition-all duration-150 cursor-pointer group"
                  onClick={() => {
                    setSelectedAssessment(a);
                    setActiveTab('questionnaire');
                  }}
                >
                  <span className="col-span-1 text-xs font-mono-data text-primary">{a.id}</span>
                  <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                    <Building2 size={13} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground truncate">{a.vendorName}</span>
                  </div>
                  <span className="col-span-2 text-xs text-muted-foreground truncate">{a.type}</span>
                  <span className={`col-span-1 text-2xs font-semibold px-1.5 py-0.5 rounded-full w-fit ${tierBadge[a.riskTier] ?? 'badge-low'}`}>{a.riskTier}</span>
                  <span className={`col-span-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium border w-fit ${sc.cls}`}>
                    {sc.icon}{sc.label}
                  </span>
                  <div className="col-span-1">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${a.questionnairePct === 100 ? 'bg-status-low' : 'bg-primary'}`}
                          style={{ width: `${a.questionnairePct}%` }}
                        />
                      </div>
                      <span className="text-2xs font-mono-data text-muted-foreground w-7 text-right">{a.questionnairePct}%</span>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center gap-1.5">
                    <span className="text-sm font-mono-data text-foreground">{a.findingsOpen}</span>
                    {a.findingsCritical > 0 && (
                      <span className="text-2xs font-mono-data px-1 py-0.5 rounded bg-status-critical/10 text-status-critical border border-status-critical/30">
                        {a.findingsCritical}C
                      </span>
                    )}
                  </div>
                  <span className="col-span-1 text-xs font-mono-data text-muted-foreground">{a.initiated}</span>
                  <span className={`col-span-1 text-xs font-mono-data ${a.status === 'OVERDUE' ? 'text-status-critical' : 'text-muted-foreground'}`}>{a.dueDate}</span>
                  <div className="col-span-1 flex items-center gap-1 min-w-0">
                    <User size={11} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{a.assignee.split(' ')[0]}</span>
                    <ChevronRight size={12} className="text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </div>
              );
            })}

            {scopedAssessments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ShieldOff size={36} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No assessments in your scope</p>
                <p className="text-xs text-muted-foreground">Assessments assigned to you will appear here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'questionnaire' && (
          <div>
            {/* Vendor selector */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-xs text-muted-foreground">Viewing questionnaire for:</span>
              <div className="flex gap-2 flex-wrap">
                {scopedAssessments.filter((a) => a.status !== 'CANCELLED').map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAssessment(a)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150 ${
                      selectedAssessment?.id === a.id
                        ? 'bg-primary/20 border-primary text-primary' :'bg-muted border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {a.id} · {a.vendorName.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <QuestionnaireTracker
              assessmentId={selectedAssessment?.id ?? (scopedAssessments[0]?.id ?? assessments[0].id)}
              vendorName={selectedAssessment?.vendorName ?? assessments[0].vendorName}
            />
          </div>
        )}

        {activeTab === 'findings' && (
          <ControlFindingsPanel />
        )}
      </div>

      {showInitiateModal && (
        <AssessmentInitiateModal
          onClose={() => setShowInitiateModal(false)}
          onSubmit={handleInitiate}
        />
      )}
    </AppLayout>
  );
}
