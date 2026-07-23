'use client';

import React, { useState } from 'react';
import { X, ClipboardCheck, ChevronDown, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, Save,  } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'informational';
type Priority = 'immediate' | 'high' | 'medium' | 'low';
type QuestionResponse = 'yes' | 'no' | 'partial' | 'na' | '';

interface QuestionnaireQuestion {
  id: string;
  category: string;
  question: string;
}

interface FindingsFormData {
  vendorName: string;
  assessmentDate: string;
  assessorName: string;
  riskLevel: RiskLevel | '';
  priority: Priority | '';
  dueDate: string;
  executiveSummary: string;
  remediationSteps: string;
  additionalNotes: string;
  responses: Record<string, QuestionResponse>;
}

interface VendorAssessmentFindingsModalProps {
  onClose: () => void;
  onSubmit: (data: FindingsFormData) => void;
  vendorName?: string;
}

// ─── 100+ Questionnaire Questions ────────────────────────────────────────────

const QUESTIONNAIRE: QuestionnaireQuestion[] = [
  // Information Security Governance (1–10)
  { id: 'q001', category: 'Information Security Governance', question: 'Does the vendor have a formally documented Information Security Policy approved by senior management?' },
  { id: 'q002', category: 'Information Security Governance', question: 'Is there a designated Chief Information Security Officer (CISO) or equivalent role?' },
  { id: 'q003', category: 'Information Security Governance', question: 'Are information security roles and responsibilities clearly defined and communicated to all staff?' },
  { id: 'q004', category: 'Information Security Governance', question: 'Is the security policy reviewed and updated at least annually?' },
  { id: 'q005', category: 'Information Security Governance', question: 'Does the vendor maintain a risk register that is reviewed on a regular basis?' },
  { id: 'q006', category: 'Information Security Governance', question: 'Is there a formal risk management framework in place (e.g., ISO 27005, NIST RMF)?' },
  { id: 'q007', category: 'Information Security Governance', question: 'Does the vendor conduct annual security awareness training for all employees?' },
  { id: 'q008', category: 'Information Security Governance', question: 'Are third-party security assessments or audits conducted at least annually?' },
  { id: 'q009', category: 'Information Security Governance', question: 'Does the vendor have a Board-level or executive committee overseeing cybersecurity?' },
  { id: 'q010', category: 'Information Security Governance', question: 'Are security KPIs and metrics reported to senior management on a regular cadence?' },

  // Access Control & Identity Management (11–20)
  { id: 'q011', category: 'Access Control & Identity Management', question: 'Is multi-factor authentication (MFA) enforced for all privileged and remote access?' },
  { id: 'q012', category: 'Access Control & Identity Management', question: 'Does the vendor follow the principle of least privilege for all user accounts?' },
  { id: 'q013', category: 'Access Control & Identity Management', question: 'Are access rights reviewed and recertified at least quarterly?' },
  { id: 'q014', category: 'Access Control & Identity Management', question: 'Is there a formal onboarding and offboarding process that includes timely access revocation?' },
  { id: 'q015', category: 'Access Control & Identity Management', question: 'Are privileged accounts (admin, root, service accounts) inventoried and monitored?' },
  { id: 'q016', category: 'Access Control & Identity Management', question: 'Does the vendor use a Privileged Access Management (PAM) solution?' },
  { id: 'q017', category: 'Access Control & Identity Management', question: 'Are shared or generic accounts prohibited or strictly controlled?' },
  { id: 'q018', category: 'Access Control & Identity Management', question: 'Is Single Sign-On (SSO) implemented for internal applications?' },
  { id: 'q019', category: 'Access Control & Identity Management', question: 'Are password policies enforced (minimum length, complexity, rotation)?' },
  { id: 'q020', category: 'Access Control & Identity Management', question: 'Is remote access restricted to approved VPN or zero-trust network access solutions?' },

  // Data Protection & Privacy (21–30)
  { id: 'q021', category: 'Data Protection & Privacy', question: 'Does the vendor maintain a data classification policy covering all data types?' },
  { id: 'q022', category: 'Data Protection & Privacy', question: 'Is sensitive and personal data encrypted at rest using industry-standard algorithms (AES-256 or equivalent)?' },
  { id: 'q023', category: 'Data Protection & Privacy', question: 'Is data encrypted in transit using TLS 1.2 or higher for all communications?' },
  { id: 'q024', category: 'Data Protection & Privacy', question: 'Does the vendor comply with applicable data protection regulations (NDPR, GDPR, PCI-DSS)?' },
  { id: 'q025', category: 'Data Protection & Privacy', question: 'Is there a formal data retention and disposal policy in place?' },
  { id: 'q026', category: 'Data Protection & Privacy', question: 'Are data processing agreements (DPAs) in place with all sub-processors?' },
  { id: 'q027', category: 'Data Protection & Privacy', question: 'Does the vendor have a process for responding to data subject access requests (DSARs)?' },
  { id: 'q028', category: 'Data Protection & Privacy', question: 'Is personal data pseudonymized or anonymized where technically feasible?' },
  { id: 'q029', category: 'Data Protection & Privacy', question: 'Are data transfers to third countries conducted under appropriate legal mechanisms?' },
  { id: 'q030', category: 'Data Protection & Privacy', question: 'Does the vendor maintain a record of processing activities (ROPA) as required by applicable law?' },

  // Network & Infrastructure Security (31–40)
  { id: 'q031', category: 'Network & Infrastructure Security', question: 'Is the network segmented to isolate sensitive systems and production environments?' },
  { id: 'q032', category: 'Network & Infrastructure Security', question: 'Are firewalls deployed and configured with deny-by-default rules?' },
  { id: 'q033', category: 'Network & Infrastructure Security', question: 'Is an Intrusion Detection/Prevention System (IDS/IPS) deployed and actively monitored?' },
  { id: 'q034', category: 'Network & Infrastructure Security', question: 'Are all systems patched within defined SLAs (critical patches within 72 hours)?' },
  { id: 'q035', category: 'Network & Infrastructure Security', question: 'Is vulnerability scanning conducted at least monthly on all internet-facing assets?' },
  { id: 'q036', category: 'Network & Infrastructure Security', question: 'Are penetration tests conducted at least annually by qualified third parties?' },
  { id: 'q037', category: 'Network & Infrastructure Security', question: 'Is a Web Application Firewall (WAF) deployed for all public-facing web applications?' },
  { id: 'q038', category: 'Network & Infrastructure Security', question: 'Are DDoS mitigation controls in place for critical services?' },
  { id: 'q039', category: 'Network & Infrastructure Security', question: 'Is DNS security (DNSSEC, DNS filtering) implemented?' },
  { id: 'q040', category: 'Network & Infrastructure Security', question: 'Are wireless networks secured with WPA3 or equivalent and isolated from production networks?' },

  // Endpoint & Device Security (41–48)
  { id: 'q041', category: 'Endpoint & Device Security', question: 'Is endpoint detection and response (EDR) software deployed on all managed endpoints?' },
  { id: 'q042', category: 'Endpoint & Device Security', question: 'Are mobile devices enrolled in a Mobile Device Management (MDM) solution?' },
  { id: 'q043', category: 'Endpoint & Device Security', question: 'Is full-disk encryption enforced on all laptops and portable storage devices?' },
  { id: 'q044', category: 'Endpoint & Device Security', question: 'Is there a formal policy governing the use of removable media (USB drives, external HDDs)?' },
  { id: 'q045', category: 'Endpoint & Device Security', question: 'Are software installations restricted to approved applications via allowlisting or MDM policy?' },
  { id: 'q046', category: 'Endpoint & Device Security', question: 'Is automatic screen lock enforced after a defined period of inactivity?' },
  { id: 'q047', category: 'Endpoint & Device Security', question: 'Are BYOD (Bring Your Own Device) policies defined and enforced?' },
  { id: 'q048', category: 'Endpoint & Device Security', question: 'Is there a process for secure decommissioning and wiping of retired devices?' },

  // Application Security (49–58)
  { id: 'q049', category: 'Application Security', question: 'Does the vendor follow a Secure Software Development Lifecycle (SSDLC)?' },
  { id: 'q050', category: 'Application Security', question: 'Is static application security testing (SAST) integrated into the CI/CD pipeline?' },
  { id: 'q051', category: 'Application Security', question: 'Is dynamic application security testing (DAST) performed before production releases?' },
  { id: 'q052', category: 'Application Security', question: 'Are third-party libraries and dependencies scanned for known vulnerabilities (SCA)?' },
  { id: 'q053', category: 'Application Security', question: 'Is there a formal vulnerability disclosure or bug bounty program?' },
  { id: 'q054', category: 'Application Security', question: 'Are API endpoints authenticated, rate-limited, and protected against injection attacks?' },
  { id: 'q055', category: 'Application Security', question: 'Are OWASP Top 10 vulnerabilities addressed in the development process?' },
  { id: 'q056', category: 'Application Security', question: 'Is secrets management (API keys, credentials) handled via a vault or secrets manager?' },
  { id: 'q057', category: 'Application Security', question: 'Are container images scanned for vulnerabilities before deployment?' },
  { id: 'q058', category: 'Application Security', question: 'Is code review (including security-focused review) mandatory before merging to production branches?' },

  // Incident Response & Business Continuity (59–68)
  { id: 'q059', category: 'Incident Response & Business Continuity', question: 'Does the vendor have a documented Incident Response Plan (IRP) that is tested at least annually?' },
  { id: 'q060', category: 'Incident Response & Business Continuity', question: 'Is there a defined process for notifying affected parties (including SC-TPCRS) within 72 hours of a confirmed breach?' },
  { id: 'q061', category: 'Incident Response & Business Continuity', question: 'Does the vendor maintain a 24/7 security operations capability (internal SOC or MSSP)?' },
  { id: 'q062', category: 'Incident Response & Business Continuity', question: 'Are incident severity levels defined with corresponding escalation procedures?' },
  { id: 'q063', category: 'Incident Response & Business Continuity', question: 'Is there a Business Continuity Plan (BCP) covering critical services provided to SC-TPCRS?' },
  { id: 'q064', category: 'Incident Response & Business Continuity', question: 'Is a Disaster Recovery Plan (DRP) in place with defined RTO and RPO targets?' },
  { id: 'q065', category: 'Incident Response & Business Continuity', question: 'Are BCP/DRP tests conducted at least annually with documented results?' },
  { id: 'q066', category: 'Incident Response & Business Continuity', question: 'Are data backups performed regularly and tested for recoverability?' },
  { id: 'q067', category: 'Incident Response & Business Continuity', question: 'Are backup copies stored offsite or in a geographically separate location?' },
  { id: 'q068', category: 'Incident Response & Business Continuity', question: 'Does the vendor have cyber insurance coverage appropriate to the risk profile?' },

  // Third-Party & Supply Chain Risk (69–76)
  { id: 'q069', category: 'Third-Party & Supply Chain Risk', question: 'Does the vendor maintain an inventory of all critical sub-processors and fourth-party suppliers?' },
  { id: 'q070', category: 'Third-Party & Supply Chain Risk', question: 'Are security assessments conducted on critical sub-processors before onboarding?' },
  { id: 'q071', category: 'Third-Party & Supply Chain Risk', question: 'Are contractual security requirements (including right-to-audit clauses) included in all supplier agreements?' },
  { id: 'q072', category: 'Third-Party & Supply Chain Risk', question: 'Is there a process for monitoring the security posture of critical suppliers on an ongoing basis?' },
  { id: 'q073', category: 'Third-Party & Supply Chain Risk', question: 'Does the vendor have a software supply chain security program (e.g., SBOM generation)?' },
  { id: 'q074', category: 'Third-Party & Supply Chain Risk', question: 'Are open-source components tracked and reviewed for license compliance and security vulnerabilities?' },
  { id: 'q075', category: 'Third-Party & Supply Chain Risk', question: 'Is there a process for managing and revoking third-party access upon contract termination?' },
  { id: 'q076', category: 'Third-Party & Supply Chain Risk', question: 'Does the vendor notify SC-TPCRS of material changes to sub-processors that may affect data security?' },

  // Compliance & Regulatory (77–85)
  { id: 'q077', category: 'Compliance & Regulatory', question: 'Does the vendor hold a current ISO 27001 certification or equivalent?' },
  { id: 'q078', category: 'Compliance & Regulatory', question: 'Has the vendor completed a SOC 2 Type II audit within the last 12 months?' },
  { id: 'q079', category: 'Compliance & Regulatory', question: 'Is the vendor compliant with PCI-DSS if handling payment card data?' },
  { id: 'q080', category: 'Compliance & Regulatory', question: 'Does the vendor comply with the CBN Third-Party Risk Management Framework (TPRMF)?' },
  { id: 'q081', category: 'Compliance & Regulatory', question: 'Is the vendor registered with and in good standing with relevant Nigerian regulatory bodies (CBN, NITDA, NCC)?' },
  { id: 'q082', category: 'Compliance & Regulatory', question: 'Are compliance obligations tracked in a compliance management system?' },
  { id: 'q083', category: 'Compliance & Regulatory', question: 'Has the vendor had any regulatory sanctions, fines, or enforcement actions in the past 3 years?' },
  { id: 'q084', category: 'Compliance & Regulatory', question: 'Does the vendor conduct regular internal audits of compliance controls?' },
  { id: 'q085', category: 'Compliance & Regulatory', question: 'Are audit findings tracked to remediation with defined timelines?' },

  // Physical & Environmental Security (86–92)
  { id: 'q086', category: 'Physical & Environmental Security', question: 'Are data centres and server rooms protected with multi-factor physical access controls?' },
  { id: 'q087', category: 'Physical & Environmental Security', question: 'Is CCTV surveillance in place at all critical facilities with footage retained for at least 90 days?' },
  { id: 'q088', category: 'Physical & Environmental Security', question: 'Are environmental controls (fire suppression, UPS, cooling) in place for all data processing facilities?' },
  { id: 'q089', category: 'Physical & Environmental Security', question: 'Is visitor access to sensitive areas logged and escorted?' },
  { id: 'q090', category: 'Physical & Environmental Security', question: 'Are clean desk and clear screen policies enforced?' },
  { id: 'q091', category: 'Physical & Environmental Security', question: 'Is physical media (paper, drives) disposed of securely using certified destruction methods?' },
  { id: 'q092', category: 'Physical & Environmental Security', question: 'Are physical security controls reviewed and tested at least annually?' },

  // Human Resources Security (93–100)
  { id: 'q093', category: 'Human Resources Security', question: 'Are background checks (criminal, employment history, reference) conducted on all employees before hire?' },
  { id: 'q094', category: 'Human Resources Security', question: 'Are background checks repeated periodically for employees in sensitive or privileged roles?' },
  { id: 'q095', category: 'Human Resources Security', question: 'Do all employees sign confidentiality and non-disclosure agreements (NDAs) upon joining?' },
  { id: 'q096', category: 'Human Resources Security', question: 'Is security awareness training mandatory for all new hires within the first 30 days?' },
  { id: 'q097', category: 'Human Resources Security', question: 'Are phishing simulation exercises conducted at least quarterly?' },
  { id: 'q098', category: 'Human Resources Security', question: 'Is there a formal disciplinary process for security policy violations?' },
  { id: 'q099', category: 'Human Resources Security', question: 'Are contractors and temporary staff subject to the same security requirements as permanent employees?' },
  { id: 'q100', category: 'Human Resources Security', question: 'Is there a whistleblower or anonymous reporting mechanism for security concerns?' },

  // Cloud & SaaS Security (101–108)
  { id: 'q101', category: 'Cloud & SaaS Security', question: 'Does the vendor maintain a cloud security policy covering all cloud service providers in use?' },
  { id: 'q102', category: 'Cloud & SaaS Security', question: 'Are cloud environments configured according to CIS Benchmarks or equivalent hardening standards?' },
  { id: 'q103', category: 'Cloud & SaaS Security', question: 'Is Cloud Security Posture Management (CSPM) tooling deployed to detect misconfigurations?' },
  { id: 'q104', category: 'Cloud & SaaS Security', question: 'Are cloud access logs (CloudTrail, Azure Monitor, GCP Audit Logs) enabled and retained for at least 12 months?' },
  { id: 'q105', category: 'Cloud & SaaS Security', question: 'Is data residency for SC-TPCRS data restricted to approved geographic regions?' },
  { id: 'q106', category: 'Cloud & SaaS Security', question: 'Are SaaS applications reviewed and approved before use by employees?' },
  { id: 'q107', category: 'Cloud & SaaS Security', question: 'Is Shadow IT monitored and controlled through a formal approval process?' },
  { id: 'q108', category: 'Cloud & SaaS Security', question: 'Are cloud service provider SLAs reviewed and aligned with SC-TPCRS uptime and recovery requirements?' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORIES = Array.from(new Set(QUESTIONNAIRE.map((q) => q.category)));

const RISK_OPTIONS: { value: RiskLevel; label: string; color: string; bg: string }[] = [
  { value: 'critical', label: 'Critical', color: 'text-status-critical', bg: 'bg-status-critical/10 border-status-critical' },
  { value: 'high', label: 'High', color: 'text-status-high', bg: 'bg-status-high/10 border-status-high' },
  { value: 'medium', label: 'Medium', color: 'text-status-medium', bg: 'bg-status-medium/10 border-status-medium' },
  { value: 'low', label: 'Low', color: 'text-status-low', bg: 'bg-status-low/10 border-status-low' },
  { value: 'informational', label: 'Informational', color: 'text-status-info', bg: 'bg-status-info/10 border-status-info' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'immediate', label: 'Immediate', color: 'text-status-critical' },
  { value: 'high', label: 'High', color: 'text-status-high' },
  { value: 'medium', label: 'Medium', color: 'text-status-medium' },
  { value: 'low', label: 'Low', color: 'text-status-low' },
];

const RESPONSE_OPTIONS: { value: QuestionResponse; label: string; color: string }[] = [
  { value: 'yes', label: 'Yes', color: 'text-status-low' },
  { value: 'partial', label: 'Partial', color: 'text-status-medium' },
  { value: 'no', label: 'No', color: 'text-status-critical' },
  { value: 'na', label: 'N/A', color: 'text-muted-foreground' },
];

const VENDORS = [
  'Interswitch Group', 'Flutterwave Inc.', 'Paystack (Stripe)', 'MTN Nigeria',
  'Huawei Technologies', 'Microsoft Nigeria', 'Oracle Financial', 'Cisco Systems',
  'Zenith Bank Tech', 'Access Bank Digital', 'NIBSS', 'eTranzact',
];

// ─── Component ────────────────────────────────────────────────────────────────

const STEPS = ['Assessment Details', 'Questionnaire', 'Findings & Remediation'];

export default function VendorAssessmentFindingsModal({
  onClose,
  onSubmit,
  vendorName: initialVendor = '',
}: VendorAssessmentFindingsModalProps) {
  const [step, setStep] = useState(0);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FindingsFormData>({
    vendorName: initialVendor,
    assessmentDate: '',
    assessorName: '',
    riskLevel: '',
    priority: '',
    dueDate: '',
    executiveSummary: '',
    remediationSteps: '',
    additionalNotes: '',
    responses: {},
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const setField = <K extends keyof FindingsFormData>(key: K, value: FindingsFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[key as string]; return e; });
  };

  const setResponse = (id: string, value: QuestionResponse) => {
    setForm((prev) => ({ ...prev, responses: { ...prev.responses, [id]: value } }));
  };

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!form.vendorName) e.vendorName = 'Select a vendor';
    if (!form.assessmentDate) e.assessmentDate = 'Enter assessment date';
    if (!form.assessorName.trim()) e.assessorName = 'Enter assessor name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.riskLevel) e.riskLevel = 'Select a risk level';
    if (!form.priority) e.priority = 'Select a priority';
    if (!form.dueDate) e.dueDate = 'Set a remediation due date';
    if (!form.executiveSummary.trim()) e.executiveSummary = 'Provide an executive summary';
    if (!form.remediationSteps.trim()) e.remediationSteps = 'Describe remediation steps';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (!validateStep2()) return;
    setSubmitted(true);
    onSubmit(form);
  };

  // Questionnaire stats
  const totalQ = QUESTIONNAIRE.length;
  const answeredQ = Object.values(form.responses).filter((r) => r !== '').length;
  const categoryQuestions = QUESTIONNAIRE.filter((q) => q.category === activeCategory);
  const categoryAnswered = categoryQuestions.filter((q) => form.responses[q.id]).length;

  const yesCount = Object.values(form.responses).filter((r) => r === 'yes').length;
  const noCount = Object.values(form.responses).filter((r) => r === 'no').length;
  const partialCount = Object.values(form.responses).filter((r) => r === 'partial').length;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-xl w-full max-w-md mx-4 shadow-2xl p-10 flex flex-col items-center gap-4">
          <CheckCircle2 size={48} className="text-status-low" />
          <h2 className="text-lg font-semibold text-foreground">Assessment Findings Saved</h2>
          <p className="text-sm text-muted-foreground text-center">
            The vendor assessment findings for <span className="text-foreground font-medium">{form.vendorName}</span> have been recorded successfully.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-150"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl mx-4 shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <ClipboardCheck size={18} className="text-primary" />
            <div>
              <h2 className="text-base font-semibold text-foreground">Vendor Assessment Findings</h2>
              <p className="text-xs text-muted-foreground">Capture risk findings, questionnaire responses, and remediation plan</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-border bg-muted/20 flex-shrink-0">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < step ? 'bg-primary border-primary text-primary-foreground' :
                  i === step ? 'border-primary text-primary bg-primary/10': 'border-border text-muted-foreground bg-transparent'
                }`}>
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Step 0: Assessment Details ── */}
          {step === 0 && (
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Vendor */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Vendor Being Assessed *</label>
                  <div className="relative">
                    <select
                      value={form.vendorName}
                      onChange={(e) => setField('vendorName', e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select vendor…</option>
                      {VENDORS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.vendorName && <p className="text-xs text-status-critical mt-1">{errors.vendorName}</p>}
                </div>

                {/* Assessment Date */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Assessment Date *</label>
                  <input
                    type="date"
                    value={form.assessmentDate}
                    onChange={(e) => setField('assessmentDate', e.target.value)}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.assessmentDate && <p className="text-xs text-status-critical mt-1">{errors.assessmentDate}</p>}
                </div>

                {/* Assessor */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Lead Assessor *</label>
                  <input
                    type="text"
                    placeholder="e.g. Olumide Fashola"
                    value={form.assessorName}
                    onChange={(e) => setField('assessorName', e.target.value)}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.assessorName && <p className="text-xs text-status-critical mt-1">{errors.assessorName}</p>}
                </div>
              </div>

              {/* Info box */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <AlertTriangle size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">Assessment Scope</p>
                  <p className="text-xs text-muted-foreground">
                    This assessment covers {totalQ} questions across {CATEGORIES.length} security domains. You will capture questionnaire responses in Step 2, then record findings and remediation in Step 3.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Questionnaire ── */}
          {step === 1 && (
            <div className="flex h-full min-h-0" style={{ height: '520px' }}>
              {/* Category sidebar */}
              <div className="w-52 flex-shrink-0 border-r border-border overflow-y-auto bg-muted/10">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Domains</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{answeredQ}/{totalQ} answered</p>
                </div>
                {CATEGORIES.map((cat) => {
                  const catQs = QUESTIONNAIRE.filter((q) => q.category === cat);
                  const catAnswered = catQs.filter((q) => form.responses[q.id]).length;
                  const allDone = catAnswered === catQs.length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-2.5 border-b border-border/50 transition-colors ${
                        activeCategory === cat ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium leading-tight">{cat}</span>
                        {allDone
                          ? <CheckCircle2 size={11} className="text-status-low flex-shrink-0" />
                          : <span className="text-2xs text-muted-foreground flex-shrink-0">{catAnswered}/{catQs.length}</span>
                        }
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Questions panel */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-5 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{activeCategory}</p>
                    <p className="text-xs text-muted-foreground">{categoryAnswered}/{categoryQuestions.length} answered</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="text-status-low font-medium">{yesCount} Yes</span>
                    <span className="text-status-medium font-medium">{partialCount} Partial</span>
                    <span className="text-status-critical font-medium">{noCount} No</span>
                  </div>
                </div>
                <div className="divide-y divide-border/50">
                  {categoryQuestions.map((q, idx) => {
                    const current = form.responses[q.id] ?? '';
                    return (
                      <div key={q.id} className="px-5 py-3.5">
                        <div className="flex items-start gap-2.5 mb-2.5">
                          <span className="text-xs font-mono-data text-muted-foreground mt-0.5 flex-shrink-0 w-8">
                            {q.id.replace('q', 'Q')}
                          </span>
                          <p className="text-xs text-foreground leading-relaxed">{q.question}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-10">
                          {RESPONSE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setResponse(q.id, opt.value)}
                              className={`px-3 py-1 rounded-md text-xs font-medium border transition-all duration-100 ${
                                current === opt.value
                                  ? `${opt.color} border-current bg-current/10`
                                  : 'text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                          {current && (
                            <button
                              onClick={() => setResponse(q.id, '')}
                              className="text-xs text-muted-foreground hover:text-foreground ml-1 underline"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Findings & Remediation ── */}
          {step === 2 && (
            <div className="px-6 py-5 space-y-4">
              {/* Questionnaire summary */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Questions', value: totalQ, color: 'text-foreground' },
                  { label: 'Answered', value: answeredQ, color: 'text-status-info' },
                  { label: 'Compliant (Yes)', value: yesCount, color: 'text-status-low' },
                  { label: 'Non-Compliant (No)', value: noCount, color: 'text-status-critical' },
                ].map((s) => (
                  <div key={s.label} className="bg-muted/30 border border-border rounded-lg p-3 text-center">
                    <p className={`text-xl font-bold font-mono-data ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Overall Risk Level *</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {RISK_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setField('riskLevel', opt.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border-2 transition-all duration-100 ${
                        form.riskLevel === opt.value
                          ? `${opt.bg} ${opt.color}`
                          : 'bg-muted border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {errors.riskLevel && <p className="text-xs text-status-critical mt-1">{errors.riskLevel}</p>}
              </div>

              {/* Priority + Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Remediation Priority *</label>
                  <div className="relative">
                    <select
                      value={form.priority}
                      onChange={(e) => setField('priority', e.target.value as Priority)}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select priority…</option>
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.priority && <p className="text-xs text-status-critical mt-1">{errors.priority}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Remediation Due Date *</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setField('dueDate', e.target.value)}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.dueDate && <p className="text-xs text-status-critical mt-1">{errors.dueDate}</p>}
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Executive Summary *</label>
                <textarea
                  rows={3}
                  placeholder="Summarise the key findings from this assessment for executive review…"
                  value={form.executiveSummary}
                  onChange={(e) => setField('executiveSummary', e.target.value)}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                {errors.executiveSummary && <p className="text-xs text-status-critical mt-1">{errors.executiveSummary}</p>}
              </div>

              {/* Remediation Steps */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Remediation Steps *</label>
                <textarea
                  rows={4}
                  placeholder="List specific, actionable remediation steps the vendor must complete. Number each step for clarity…"
                  value={form.remediationSteps}
                  onChange={(e) => setField('remediationSteps', e.target.value)}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                {errors.remediationSteps && <p className="text-xs text-status-critical mt-1">{errors.remediationSteps}</p>}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Additional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any additional context, exceptions, or follow-up actions…"
                  value={form.additionalNotes}
                  onChange={(e) => setField('additionalNotes', e.target.value)}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0 bg-muted/10">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-muted border border-border text-sm font-medium text-foreground hover:bg-secondary transition-all duration-150"
              >
                <ChevronLeft size={14} />
                Back
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2">
            {step === 1 && (
              <span className="text-xs text-muted-foreground">
                {answeredQ}/{totalQ} questions answered
              </span>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95"
              >
                Next
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95"
              >
                <Save size={14} />
                Save Findings
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
