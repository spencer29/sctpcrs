'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import {
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Copy,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  ChevronLeft,
  Building2,
  Globe,
  FileText,
} from 'lucide-react';

type AuthMode = 'login' | 'signup';
type AuthStep = 'credentials' | 'mfa';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignupFormValues {
  fullName: string;
  email: string;
  organisation: string;
  role: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface MfaFormValues {
  totp: string;
}

const demoCredentials = [
  {
    id: 'cred-admin',
    role: 'ADMIN',
    label: 'System Administrator',
    email: 'admin@sctpcrs.ng',
    password: 'SC-Admin#2026',
    description: 'Full system access, user management, audit logs',
    badgeClass: 'badge-critical',
  },
  {
    id: 'cred-risk',
    role: 'RISK_OFFICER',
    label: 'Risk Officer',
    email: 'risk.officer@sctpcrs.ng',
    password: 'SC-Risk#2026',
    description: 'Vendor management, assessments, incident declaration',
    badgeClass: 'badge-high',
  },
  {
    id: 'cred-compliance',
    role: 'COMPLIANCE_ANALYST',
    label: 'Compliance Analyst',
    email: 'compliance@sctpcrs.ng',
    password: 'SC-Comply#2026',
    description: 'Compliance evidence, control mappings, reports',
    badgeClass: 'badge-medium',
  },
  {
    id: 'cred-analyst',
    role: 'ANALYST',
    label: 'Security Analyst',
    email: 'analyst@sctpcrs.ng',
    password: 'SC-Analyst#2026',
    description: 'Read-only access to dashboards and risk scores',
    badgeClass: 'badge-info',
  },
  {
    id: 'cred-viewer',
    role: 'VIEWER',
    label: 'Executive Viewer',
    email: 'executive@sctpcrs.ng',
    password: 'SC-Exec#2026',
    description: 'Executive dashboard and report access only',
    badgeClass: 'badge-low',
  },
];

const MOCK_TOTP = '482913';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<AuthStep>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [authError, setAuthError] = useState('');

  const loginForm = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const signupForm = useForm<SignupFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      organisation: '',
      role: 'ANALYST',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const mfaForm = useForm<MfaFormValues>({
    defaultValues: { totp: '' },
  });

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleCredentialClick = (cred: typeof demoCredentials[0]) => {
    loginForm.setValue('email', cred.email);
    loginForm.setValue('password', cred.password);
    setAuthError('');
    toast.info(`Credentials filled for ${cred.label}`);
  };

  const handleLoginSubmit = loginForm.handleSubmit(async (data) => {
    setAuthError('');
    setIsLoading(true);
    // Backend integration point: POST /api/v1/auth/login → Keycloak OAuth2 token endpoint
    await new Promise((r) => setTimeout(r, 1200));

    const validCred = demoCredentials.find(
      (c) => c.email === data.email && c.password === data.password
    );

    if (!validCred) {
      setIsLoading(false);
      setAuthError('Invalid credentials — use the demo accounts below to sign in');
      return;
    }

    setPendingEmail(data.email);
    setIsLoading(false);
    setStep('mfa');
  });

  const handleMfaSubmit = mfaForm.handleSubmit(async (data) => {
    setIsLoading(true);
    // Backend integration point: POST /api/v1/auth/mfa/verify → TOTP validation
    await new Promise((r) => setTimeout(r, 900));

    if (data.totp !== MOCK_TOTP) {
      mfaForm.setError('totp', { message: 'Invalid TOTP code — check your authenticator app' });
      setIsLoading(false);
      return;
    }

    toast.success('Authentication successful — redirecting to dashboard');
    setIsLoading(false);
    // Backend integration point: redirect to /risk-overview-dashboard after session established
    setTimeout(() => { window.location.href = '/'; }, 1000);
  });

  const handleSignupSubmit = signupForm.handleSubmit(async (data) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    // Backend integration point: POST /api/v1/auth/register → auth-service user creation
    await new Promise((r) => setTimeout(r, 1400));
    setIsLoading(false);
    toast.success('Account request submitted — an administrator will activate your account within 24 hours');
    setMode('login');
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden bg-card border-r border-border">
        {/* Background grid */}
        <div className="absolute inset-0 cyber-grid opacity-60" />

        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <AppLogo size={40} />
            <div>
              <span className="font-bold text-lg text-foreground tracking-tight">SC-TPCRS</span>
              <p className="text-2xs text-muted-foreground tracking-widest uppercase">Supply Chain & Third-Party Cyber Risk</p>
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            <div>
              <h1 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight tracking-tight">
                Vendor Risk Intelligence{' '}
                <span className="text-gradient-cyan">for Fintech</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Automated VRS scoring, SBOM vulnerability analysis, and real-time compliance monitoring
                across CBN, PCI DSS v4.0, ISO 27001, and NDPA 2023 — all in one platform.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                {
                  id: 'feat-vrs',
                  icon: <Shield size={15} />,
                  title: 'Composite Vendor Risk Score (VRS)',
                  desc: '7-signal automated scoring updated daily with NVD, MISP, and CISA KEV feeds',
                },
                {
                  id: 'feat-sbom',
                  icon: <FileText size={15} />,
                  title: 'SBOM Vulnerability Analysis',
                  desc: 'SPDX 2.3 and CycloneDX 1.5 ingestion with transitive dependency graph',
                },
                {
                  id: 'feat-compliance',
                  icon: <ShieldCheck size={15} />,
                  title: 'Multi-Framework Compliance',
                  desc: 'Automated control mapping across CBN, PCI DSS v4.0, ISO 27001, NIST CSF 2.0',
                },
                {
                  id: 'feat-monitoring',
                  icon: <Globe size={15} />,
                  title: 'Continuous Threat Monitoring',
                  desc: 'Real-time IOC matching, dark web monitoring, and automated re-scoring',
                },
              ].map((feat) => (
                <div key={feat.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                  <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    {feat.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{feat.title}</p>
                    <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance badges */}
        <div className="relative z-10">
          <p className="text-2xs text-muted-foreground uppercase tracking-widest mb-3 font-semibold">Regulatory Compliance</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'badge-cbn', label: 'CBN 2021', color: 'text-primary bg-primary/10 border-primary/30' },
              { id: 'badge-pci', label: 'PCI DSS v4.0', color: 'badge-high' },
              { id: 'badge-iso', label: 'ISO 27001:2022', color: 'badge-info' },
              { id: 'badge-nist', label: 'NIST CSF 2.0', color: 'badge-medium' },
              { id: 'badge-ndpa', label: 'NDPA 2023', color: 'badge-low' },
            ].map((b) => (
              <span key={b.id} className={`text-2xs font-mono-data font-semibold px-2 py-1 rounded border ${b.color}`}>
                {b.label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
              <Lock size={11} className="text-status-low" />
              <span>TLS 1.3 encrypted</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
              <Smartphone size={11} className="text-primary" />
              <span>MFA mandatory — PCI DSS Req 8.4</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
              <Building2 size={11} className="text-status-info" />
              <span>CBN Framework compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-bold text-foreground">SC-TPCRS</span>
          </div>

          {/* Step indicator */}
          {step === 'mfa' && (
            <div className="mb-6">
              <button
                onClick={() => { setStep('credentials'); mfaForm.reset(); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ChevronLeft size={14} /> Back to sign in
              </button>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                    <CheckCircle size={12} className="text-primary" />
                  </div>
                  <span className="text-2xs text-muted-foreground">Credentials</span>
                </div>
                <div className="h-px w-8 bg-primary/30" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-2xs font-bold text-primary-foreground">2</span>
                  </div>
                  <span className="text-2xs text-primary font-medium">MFA Verification</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode toggle — only on credentials step */}
          {step === 'credentials' && (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border mb-6">
              {(['login', 'signup'] as AuthMode[]).map((m) => (
                <button
                  key={`mode-${m}`}
                  onClick={() => { setMode(m); setAuthError(''); loginForm.reset(); signupForm.reset(); }}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all duration-150 ${
                    mode === m
                      ? 'bg-card text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Request Access'}
                </button>
              ))}
            </div>
          )}

          {/* ─── MFA STEP ─── */}
          {step === 'mfa' && (
            <div className="space-y-6 fade-in">
              <div>
                <h2 className="text-xl font-bold text-foreground">Multi-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the 6-digit code from your authenticator app for{' '}
                  <span className="text-primary font-mono-data text-xs">{pendingEmail}</span>
                </p>
              </div>

              {/* MFA notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Smartphone size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-primary">TOTP Required — PCI DSS Req 8.4</p>
                  <p className="text-2xs text-muted-foreground mt-0.5">
                    MFA is mandatory for all SC-TPCRS users per CBN Risk-Based Cybersecurity Framework §4.3.
                    Use Google Authenticator, Authy, or any TOTP-compatible app.
                  </p>
                </div>
              </div>

              {/* Demo TOTP hint */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                <div>
                  <p className="text-2xs text-muted-foreground font-semibold uppercase tracking-wider">Demo TOTP Code</p>
                  <p className="font-mono-data text-xl font-bold text-primary tracking-widest mt-1">{MOCK_TOTP}</p>
                </div>
                <button
                  onClick={() => { mfaForm.setValue('totp', MOCK_TOTP); toast.info('TOTP code filled'); }}
                  className="text-2xs text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded transition-all"
                >
                  Use code
                </button>
              </div>

              <form onSubmit={handleMfaSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    6-Digit TOTP Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    {...mfaForm.register('totp', {
                      required: 'TOTP code is required',
                      pattern: { value: /^\d{6}$/, message: 'Must be exactly 6 digits' },
                    })}
                    className="w-full bg-input border border-border rounded-md px-4 py-3 text-center text-2xl font-mono-data font-bold text-foreground tracking-widest placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
                  />
                  {mfaForm.formState.errors.totp && (
                    <p className="text-xs text-status-critical mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      {mfaForm.formState.errors.totp.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.99]"
                  style={{ minHeight: '42px' }}
                >
                  {isLoading ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <>
                      Verify & Access Platform
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-2xs text-muted-foreground text-center">
                Lost access to your authenticator?{' '}
                <button className="text-primary hover:underline">Contact your administrator</button>
              </p>
            </div>
          )}

          {/* ─── LOGIN FORM ─── */}
          {step === 'credentials' && mode === 'login' && (
            <div className="space-y-5 fade-in">
              <div>
                <h2 className="text-xl font-bold text-foreground">Sign in to SC-TPCRS</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Access your risk management dashboard — MFA required after sign-in.
                </p>
              </div>

              {/* Auth error */}
              {authError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-status-critical-bg border border-status-critical/40 fade-in">
                  <AlertTriangle size={13} className="text-status-critical flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-status-critical">{authError}</p>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@yourorg.ng"
                      {...loginForm.register('email', {
                        required: 'Email address is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                      })}
                      className="w-full bg-input border border-border rounded-md pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-status-critical mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground">Password</label>
                    <button type="button" className="text-2xs text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Your password"
                      {...loginForm.register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      })}
                      className="w-full bg-input border border-border rounded-md pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-status-critical mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...loginForm.register('rememberMe')}
                    className="w-3.5 h-3.5 rounded border-border bg-input accent-primary"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer">
                    Keep me signed in for 8 hours
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.99]"
                  style={{ minHeight: '42px' }}
                >
                  {isLoading ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Security notice */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Shield size={13} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-2xs text-muted-foreground leading-relaxed">
                  All sessions require TOTP multi-factor authentication per{' '}
                  <span className="text-foreground font-medium">PCI DSS Req 8.4</span> and{' '}
                  <span className="text-foreground font-medium">CBN Cybersecurity Framework §4.3</span>.
                  Accounts lock after 5 failed attempts.
                </p>
              </div>

              {/* Demo credentials table */}
              <div className="space-y-2">
                <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Demo Credentials — Click to autofill
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  {demoCredentials.map((cred, idx) => (
                    <div
                      key={cred.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors group ${
                        idx !== demoCredentials.length - 1 ? 'border-b border-border/50' : ''
                      }`}
                      onClick={() => handleCredentialClick(cred)}
                    >
                      <span className={`text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded flex-shrink-0 w-28 text-center ${cred.badgeClass}`}>
                        {cred.role}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{cred.email}</p>
                        <p className="text-2xs text-muted-foreground truncate">{cred.description}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopy(cred.email, `${cred.id}-email`); }}
                          title="Copy email"
                          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          {copiedField === `${cred.id}-email` ? <CheckCircle size={11} className="text-status-low" /> : <Copy size={11} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopy(cred.password, `${cred.id}-pw`); }}
                          title="Copy password"
                          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          {copiedField === `${cred.id}-pw` ? <CheckCircle size={11} className="text-status-low" /> : <Lock size={11} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── SIGNUP FORM ─── */}
          {step === 'credentials' && mode === 'signup' && (
            <div className="space-y-5 fade-in">
              <div>
                <h2 className="text-xl font-bold text-foreground">Request Platform Access</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Access requests are reviewed by your organisation's administrator within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Full Name <span className="text-status-critical">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Adaeze Okonkwo"
                    {...signupForm.register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                    className="w-full bg-input border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
                  />
                  {signupForm.formState.errors.fullName && (
                    <p className="text-xs text-status-critical mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      {signupForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Work email */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Work Email Address <span className="text-status-critical">*</span>
                  </label>
                  <p className="text-2xs text-muted-foreground mb-1.5">Must match your organisation's email domain</p>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@yourorg.ng"
                      {...signupForm.register('email', {
                        required: 'Work email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                      })}
                      className="w-full bg-input border border-border rounded-md pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
                    />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="text-xs text-status-critical mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Organisation */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Organisation Name <span className="text-status-critical">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="First Bank of Nigeria Ltd"
                      {...signupForm.register('organisation', {
                        required: 'Organisation name is required',
                      })}
                      className="w-full bg-input border border-border rounded-md pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
                    />
                  </div>
                  {signupForm.formState.errors.organisation && (
                    <p className="text-xs text-status-critical mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      {signupForm.formState.errors.organisation.message}
                    </p>
                  )}
                </div>

                {/* Requested role */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Requested Role <span className="text-status-critical">*</span>
                  </label>
                  <p className="text-2xs text-muted-foreground mb-1.5">Final role is assigned by your administrator</p>
                  <select
                    {...signupForm.register('role', { required: 'Please select a role' })}
                    className="w-full bg-input border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="ANALYST">Security Analyst — Read-only access</option>
                    <option value="COMPLIANCE_ANALYST">Compliance Analyst — Compliance evidence access</option>
                    <option value="RISK_OFFICER">Risk Officer — Full vendor management access</option>
                    <option value="VIEWER">Executive Viewer — Dashboard access only</option>
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Password <span className="text-status-critical">*</span>
                  </label>
                  <p className="text-2xs text-muted-foreground mb-1.5">Minimum 12 characters with uppercase, number, and symbol — NIST SP 800-63B</p>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 12 characters"
                      {...signupForm.register('password', {
                        required: 'Password is required',
                        minLength: { value: 12, message: 'Minimum 12 characters required (PCI DSS policy)' },
                        pattern: {
                          value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/,
                          message: 'Must contain uppercase, number, and special character',
                        },
                      })}
                      className="w-full bg-input border border-border rounded-md pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-xs text-status-critical mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Confirm Password <span className="text-status-critical">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      {...signupForm.register('confirmPassword', {
                        required: 'Please confirm your password',
                      })}
                      className="w-full bg-input border border-border rounded-md pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-status-critical mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2.5">
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    {...signupForm.register('agreeTerms', {
                      required: 'You must accept the terms to continue',
                    })}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-border bg-input accent-primary flex-shrink-0"
                  />
                  <label htmlFor="agreeTerms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                    I agree to the{' '}
                    <button type="button" className="text-primary hover:underline">Terms of Service</button>
                    {' '}and{' '}
                    <button type="button" className="text-primary hover:underline">Privacy Policy</button>.
                    I understand that all access is subject to RBAC controls and my activity is logged per{' '}
                    <span className="text-foreground font-medium">PCI DSS Req 10</span>.
                  </label>
                </div>
                {signupForm.formState.errors.agreeTerms && (
                  <p className="text-xs text-status-critical flex items-center gap-1">
                    <AlertTriangle size={11} />
                    {signupForm.formState.errors.agreeTerms.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.99]"
                  style={{ minHeight: '42px' }}
                >
                  {isLoading ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <>
                      Submit Access Request
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* MFA notice */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Smartphone size={13} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-2xs text-muted-foreground leading-relaxed">
                  Upon account activation, you will be required to enrol a TOTP authenticator app.
                  MFA is mandatory for all platform users per{' '}
                  <span className="text-foreground font-medium">PCI DSS Req 8.4</span>.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-2xs text-muted-foreground text-center">
              SC-TPCRS v1.0 · MIVA Open University MIT Professional Master's Project ·{' '}
              <span className="font-mono-data">Build 2026.07.17</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}