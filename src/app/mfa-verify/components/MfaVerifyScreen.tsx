'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShieldAlert, Loader2, RefreshCw, ArrowLeft, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const OTP_LENGTH = 6;

interface MfaVerifyScreenProps {
  /** Called when the user wants to go back to the login screen */
  onBack?: () => void;
}

export default function MfaVerifyScreen({ onBack }: MfaVerifyScreenProps) {
  const router = useRouter();
  const supabase = createClient();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [factorId, setFactorId] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Fetch the enrolled TOTP factor id on mount
  useEffect(() => {
    const fetchFactor = async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const totp = data?.totp?.[0];
      if (totp) setFactorId(totp.id);
    };
    fetchFactor();
  }, [supabase]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const code = digits.join('');

  const focusInput = (index: number) => {
    inputRefs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');
    if (digit && index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else {
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight') {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    setError('');
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleVerify = useCallback(async () => {
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits of your authentication code.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      if (factorId) {
        // Supabase MFA TOTP challenge + verify
        const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
        if (challengeErr) throw challengeErr;

        const { error: verifyErr } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challengeData.id,
          code,
        });
        if (verifyErr) throw verifyErr;
      } else {
        // Fallback: treat as email OTP verification
        const { error: verifyErr } = await supabase.auth.verifyOtp({
          type: 'email',
          token: code,
          email: '', // email resolved server-side from active session
        });
        if (verifyErr) throw verifyErr;
      }

      // Force a session refresh so the elevated aal2 session is persisted
      // to cookies/localStorage before navigating away
      await supabase.auth.refreshSession();

      // Session confirmed and persisted — redirect to dashboard
      router.push('/');
    } catch {
      setError('Invalid or expired code. Please try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      focusInput(0);
    } finally {
      setIsLoading(false);
    }
  }, [code, factorId, router, supabase]);

  // Auto-submit when all digits filled
  useEffect(() => {
    if (code.length === OTP_LENGTH && !isLoading) {
      handleVerify();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    setError('');
    // For email OTP: trigger a new OTP send
    // For TOTP: no resend needed — user just reads their authenticator app
    if (!factorId) {
      // email OTP resend placeholder — wire to your email OTP trigger
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/sign-up-login-screen');
    }
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

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">

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
          <h1
            className="font-bold text-white text-center mb-1"
            style={{ fontSize: '30px', letterSpacing: '-0.02em' }}
          >
            SC-TPCRS
          </h1>
          <p className="text-center text-sm" style={{ color: '#94A3B8' }}>
            Supply Chain &amp; Third-Party Cybersecurity Risk System
          </p>
        </div>

        {/* MFA card */}
        <div
          className="w-full rounded-2xl p-9"
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1E293B',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}
        >
          {/* Card heading */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound size={18} style={{ color: '#60A5FA' }} />
              <h2 className="font-bold text-white text-xl">Two-Factor Verification</h2>
            </div>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {factorId
                ? 'Enter the 6-digit code from your authenticator app to complete sign-in.'
                : 'Enter the 6-digit one-time code sent to your registered contact.'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-7">
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#1E3A5F', color: '#60A5FA', border: '1px solid #2563EB' }}
              >
                ✓
              </div>
              <span className="text-xs" style={{ color: '#64748B' }}>Primary Auth</span>
            </div>
            <div className="flex-1 h-px" style={{ backgroundColor: '#1E293B' }} />
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#1D4ED8', color: '#fff', border: '1px solid #3B82F6' }}
              >
                2
              </div>
              <span className="text-xs font-semibold" style={{ color: '#60A5FA' }}>Second Factor</span>
            </div>
          </div>

          {/* OTP digit inputs */}
          <div
            className="flex gap-3 justify-center mb-6"
            role="group"
            aria-label="One-time password input"
            onPaste={handlePaste}
          >
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isLoading}
                className="w-12 h-14 text-center text-xl font-bold text-white rounded-lg outline-none transition-all duration-200 select-none"
                style={{
                  backgroundColor: '#0B1120',
                  border: digit
                    ? '1px solid #3B82F6' :'1px solid #1E293B',
                  boxShadow: digit ? '0 0 0 2px rgba(59,130,246,0.18)' : 'none',
                  caretColor: '#3B82F6',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.18)';
                }}
                onBlur={(e) => {
                  if (!digit) {
                    e.currentTarget.style.borderColor = '#1E293B';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs mb-4 text-center" style={{ color: '#F87171' }} role="alert">
              {error}
            </p>
          )}

          {/* Verify button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={isLoading || code.length < OTP_LENGTH}
            className="w-full rounded-lg py-3 font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 mb-4"
            style={{
              backgroundColor:
                isLoading || code.length < OTP_LENGTH ? '#1e3a6e' : '#2563EB',
              opacity: isLoading || code.length < OTP_LENGTH ? 0.65 : 1,
              cursor: isLoading || code.length < OTP_LENGTH ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isLoading && code.length === OTP_LENGTH)
                e.currentTarget.style.backgroundColor = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              if (!isLoading && code.length === OTP_LENGTH)
                e.currentTarget.style.backgroundColor = '#2563EB';
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying…
              </>
            ) : (
              'Verify & Continue'
            )}
          </button>

          {/* Resend / back row */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              style={{ color: '#64748B' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; }}
            >
              <ArrowLeft size={13} />
              Back to Login
            </button>

            {!factorId && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="flex items-center gap-1.5 text-xs transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                style={{
                  color: resendCooldown > 0 ? '#334155' : '#60A5FA',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!resendCooldown) e.currentTarget.style.color = '#93C5FD';
                }}
                onMouseLeave={(e) => {
                  if (!resendCooldown) e.currentTarget.style.color = '#60A5FA';
                }}
              >
                <RefreshCw size={13} className={resendCooldown > 0 ? '' : ''} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            )}
          </div>

          {/* Divider + compliance notice */}
          <div className="mt-7 pt-5" style={{ borderTop: '1px solid #1E293B' }}>
            <p className="text-xs text-center leading-relaxed" style={{ color: '#3B82F6' }}>
              This system is restricted to authorised users only. All access attempts are logged
              and monitored in accordance with the CBN Risk-Based Cybersecurity Framework.
            </p>
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
