'use client';

import React, { useState } from 'react';
import { ShieldAlert, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setError('');
    setIsLoading(true);

    // Keycloak OIDC Authorization Code + PKCE redirect placeholder
    // In production: redirect to Keycloak /auth endpoint with PKCE challenge
    await new Promise((r) => setTimeout(r, 1200));

    // Generic error — never reveal whether username or password was wrong
    setError('Authentication failed. Please check your credentials and try again.');
    setIsLoading(false);
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

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">

        {/* Header block */}
        <div className="flex flex-col items-center mb-8">
          {/* Shield icon badge */}
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
          <p
            className="text-center text-sm"
            style={{ color: '#94A3B8' }}
          >
            Supply Chain &amp; Third-Party Cybersecurity Risk System
          </p>
        </div>

        {/* Login card */}
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
            <h2 className="font-bold text-white text-xl mb-1">Administrator Login</h2>
            <p className="text-sm" style={{ color: '#60A5FA' }}>
              Restricted access — authorised personnel only
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Username field */}
            <div className="mb-5">
              <label
                htmlFor="username"
                className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                style={{ color: '#60A5FA' }}
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                  <User size={17} />
                </span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  aria-label="Username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  className="w-full rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#0B1120',
                    border: '1px solid #1E293B',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3B82F6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#1E293B';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                style={{ color: '#60A5FA' }}
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748B' }}>
                  <Lock size={17} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-label="Password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full rounded-lg pl-10 pr-11 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#0B1120',
                    border: '1px solid #1E293B',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3B82F6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#1E293B';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  style={{ color: '#64748B' }}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-xs mb-4 text-center" style={{ color: '#F87171' }} role="alert">
                {error}
              </p>
            )}

            {/* Sign In button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg py-3 font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              style={{
                backgroundColor: isLoading ? '#1e3a6e' : '#2563EB',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#1D4ED8'; }}
              onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#2563EB'; }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating…
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* MFA placeholder slot — second-factor step slots in here after primary auth */}
            {/* <MfaStep /> */}

            {/* Divider */}
            <div className="mt-7 pt-5" style={{ borderTop: '1px solid #1E293B' }}>
              <p className="text-xs text-center leading-relaxed" style={{ color: '#3B82F6' }}>
                This system is restricted to authorised users only. All access attempts are logged
                and monitored in accordance with the CBN Risk-Based Cybersecurity Framework.
              </p>
            </div>
          </form>
        </div>

        {/* Footer outside card */}
        <p className="mt-6 text-xs text-center" style={{ color: '#334155' }}>
          SC-TPCRS v2.0 · Nigerian Fintech Ecosystem · Confidential
        </p>
      </div>
    </div>
  );
}