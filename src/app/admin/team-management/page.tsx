'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { AdminOnly } from '@/components/rbac/PermissionGate';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_DEFINITIONS, ALL_ROLES, AppRole, PERMISSION_MATRIX,  } from '@/lib/rbac/permissions';
import { Users, Search, Edit2, Trash2, Shield, X, Check, UserPlus, Building2, Mail, Crown, AlertTriangle, Filter, MoreVertical, Eye, EyeOff, RefreshCw, Lock,  } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type TeamType = 'security' | 'risk' | 'compliance' | 'operations' | 'executive';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: AppRole;
  department: string;
  job_title: string;
  is_active: boolean;
  joined_at: string;
  last_active: string;
  teams: string[];
}

interface Team {
  id: string;
  name: string;
  type: TeamType;
  description: string;
  member_count: number;
  lead: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TEAMS: Team[] = [
  { id: 'team-1', name: 'Security Operations', type: 'security', description: 'Handles incident response and threat monitoring', member_count: 4, lead: 'Adaeze Okonkwo' },
  { id: 'team-2', name: 'Risk Management', type: 'risk', description: 'Manages vendor risk assessments and scoring', member_count: 3, lead: 'Chidi Eze' },
  { id: 'team-3', name: 'Compliance & Audit', type: 'compliance', description: 'Oversees regulatory compliance frameworks', member_count: 3, lead: 'Fatima Al-Rashid' },
  { id: 'team-4', name: 'Platform Operations', type: 'operations', description: 'Manages platform configuration and integrations', member_count: 2, lead: 'Kwame Asante' },
  { id: 'team-5', name: 'Executive Leadership', type: 'executive', description: 'C-suite and senior leadership access', member_count: 2, lead: 'Ngozi Adeyemi' },
];

const MOCK_MEMBERS: TeamMember[] = [
  { id: 'u1', full_name: 'Adaeze Okonkwo', email: 'admin@sctpcrs.io', role: 'admin', department: 'Security', job_title: 'Platform Administrator', is_active: true, joined_at: '2024-01-15', last_active: '2026-07-17', teams: ['team-1', 'team-5'] },
  { id: 'u2', full_name: 'Chidi Eze', email: 'riskofficer@sctpcrs.io', role: 'risk_officer', department: 'Risk Management', job_title: 'Chief Risk Officer', is_active: true, joined_at: '2024-02-01', last_active: '2026-07-16', teams: ['team-2'] },
  { id: 'u3', full_name: 'Fatima Al-Rashid', email: 'analyst@sctpcrs.io', role: 'analyst', department: 'Compliance', job_title: 'Senior Risk Analyst', is_active: true, joined_at: '2024-03-10', last_active: '2026-07-15', teams: ['team-3'] },
  { id: 'u4', full_name: 'Kwame Asante', email: 'viewer@sctpcrs.io', role: 'viewer', department: 'Operations', job_title: 'Operations Analyst', is_active: true, joined_at: '2024-04-05', last_active: '2026-07-14', teams: ['team-4'] },
  { id: 'u5', full_name: 'Ngozi Adeyemi', email: 'ngozi@sctpcrs.io', role: 'risk_officer', department: 'Executive', job_title: 'VP of Risk', is_active: true, joined_at: '2024-01-20', last_active: '2026-07-12', teams: ['team-5', 'team-2'] },
  { id: 'u6', full_name: 'Emeka Nwosu', email: 'emeka@sctpcrs.io', role: 'analyst', department: 'Security', job_title: 'Security Analyst', is_active: false, joined_at: '2024-05-01', last_active: '2026-06-30', teams: ['team-1'] },
  { id: 'u7', full_name: 'Amara Diallo', email: 'amara@sctpcrs.io', role: 'analyst', department: 'Compliance', job_title: 'Compliance Analyst', is_active: true, joined_at: '2024-06-15', last_active: '2026-07-10', teams: ['team-3'] },
];

const TEAM_TYPE_META: Record<TeamType, { label: string; color: string; bg: string }> = {
  security:   { label: 'Security',   color: 'text-status-critical', bg: 'bg-status-critical/10 border-status-critical/30' },
  risk:       { label: 'Risk',       color: 'text-status-high',     bg: 'bg-status-high/10 border-status-high/30' },
  compliance: { label: 'Compliance', color: 'text-status-medium',   bg: 'bg-status-medium/10 border-status-medium/30' },
  operations: { label: 'Operations', color: 'text-primary',         bg: 'bg-primary/10 border-primary/30' },
  executive:  { label: 'Executive',  color: 'text-status-low',      bg: 'bg-status-low/10 border-status-low/30' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MemberModalProps {
  member: Partial<TeamMember> | null;
  teams: Team[];
  onSave: (m: TeamMember) => void;
  onClose: () => void;
  isNew: boolean;
}

function MemberModal({ member, teams, onSave, onClose, isNew }: MemberModalProps) {
  const [form, setForm] = useState<Partial<TeamMember>>(
    member ?? { full_name: '', email: '', role: 'viewer', department: '', job_title: '', is_active: true, teams: [] }
  );

  const set = (k: keyof TeamMember, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleTeam = (tid: string) => {
    const current = form.teams ?? [];
    set('teams', current.includes(tid) ? current.filter((t) => t !== tid) : [...current, tid]);
  };

  const handleSave = () => {
    if (!form.full_name || !form.email || !form.role) return;
    onSave({
      id: form.id ?? `u${Date.now()}`,
      full_name: form.full_name!,
      email: form.email!,
      role: form.role as AppRole,
      department: form.department ?? '',
      job_title: form.job_title ?? '',
      is_active: form.is_active ?? true,
      joined_at: form.joined_at ?? new Date().toISOString().split('T')[0],
      last_active: form.last_active ?? new Date().toISOString().split('T')[0],
      teams: form.teams ?? [],
    });
  };

  const permCount = PERMISSION_MATRIX[form.role as AppRole]
    ? Object.values(PERMISSION_MATRIX[form.role as AppRole]).reduce((a, b) => a + b.length, 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {isNew ? 'Add Team Member' : 'Edit Member'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
              <input
                value={form.full_name ?? ''}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="Jane Smith"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
              <input
                value={form.email ?? ''}
                onChange={(e) => set('email', e.target.value)}
                placeholder="jane@company.io"
                type="email"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Job Title + Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Job Title</label>
              <input
                value={form.job_title ?? ''}
                onChange={(e) => set('job_title', e.target.value)}
                placeholder="Risk Analyst"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
              <input
                value={form.department ?? ''}
                onChange={(e) => set('department', e.target.value)}
                placeholder="Security"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Platform Role *</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_ROLES.map((r) => {
                const def = ROLE_DEFINITIONS[r];
                const selected = form.role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set('role', r)}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all duration-150 ${
                      selected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-border/80 hover:bg-muted/30'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0`} style={{ backgroundColor: def.color }} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">{def.label}</p>
                      <p className="text-2xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{def.description}</p>
                    </div>
                    {selected && <Check size={12} className="text-primary flex-shrink-0 mt-0.5 ml-auto" />}
                  </button>
                );
              })}
            </div>
            {form.role && (
              <p className="text-2xs text-muted-foreground mt-2 flex items-center gap-1">
                <Lock size={10} />
                This role grants <span className="text-foreground font-semibold">{permCount}</span> permissions across all resources
              </p>
            )}
          </div>

          {/* Team membership */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Team Membership</label>
            <div className="space-y-1.5">
              {teams.map((team) => {
                const meta = TEAM_TYPE_META[team.type];
                const isMember = (form.teams ?? []).includes(team.id);
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => toggleTeam(team.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all duration-150 ${
                      isMember ? 'border-primary/40 bg-primary/5' : 'border-border bg-background hover:bg-muted/30'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isMember ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{team.name}</p>
                      <p className="text-2xs text-muted-foreground">{team.description}</p>
                    </div>
                    <span className={`text-2xs font-medium px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                    {isMember && <Check size={12} className="text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
            <div>
              <p className="text-xs font-medium text-foreground">Account Status</p>
              <p className="text-2xs text-muted-foreground mt-0.5">Inactive members cannot sign in</p>
            </div>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${form.is_active ? 'bg-status-low' : 'bg-muted-foreground/30'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.full_name || !form.email}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check size={14} />
            {isNew ? 'Add Member' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamManagementPage() {
  const { role: currentRole } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS);
  const [teams] = useState<Team[]>(MOCK_TEAMS);
  const [activeTab, setActiveTab] = useState<'members' | 'teams'>('members');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<AppRole | 'all'>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        !search ||
        m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.job_title.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === 'all' || m.role === filterRole;
      const matchTeam = filterTeam === 'all' || m.teams.includes(filterTeam);
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && m.is_active) ||
        (filterStatus === 'inactive' && !m.is_active);
      return matchSearch && matchRole && matchTeam && matchStatus;
    });
  }, [members, search, filterRole, filterTeam, filterStatus]);

  const handleSaveMember = (m: TeamMember) => {
    setMembers((prev) => {
      const idx = prev.findIndex((p) => p.id === m.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = m;
        return next;
      }
      return [...prev, m];
    });
    setModalOpen(false);
    setEditingMember(null);
  };

  const handleDelete = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleActive = (id: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, is_active: !m.is_active } : m)));
    setOpenMenu(null);
  };

  const openAdd = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditingMember(m);
    setModalOpen(true);
    setOpenMenu(null);
  };

  const activeCount = members.filter((m) => m.is_active).length;
  const adminCount = members.filter((m) => m.role === 'admin').length;

  return (
    <AppLayout>
      <AdminOnly
        fallback={
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Shield size={40} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Admin access required to manage team members.</p>
          </div>
        }
      >
        <div className="space-y-5 fade-in">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                <Users size={22} className="text-primary" />
                Team Management
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create, edit, and manage team members — assign roles, permissions, and access scope
              </p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <UserPlus size={15} />
              Add Member
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Members', value: members.length, icon: <Users size={16} />, sub: `${activeCount} active` },
              { label: 'Teams', value: teams.length, icon: <Building2 size={16} />, sub: 'across departments' },
              { label: 'Admins', value: adminCount, icon: <Crown size={16} />, sub: 'full access' },
              { label: 'Inactive', value: members.length - activeCount, icon: <EyeOff size={16} />, sub: 'suspended accounts' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">{stat.icon}</span>
                  <span className="text-2xl font-bold text-foreground font-mono-data">{stat.value}</span>
                </div>
                <p className="text-xs font-medium text-foreground">{stat.label}</p>
                <p className="text-2xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {(['members', 'teams'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-150 -mb-px capitalize ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'members' ? `Members (${filteredMembers.length})` : `Teams (${teams.length})`}
              </button>
            ))}
          </div>

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              {/* Search + Filter bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, or title…"
                    className="w-full bg-card border border-border rounded-md pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                    showFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Filter size={14} />
                  Filters
                  {(filterRole !== 'all' || filterTeam !== 'all' || filterStatus !== 'all') && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              </div>

              {/* Filter dropdowns */}
              {showFilters && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/20 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">Role:</span>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value as AppRole | 'all')}
                      className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="all">All Roles</option>
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_DEFINITIONS[r].label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">Team:</span>
                    <select
                      value={filterTeam}
                      onChange={(e) => setFilterTeam(e.target.value)}
                      className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="all">All Teams</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">Status:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                      className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <button
                    onClick={() => { setFilterRole('all'); setFilterTeam('all'); setFilterStatus('all'); }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw size={10} /> Reset
                  </button>
                </div>
              )}

              {/* Members table */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-4 py-2.5 border-b border-border bg-muted/30 text-2xs font-mono-data font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Member</span>
                  <span>Teams</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span className="w-8" />
                </div>

                {filteredMembers.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users size={28} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No members match your filters.</p>
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const roleDef = ROLE_DEFINITIONS[member.role];
                    const memberTeams = teams.filter((t) => member.teams.includes(t.id));
                    return (
                      <div
                        key={member.id}
                        className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-border last:border-0 items-center hover:bg-muted/10 transition-colors"
                      >
                        {/* Member info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {member.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{member.full_name}</p>
                            <p className="text-2xs text-muted-foreground truncate flex items-center gap-1">
                              <Mail size={9} />
                              {member.email}
                            </p>
                            {member.job_title && (
                              <p className="text-2xs text-muted-foreground/70 truncate">{member.job_title}</p>
                            )}
                          </div>
                        </div>

                        {/* Teams */}
                        <div className="flex flex-wrap gap-1">
                          {memberTeams.length === 0 ? (
                            <span className="text-2xs text-muted-foreground/50 italic">No teams</span>
                          ) : (
                            memberTeams.slice(0, 2).map((t) => {
                              const meta = TEAM_TYPE_META[t.type];
                              return (
                                <span key={t.id} className={`text-2xs font-medium px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color}`}>
                                  {t.name.split(' ')[0]}
                                </span>
                              );
                            })
                          )}
                          {memberTeams.length > 2 && (
                            <span className="text-2xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted border border-border">
                              +{memberTeams.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Role badge */}
                        <div>
                          <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${roleDef.badgeClass}`}>
                            {roleDef.label}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${member.is_active ? 'bg-status-low' : 'bg-muted-foreground/40'}`} />
                          <span className={`text-xs ${member.is_active ? 'text-status-low' : 'text-muted-foreground'}`}>
                            {member.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {openMenu === member.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                              <button
                                onClick={() => openEdit(member)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                              >
                                <Edit2 size={12} className="text-muted-foreground" /> Edit Member
                              </button>
                              <button
                                onClick={() => handleToggleActive(member.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                              >
                                {member.is_active
                                  ? <><EyeOff size={12} className="text-muted-foreground" /> Deactivate</>
                                  : <><Eye size={12} className="text-muted-foreground" /> Activate</>
                                }
                              </button>
                              <div className="h-px bg-border mx-2" />
                              <button
                                onClick={() => { setDeleteConfirm(member.id); setOpenMenu(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-status-critical hover:bg-status-critical/5 transition-colors"
                              >
                                <Trash2 size={12} /> Remove Member
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teams.map((team) => {
                const meta = TEAM_TYPE_META[team.type];
                const teamMembers = members.filter((m) => m.teams.includes(team.id));
                const roleBreakdown = ALL_ROLES.map((r) => ({
                  role: r,
                  count: teamMembers.filter((m) => m.role === r).length,
                })).filter((rb) => rb.count > 0);

                return (
                  <div key={team.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                    {/* Team header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-md border flex items-center justify-center ${meta.bg}`}>
                          <Building2 size={16} className={meta.color} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{team.name}</p>
                          <span className={`text-2xs font-medium px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground font-mono-data">{teamMembers.length}</p>
                        <p className="text-2xs text-muted-foreground">members</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">{team.description}</p>

                    {/* Role breakdown */}
                    {roleBreakdown.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {roleBreakdown.map(({ role, count }) => (
                          <span key={role} className={`flex items-center gap-1 text-2xs font-medium px-2 py-0.5 rounded-full ${ROLE_DEFINITIONS[role].badgeClass}`}>
                            {ROLE_DEFINITIONS[role].label}
                            <span className="font-mono-data">×{count}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Member avatars */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                      <div className="flex -space-x-1.5">
                        {teamMembers.slice(0, 5).map((m) => (
                          <div
                            key={m.id}
                            title={m.full_name}
                            className="w-6 h-6 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center text-2xs font-bold text-primary"
                          >
                            {m.full_name.charAt(0)}
                          </div>
                        ))}
                        {teamMembers.length > 5 && (
                          <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-2xs text-muted-foreground font-mono-data">
                            +{teamMembers.length - 5}
                          </div>
                        )}
                      </div>
                      <span className="text-2xs text-muted-foreground ml-1">Lead: {team.lead}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-status-critical/10 border border-status-critical/30 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-status-critical" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Remove Member</p>
                  <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Removing this member will revoke all their access and team memberships immediately.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex items-center gap-2 px-4 py-2 bg-status-critical text-white rounded-md text-sm font-medium hover:bg-status-critical/90 transition-colors"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Member modal */}
        {modalOpen && (
          <MemberModal
            member={editingMember}
            teams={teams}
            onSave={handleSaveMember}
            onClose={() => { setModalOpen(false); setEditingMember(null); }}
            isNew={!editingMember}
          />
        )}

        {/* Close menus on outside click */}
        {openMenu && (
          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
        )}
      </AdminOnly>
    </AppLayout>
  );
}
