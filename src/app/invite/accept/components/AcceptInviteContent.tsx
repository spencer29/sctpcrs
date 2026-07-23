'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, User, Lock, Eye, EyeOff, Loader2, AlertTriangle, Check, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AppRole } from '@/lib/rbac/permissions';

// ─── Role display map ─────────────────────────────────────────────────────────

const ROLE_DISPLAY: Record<AppRole, { label: string; color: string; description: string }> = {
  admin: {
    label: 'Administrator',
    color: '#ef4444',
    description: 'Full platform access — manage users, roles, teams, and all resources',
  },
  risk_officer: {
    label: 'Risk Officer',
    color: '#f97316',
    description: 'Broad access to risk resources — can escalate, approve, and manage incidents',
  },
  analyst: {
    label: 'Auditor',
    color: '#eab308',
    description: 'Create and edit core resources — compliance audits and incident escalation',
  },
  viewer: {
    label: 'Vendor Manager',
    color: '#22c55e',
    description: 'Read-only access to vendor data, assessments, and supply chain resources',
  },
};

// ─── Invite data type ─────────────────────────────────────────────────────────

interface InviteData {
  id: string;
  email: string;
  role: AppRole;
  token: string;
  status: string;
  expires_at: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const fetchInvite = useCallback(async () => {
    if (!token) {
      setInviteError('Invalid or missing invite token.');
      setLoadingInvite(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('id, email, role, token, status, expires_at')
        .eq('token', token)
        .eq('status', 'pending')
        .maybeSingle();

      if (error || !data) {
        setInviteError('This invite link is invalid or has already been used.');
        setLoadingInvite(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setInviteError('This invite link has expired. Please request a new one from your administrator.');
        setLoadingInvite(false);
        return;
      }

      setInvite(data as InviteData);
    } catch {
      setInviteError('Failed to validate invite. Please try again.');
    } finally {
      setLoadingInvite(false);
    }
  }, [token, supabase]);

  useEffect(() => {
    fetchInvite();
  }, [fetchInvite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setFormError('');
    setSubmitting(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: invite.role,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')}/`,
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered')) {
          setFormError('An account with this email already exists. Please sign in instead.');
        } else {
          setFormError(signUpError.message);
        }
        setSubmitting(false);
        return;
      }

      // Mark invitation as accepted
      await supabase
        .from('team_invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('token', token);

      // Update user_profiles role if profile was auto-created by trigger
      if (signUpData?.user?.id) {
        await supabase
          .from('user_profiles')
          .update({ role: invite.role, full_name: fullName.trim() })
          .eq('id', signUpData.user.id);
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/sign-up-login-screen');
      }, 3000);
    } catch {
      setFormError('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (loadingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0E1A' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin" style={{ color: '#60A5FA' }} />
          <p className="text-sm" style={{ color: '#94A3B8' }}>Validating invite…</p>
        </div>
      </div>
    );
  }

  // ─── Invalid invite ─────────────────────────────────────────────────────────

  if (inviteError || !invite) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#0A0E1A' }}>
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{ backgroundColor: '#111827', border: '1px solid #1E293B' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <AlertTriangle size={24} style={{ color: '#EF4444' }} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Invalid Invite</h2>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
            {inviteError || 'This invite link is not valid.'}
          </p>
          <button
            onClick={() => router.push('/sign-up-login-screen')}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#2563EB' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const roleInfo = ROLE_DISPLAY[invite.role] ?? ROLE_DISPLAY.viewer;

  // ─── Success state ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#0A0E1A' }}>
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{ backgroundColor: '#111827', border: '1px solid #1E293B' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <Check size={24} style={{ color: '#22C55E' }} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Account Created!</h2>
          <p className="text-sm mb-2" style={{ color: '#94A3B8' }}>
            Welcome to SC-TPCRS. Your account has been set up as{' '}
            <span className="font-semibold" style={{ color: roleInfo.color }}>
              {roleInfo.label}
            </span>
            .
          </p>
          <p className="text-xs" style={{ color: '#64748B' }}>Redirecting to login…</p>
        </div>
      </div>
    );
  }

  // ─── Registration form ──────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ backgroundColor: '#0A0E1A' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(30,41,59,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(30,41,59,0.12) 1px, transparent 1px)`,
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: '#0F172A', border: '1px solid rgba(59,130,246,0.45)', boxShadow: '0 0 18px rgba(59,130,246,0.25)' }}
          >
            <ShieldAlert size={30} style={{ color: '#60A5FA' }} />
          </div>
          <h1 className="font-bold text-white text-center mb-1" style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>
            SC-TPCRS
          </h1>
          <p className="text-center text-sm" style={{ color: '#94A3B8' }}>
            You have been invited to join the platform
          </p>
        </div>

        {/* Role badge */}
        <div
          className="flex items-center gap-3 w-full rounded-xl p-4 mb-5"
          style={{ backgroundColor: '#111827', border: '1px solid #1E293B' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${roleInfo.color}18`, border: `1px solid ${roleInfo.color}40` }}
          >
            <Building2 size={18} style={{ color: roleInfo.color }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">Joining as</p>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${roleInfo.color}18`, color: roleInfo.color, border: `1px solid ${roleInfo.color}40` }}
              >
                {roleInfo.label}
              </span>
            </div>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#64748B' }}>
              {roleInfo.description}
            </p>
          </div>
        </div>

        {/* Form card */}
        <div
          className="w-full rounded-2xl p-8"
          style={{ backgroundColor: '#111827', border: '1px solid #1E293B', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
        >
          <div className="mb-6">
            <h2 className="font-bold text-white text-xl mb-1">Complete Your Account</h2>
            <p className="text-sm" style={{ color: '#60A5FA' }}>
              Invited as: <span className="font-medium">{invite.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setFormError(''); }}
                  placeholder="Jane Smith"
                  className="w-full rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={{ backgroundColor: '#0B1120', border: '1px solid #1E293B' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#1E293B'; e.currentTarget.style.boxShadow = 'none'; }}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-lg pl-10 pr-11 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={{ backgroundColor: '#0B1120', border: '1px solid #1E293B' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#1E293B'; e.currentTarget.style.boxShadow = 'none'; }}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                  style={{ color: '#64748B' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: '#60A5FA' }}>
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFormError(''); }}
                  placeholder="Re-enter password"
                  className="w-full rounded-lg pl-10 pr-11 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={{ backgroundColor: '#0B1120', border: '1px solid #1E293B' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#1E293B'; e.currentTarget.style.boxShadow = 'none'; }}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                  style={{ color: '#64748B' }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {formError && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <AlertTriangle size={13} style={{ color: '#EF4444' }} className="flex-shrink-0" />
                <p className="text-xs" style={{ color: '#F87171' }}>{formError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg py-3 font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{ backgroundColor: submitting ? '#1e3a6e' : '#2563EB', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#1D4ED8'; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#2563EB'; }}
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Creating Account…</>
              ) : (
                'Create Account & Join'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
