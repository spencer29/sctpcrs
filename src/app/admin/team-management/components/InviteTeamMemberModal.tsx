'use client';

import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield, Copy, Check, Loader2, Link2, AlertTriangle,  } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AppRole } from '@/lib/rbac/permissions';

// ─── Role options for invite (maps to app_role enum) ─────────────────────────

interface InviteRoleOption {
  role: AppRole;
  label: string;
  displayLabel: string;
  description: string;
  color: string;
  badgeClass: string;
}

const INVITE_ROLES: InviteRoleOption[] = [
  {
    role: 'risk_officer',
    label: 'Risk Officer',
    displayLabel: 'Risk Officer',
    description: 'Broad access to risk resources — can escalate, approve, and manage incidents',
    color: '#f97316',
    badgeClass: 'bg-status-high/10 text-status-high border border-status-high/30',
  },
  {
    role: 'analyst',
    label: 'Auditor',
    displayLabel: 'Auditor',
    description: 'Create and edit core resources — can escalate incidents and run compliance audits',
    color: '#eab308',
    badgeClass: 'bg-status-medium/10 text-status-medium border border-status-medium/30',
  },
  {
    role: 'viewer',
    label: 'Vendor Manager',
    displayLabel: 'Vendor Manager',
    description: 'Read-only access to vendor data, assessments, and supply chain resources',
    color: '#22c55e',
    badgeClass: 'bg-status-low/10 text-status-low border border-status-low/30',
  },
  {
    role: 'admin',
    label: 'Admin',
    displayLabel: 'Administrator',
    description: 'Full platform access — manage users, roles, teams, and all resources',
    color: '#ef4444',
    badgeClass: 'bg-status-critical/10 text-status-critical border border-status-critical/30',
  },
];

// ─── Utility: generate a secure random token ─────────────────────────────────

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InviteTeamMemberModalProps {
  onClose: () => void;
  onInviteSent?: (email: string, role: AppRole) => void;
  currentUserId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InviteTeamMemberModal({
  onClose,
  onInviteSent,
  currentUserId,
}: InviteTeamMemberModalProps) {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('risk_officer');
  const [step, setStep] = useState<'form' | 'link'>('form');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const selectedRoleOption = INVITE_ROLES.find((r) => r.role === selectedRole)!;

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleGenerateInvite = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const token = generateToken();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');
      const link = `${siteUrl}/invite/accept?token=${token}`;

      const { error: dbError } = await supabase.from('team_invitations').insert({
        email: email.trim().toLowerCase(),
        role: selectedRole,
        invited_by: currentUserId,
        token,
        status: 'pending',
      });

      if (dbError) {
        if (dbError.code === '23505') {
          setError('An active invitation already exists for this email address.');
        } else {
          setError('Failed to create invitation. Please try again.');
        }
        setLoading(false);
        return;
      }

      setInviteLink(link);
      setStep('link');
      onInviteSent?.(email.trim().toLowerCase(), selectedRole);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea');
      el.value = inviteLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {step === 'form' ? 'Invite Team Member' : 'Invite Link Generated'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {step === 'form' ? (
            <>
              {/* Email input */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Recipient Email *
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="colleague@company.io"
                    className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Assign Role *
                </label>
                <div className="space-y-2">
                  {INVITE_ROLES.map((opt) => {
                    const isSelected = selectedRole === opt.role;
                    return (
                      <button
                        key={opt.role}
                        type="button"
                        onClick={() => setSelectedRole(opt.role)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-150 ${
                          isSelected
                            ? 'border-primary bg-primary/5' :'border-border bg-background hover:border-border/80 hover:bg-muted/30'
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: opt.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-foreground">{opt.displayLabel}</p>
                            <span className={`text-2xs font-medium px-1.5 py-0.5 rounded-full ${opt.badgeClass}`}>
                              {opt.label}
                            </span>
                          </div>
                          <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                        {isSelected && <Check size={13} className="text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info banner */}
              <div className="flex items-start gap-2.5 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Link2 size={13} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  An invite link will be generated with the{' '}
                  <span className="text-foreground font-medium">{selectedRoleOption.displayLabel}</span> role
                  pre-filled. The link expires in <span className="text-foreground font-medium">7 days</span>.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-status-critical/5 border border-status-critical/20 rounded-lg">
                  <AlertTriangle size={13} className="text-status-critical flex-shrink-0" />
                  <p className="text-xs text-status-critical">{error}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="flex flex-col items-center text-center py-2 gap-3">
                <div className="w-12 h-12 rounded-full bg-status-low/10 border border-status-low/30 flex items-center justify-center">
                  <Check size={22} className="text-status-low" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Invite Created</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this link with{' '}
                    <span className="text-foreground font-medium">{email}</span> to onboard them as{' '}
                    <span className={`font-semibold ${selectedRoleOption.badgeClass.split(' ')[1]}`}>
                      {selectedRoleOption.displayLabel}
                    </span>
                  </p>
                </div>
              </div>

              {/* Invite link box */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground block">Invite Link</label>
                <div className="flex items-center gap-2 p-3 bg-background border border-border rounded-lg">
                  <Link2 size={13} className="text-muted-foreground flex-shrink-0" />
                  <p className="text-xs text-foreground font-mono flex-1 truncate">{inviteLink}</p>
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex-shrink-0 ${
                      copied
                        ? 'bg-status-low/10 text-status-low border border-status-low/30' :'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {copied ? (
                      <><Check size={11} /> Copied</>
                    ) : (
                      <><Copy size={11} /> Copy</>
                    )}
                  </button>
                </div>
              </div>

              {/* Role summary */}
              <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-lg">
                <Shield size={14} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Role pre-filled:{' '}
                    <span className={`font-semibold ${selectedRoleOption.badgeClass.split(' ')[1]}`}>
                      {selectedRoleOption.displayLabel}
                    </span>
                  </p>
                  <p className="text-2xs text-muted-foreground/70 mt-0.5">
                    Expires in 7 days · Link is single-use
                  </p>
                </div>
              </div>

              {/* Invite another */}
              <button
                onClick={() => {
                  setStep('form');
                  setEmail('');
                  setInviteLink('');
                  setCopied(false);
                  setError('');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <UserPlus size={14} />
                Invite Another Member
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/20">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateInvite}
              disabled={loading || !email.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Generating…</>
              ) : (
                <><Link2 size={14} /> Generate Invite Link</>
              )}
            </button>
          </div>
        )}

        {step === 'link' && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/20">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
