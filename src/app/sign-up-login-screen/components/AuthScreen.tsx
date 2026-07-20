'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, User, Lock, Eye, EyeOff, Loader2, UserPlus, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type AuthTab = 'login' | 'signup';

interface Team {
  id: string;
  name: string;
  team_type: string;
}

const SIGNUP_ROLES = [
  { value: 'analyst',      label: 'Analyst',      desc: 'Create & edit core resources, escalate incidents' },
  { value: 'risk_officer', label: 'Risk Officer',  desc: 'Broad access, approve & escalate across resources' },
  { value: 'admin',        label: 'Admin',         desc: 'Full platform access — manage users, roles & teams' },
] as const;

type SignupRole = typeof SIGNUP_ROLES[number]['value'];

export default function AuthScreen() {
  const [tab, setTab] = useState<AuthTab>('login');

  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Signup state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupRole, setSignupRole] = useState<SignupRole>('analyst');
  const [signupTeamId, setSignupTeamId] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Teams list
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Fetch teams when signup tab is active
  useEffect(() => {
    if (tab !== 'signup' || teams.length > 0) return;
    setTeamsLoading(true);
    supabase
      .from('teams')
      .select('id, name, team_type')
      .order('name')
      .then(({ data }) => {
        setTeams(data ?? []);
        if (data && data.length > 0) setSignupTeamId(data[0].id);
      })
      .finally(() => setTeamsLoading(false));
  }, [tab, supabase, teams.length]);

  // ── Login ──────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password: password.trim(),
      });
      if (signInError) throw signInError;

      if (data?.session) {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.nextLevel === 'aal2' || (aal?.currentLevel === 'aal1' && aal?.nextLevel === 'aal2')) {
          router.push('/mfa-verify');
        } else {
          router.push('/');
        }
      } else {
        router.push('/mfa-verify');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials and try again.';
      if (message.toLowerCase().includes('invalid login credentials') || message.toLowerCase().includes('invalid email or password')) {
        setError('Invalid email or password. Please try again.');
      } else if (message.toLowerCase().includes('email not confirmed')) {
        setError('Your email address has not been confirmed. Please check your inbox.');
      } else if (message.toLowerCase().includes('too many requests')) {
        setError('Too many login attempts. Please wait a moment and try again.');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Sign Up ────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupFullName.trim()) { setSignupError('Full name is required.'); return; }
    if (!signupEmail.trim()) { setSignupError('Email is required.'); return; }
    if (signupPassword.length < 8) { setSignupError('Password must be at least 8 characters.'); return; }
    if (signupPassword !== signupConfirm) { setSignupError('Passwords do not match.'); return; }

    setIsSigningUp(true);
    try {
      // 1. Create auth user — trigger will auto-create user_profiles row
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: {
          data: {
            full_name: signupFullName.trim(),
            role: signupRole,
            department: '',
            job_title: '',
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')}/auth/callback`,
        },
      });
      if (signUpError) throw signUpError;

      // 2. If a team was selected and we have a session, insert team membership
      if (signupTeamId && data.user) {
        // Wait briefly for the trigger to create the user_profiles row
        await new Promise((r) => setTimeout(r, 800));

        const { error: memberError } = await supabase
          .from('team_members')
          .insert({ team_id: signupTeamId, user_id: data.user.id })
          .select()
          .single();

        // Non-fatal: team assignment may fail if email confirmation is pending
        if (memberError && !memberError.message.includes('not authenticated')) {
          console.warn('Team assignment deferred:', memberError.message);
        }
      }

      setSignupSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-up failed. Please try again.';
      if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('already exists')) {
        setSignupError('An account with this email already exists. Please sign in.');
      } else if (message.toLowerCase().includes('password')) {
        setSignupError('Password is too weak. Use at least 8 characters with mixed case and numbers.');
      } else {
        setSignupError(message);
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  // ── Shared input style helpers ─────────────────────────────
  const inputBase =
    'w-full rounded-lg py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200';
  const inputStyle = { backgroundColor: '#0B1120', border: '1px solid #1E293B' };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#3B82F6';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#1E293B';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ backgroundColor: '#0A0E1A' }}
    >
      {/* Tactical grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(30,41,59,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,41,59,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">

        {/* Header block */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid rgba(59,130,246,0.45)',
              boxShadow: '0 0 18px rgba(59,130,246,0.25), 0 0 6px rgba(59,130,246,0.15)',
            }}
          >
            <ShieldAlert size={30} style={{ color: '#60A5FA' }} />
          </div>
          <h1 className="font-bold text-white text-center mb-1" style={{ fontSize: '30px', letterSpacing: '-0.02em' }}>
            SC-TPCRS
          </h1>
          <p className="text-center text-sm" style={{ color: '#94A3B8' }}>
            Supply Chain &amp; Third-Party Cybersecurity Risk System
          </p>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-2xl"
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1E293B',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}
        >
          {/* Tab switcher */}
          <div className="flex" style={{ borderBottom: '1px solid #1E293B' }}>
            {(['login', 'signup'] as AuthTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(''); setSignupError(''); setSignupSuccess(false); }}
                className="flex-1 py-4 text-sm font-semibold transition-colors duration-200 focus:outline-none"
                style={{
                  color: tab === t ? '#60A5FA' : '#475569',
                  borderBottom: tab === t ? '2px solid #3B82F6' : '2px solid transparent',
                  backgroundColor: 'transparent',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-9">

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <>
                <div className="mb-7">
                  <h2 className="font-bold text-white text-xl mb-1">Administrator Login</h2>
                  <p className="text-sm" style={{ color: '#60A5FA' }}>
                    Restricted access — authorised personnel only
                  </p>
                </div>

                <form onSubmit={handleLogin} noValidate>
                  {/* Username */}
                  <div className="mb-5">
                    <label htmlFor="username" className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                        <User size={17} />
                      </span>
                      <input
                        id="username" type="text" autoComplete="username" aria-label="Username"
                        placeholder="Enter username" value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                        className={`${inputBase} pl-10 pr-4`} style={inputStyle}
                        onFocus={onFocus} onBlur={onBlur} disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                        <Lock size={17} />
                      </span>
                      <input
                        id="password" type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password" aria-label="Password"
                        placeholder="Enter password" value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className={`${inputBase} pl-10 pr-11`} style={inputStyle}
                        onFocus={onFocus} onBlur={onBlur} disabled={isLoading}
                      />
                      <button
                        type="button" aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                        style={{ color: '#64748B' }} tabIndex={0}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs mb-4 text-center" style={{ color: '#F87171' }} role="alert">{error}</p>
                  )}

                  <button
                    type="submit" disabled={isLoading}
                    className="w-full rounded-lg py-3 font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    style={{ backgroundColor: isLoading ? '#1e3a6e' : '#2563EB', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#1D4ED8'; }}
                    onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#2563EB'; }}
                  >
                    {isLoading ? (<><Loader2 size={16} className="animate-spin" />Authenticating…</>) : 'Sign In'}
                  </button>

                  <div className="mt-7 pt-5" style={{ borderTop: '1px solid #1E293B' }}>
                    <p className="text-xs text-center leading-relaxed" style={{ color: '#3B82F6' }}>
                      This system is restricted to authorised users only. All access attempts are logged
                      and monitored in accordance with the CBN Risk-Based Cybersecurity Framework.
                    </p>
                  </div>
                </form>
              </>
            )}

            {/* ── SIGNUP FORM ── */}
            {tab === 'signup' && (
              <>
                <div className="mb-7">
                  <h2 className="font-bold text-white text-xl mb-1">Create Account</h2>
                  <p className="text-sm" style={{ color: '#60A5FA' }}>
                    Register with your role and team assignment
                  </p>
                </div>

                {signupSuccess ? (
                  <div
                    className="rounded-xl p-6 text-center"
                    style={{ backgroundColor: '#0F2A1A', border: '1px solid rgba(34,197,94,0.3)' }}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                      <UserPlus size={22} style={{ color: '#22C55E' }} />
                    </div>
                    <p className="font-semibold text-white mb-2">Account Created</p>
                    <p className="text-sm" style={{ color: '#86EFAC' }}>
                      Check your inbox to confirm your email, then sign in with your credentials.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setTab('login'); setSignupSuccess(false); }}
                      className="mt-5 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors duration-200"
                      style={{ backgroundColor: '#166534' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#15803D'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#166534'; }}
                    >
                      Go to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSignup} noValidate className="space-y-5">

                    {/* Full Name */}
                    <div>
                      <label htmlFor="signup-fullname" className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                          <User size={17} />
                        </span>
                        <input
                          id="signup-fullname" type="text" autoComplete="name"
                          placeholder="e.g. Emeka Nwosu" value={signupFullName}
                          onChange={(e) => { setSignupFullName(e.target.value); setSignupError(''); }}
                          className={`${inputBase} pl-10 pr-4`} style={inputStyle}
                          onFocus={onFocus} onBlur={onBlur} disabled={isSigningUp}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="signup-email" className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                          <User size={17} />
                        </span>
                        <input
                          id="signup-email" type="email" autoComplete="email"
                          placeholder="you@organisation.com" value={signupEmail}
                          onChange={(e) => { setSignupEmail(e.target.value); setSignupError(''); }}
                          className={`${inputBase} pl-10 pr-4`} style={inputStyle}
                          onFocus={onFocus} onBlur={onBlur} disabled={isSigningUp}
                        />
                      </div>
                    </div>

                    {/* Role selector */}
                    <div>
                      <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                        Role
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {SIGNUP_ROLES.map((r) => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setSignupRole(r.value)}
                            disabled={isSigningUp}
                            className="w-full text-left rounded-lg px-4 py-3 transition-all duration-150 focus:outline-none"
                            style={{
                              backgroundColor: signupRole === r.value ? 'rgba(37,99,235,0.15)' : '#0B1120',
                              border: signupRole === r.value ? '1px solid #3B82F6' : '1px solid #1E293B',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold" style={{ color: signupRole === r.value ? '#60A5FA' : '#CBD5E1' }}>
                                {r.label}
                              </span>
                              {signupRole === r.value && (
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                              )}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{r.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Team selector */}
                    <div>
                      <label htmlFor="signup-team" className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                        Team Assignment
                      </label>
                      {teamsLoading ? (
                        <div className="flex items-center gap-2 py-3 px-4 rounded-lg" style={{ backgroundColor: '#0B1120', border: '1px solid #1E293B' }}>
                          <Loader2 size={14} className="animate-spin" style={{ color: '#64748B' }} />
                          <span className="text-sm" style={{ color: '#64748B' }}>Loading teams…</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            id="signup-team"
                            value={signupTeamId}
                            onChange={(e) => setSignupTeamId(e.target.value)}
                            disabled={isSigningUp || teams.length === 0}
                            className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none transition-all duration-200 appearance-none pr-10"
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          >
                            {teams.length === 0 && <option value="">No teams available</option>}
                            {teams.map((t) => (
                              <option key={t.id} value={t.id} style={{ backgroundColor: '#111827' }}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                            <ChevronDown size={16} />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="signup-password" className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                        Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                          <Lock size={17} />
                        </span>
                        <input
                          id="signup-password" type={showSignupPassword ? 'text' : 'password'}
                          autoComplete="new-password" placeholder="Min. 8 characters"
                          value={signupPassword}
                          onChange={(e) => { setSignupPassword(e.target.value); setSignupError(''); }}
                          className={`${inputBase} pl-10 pr-11`} style={inputStyle}
                          onFocus={onFocus} onBlur={onBlur} disabled={isSigningUp}
                        />
                        <button
                          type="button" aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowSignupPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none rounded"
                          style={{ color: '#64748B' }}
                        >
                          {showSignupPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="signup-confirm" className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                          <Lock size={17} />
                        </span>
                        <input
                          id="signup-confirm" type="password" autoComplete="new-password"
                          placeholder="Re-enter password" value={signupConfirm}
                          onChange={(e) => { setSignupConfirm(e.target.value); setSignupError(''); }}
                          className={`${inputBase} pl-10 pr-4`} style={inputStyle}
                          onFocus={onFocus} onBlur={onBlur} disabled={isSigningUp}
                        />
                      </div>
                    </div>

                    {signupError && (
                      <p className="text-xs text-center" style={{ color: '#F87171' }} role="alert">{signupError}</p>
                    )}

                    <button
                      type="submit" disabled={isSigningUp}
                      className="w-full rounded-lg py-3 font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                      style={{ backgroundColor: isSigningUp ? '#1e3a6e' : '#2563EB', opacity: isSigningUp ? 0.7 : 1, cursor: isSigningUp ? 'not-allowed' : 'pointer' }}
                      onMouseEnter={(e) => { if (!isSigningUp) e.currentTarget.style.backgroundColor = '#1D4ED8'; }}
                      onMouseLeave={(e) => { if (!isSigningUp) e.currentTarget.style.backgroundColor = '#2563EB'; }}
                    >
                      {isSigningUp ? (<><Loader2 size={16} className="animate-spin" />Creating account…</>) : (
                        <><UserPlus size={16} />Create Account</>
                      )}
                    </button>

                    <div className="pt-4" style={{ borderTop: '1px solid #1E293B' }}>
                      <p className="text-xs text-center leading-relaxed" style={{ color: '#3B82F6' }}>
                        New accounts are subject to admin approval. Role and team assignments
                        are stored in Supabase and govern your dashboard access.
                      </p>
                    </div>
                  </form>
                )}
              </>
            )}

          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-center" style={{ color: '#334155' }}>
          SC-TPCRS v2.0 · Nigerian Fintech Ecosystem · Confidential
        </p>
      </div>
    </div>
  );
}