'use client';

import { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon, ShieldCheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DemoUser {
  email: string;
  role: string;
  roleLabel: string;
  name: string;
  jobTitle: string;
  badgeColor: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    email: 'risk.officer1@sc-tpcrs.demo',
    role: 'risk_officer',
    roleLabel: 'Risk Officer',
    name: 'Amara Osei',
    jobTitle: 'Senior Risk Officer',
    badgeColor: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
  },
  {
    email: 'risk.officer2@sc-tpcrs.demo',
    role: 'risk_officer',
    roleLabel: 'Risk Officer',
    name: 'Kwame Asante',
    jobTitle: 'Risk Officer',
    badgeColor: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
  },
  {
    email: 'compliance1@sc-tpcrs.demo',
    role: 'compliance_manager',
    roleLabel: 'Compliance Manager',
    name: 'Ngozi Adeyemi',
    jobTitle: 'Head of Compliance',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
  },
  {
    email: 'compliance2@sc-tpcrs.demo',
    role: 'compliance_manager',
    roleLabel: 'Compliance Manager',
    name: 'Tunde Fashola',
    jobTitle: 'Compliance Manager',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
  },
  {
    email: 'ciso1@sc-tpcrs.demo',
    role: 'ciso',
    roleLabel: 'CISO',
    name: 'Chioma Eze',
    jobTitle: 'Chief Information Security Officer',
    badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
  },
  {
    email: 'ciso2@sc-tpcrs.demo',
    role: 'ciso',
    roleLabel: 'CISO',
    name: 'Babatunde Okafor',
    jobTitle: 'Deputy CISO',
    badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
  },
  {
    email: 'admin1@sc-tpcrs.demo',
    role: 'admin',
    roleLabel: 'Admin',
    name: 'Ifeoma Chukwu',
    jobTitle: 'Platform Administrator',
    badgeColor: 'bg-red-500/10 text-red-400 border border-red-500/30',
  },
  {
    email: 'admin2@sc-tpcrs.demo',
    role: 'admin',
    roleLabel: 'Admin',
    name: 'Emeka Obiora',
    jobTitle: 'System Administrator',
    badgeColor: 'bg-red-500/10 text-red-400 border border-red-500/30',
  },
];

const SHARED_PASSWORD = 'Demo1234!';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckIcon className="w-4 h-4 text-green-400" />
      ) : (
        <ClipboardDocumentIcon className="w-4 h-4" />
      )}
    </button>
  );
}

export default function DemoCredentialsPage() {
  const roleGroups = [
    { role: 'risk_officer', label: 'Risk Officer', users: DEMO_USERS.filter(u => u.role === 'risk_officer') },
    { role: 'compliance_manager', label: 'Compliance Manager', users: DEMO_USERS.filter(u => u.role === 'compliance_manager') },
    { role: 'ciso', label: 'CISO', users: DEMO_USERS.filter(u => u.role === 'ciso') },
    { role: 'admin', label: 'Admin', users: DEMO_USERS.filter(u => u.role === 'admin') },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Demo Credentials</h1>
        </div>
        <p className="text-gray-400 mb-8 ml-11">
          8 demo accounts across 4 roles. All share the same password.
        </p>

        {/* Shared password banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-300 uppercase tracking-wider font-semibold mb-1">Shared Password (all accounts)</p>
            <p className="text-white font-mono text-lg font-bold">{SHARED_PASSWORD}</p>
          </div>
          <CopyButton text={SHARED_PASSWORD} />
        </div>

        {/* MFA Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 flex gap-3">
          <InformationCircleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm mb-1">About MFA (Multi-Factor Authentication)</p>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              These demo accounts do <strong>not</strong> have MFA pre-enrolled. MFA codes (TOTP) are time-based
              one-time passwords generated by an authenticator app — they cannot be pre-generated or stored.
              To use MFA with any of these accounts, log in first, then enroll an authenticator app (Google Authenticator,
              Authy, etc.) from your profile settings. If MFA is enforced on your Supabase project, you will be
              prompted to enroll on first login.
            </p>
          </div>
        </div>

        {/* User cards grouped by role */}
        <div className="space-y-8">
          {roleGroups.map(group => (
            <div key={group.role}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
                {group.label} <span className="text-gray-600 ml-1">({group.users.length} accounts)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.users.map(user => (
                  <div
                    key={user.email}
                    className="bg-[#111827] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{user.jobTitle}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.badgeColor}`}>
                        {user.roleLabel}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Email</p>
                          <p className="text-sm text-gray-200 font-mono">{user.email}</p>
                        </div>
                        <CopyButton text={user.email} />
                      </div>
                      <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Password</p>
                          <p className="text-sm text-gray-200 font-mono">{SHARED_PASSWORD}</p>
                        </div>
                        <CopyButton text={SHARED_PASSWORD} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Login link */}
        <div className="mt-10 text-center">
          <Link
            href="/sign-up-login-screen"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
