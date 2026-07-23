'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { AdminOnly } from '@/components/rbac/PermissionGate';
import {
  ROLE_DEFINITIONS,
  ALL_ROLES,
  AppRole,
  PERMISSION_MATRIX,
  ResourceType,
  PermissionAction,
} from '@/lib/rbac/permissions';
import {
  Shield,
  Users,
  Lock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  Plus,
  Edit,
  Trash2,
  Upload,
  Zap,
  ThumbsUp,
  Building2,
  AlertTriangle,
  Bell,
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  FileText,
  GitBranch,
  Activity,
  Settings,
  Crown,
} from 'lucide-react';

const RESOURCE_META: Record<ResourceType, { label: string; icon: React.ReactNode }> = {
  vendors:      { label: 'Vendors',       icon: <Building2 size={14} /> },
  incidents:    { label: 'Incidents',     icon: <AlertTriangle size={14} /> },
  alerts:       { label: 'Alerts',        icon: <Bell size={14} /> },
  dashboards:   { label: 'Dashboards',    icon: <LayoutDashboard size={14} /> },
  compliance:   { label: 'Compliance',    icon: <ShieldCheck size={14} /> },
  assessments:  { label: 'Assessments',   icon: <ClipboardList size={14} /> },
  reports:      { label: 'Reports',       icon: <FileText size={14} /> },
  supply_chain: { label: 'Supply Chain',  icon: <GitBranch size={14} /> },
  monitoring:   { label: 'Monitoring',    icon: <Activity size={14} /> },
  admin:        { label: 'Admin Panel',   icon: <Settings size={14} /> },
};

const ACTION_META: Record<PermissionAction, { label: string; icon: React.ReactNode }> = {
  view:     { label: 'View',     icon: <Eye size={12} /> },
  create:   { label: 'Create',   icon: <Plus size={12} /> },
  edit:     { label: 'Edit',     icon: <Edit size={12} /> },
  delete:   { label: 'Delete',   icon: <Trash2 size={12} /> },
  export:   { label: 'Export',   icon: <Upload size={12} /> },
  escalate: { label: 'Escalate', icon: <Zap size={12} /> },
  approve:  { label: 'Approve',  icon: <ThumbsUp size={12} /> },
};

const ALL_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'export', 'escalate', 'approve'];
const ALL_RESOURCES: ResourceType[] = ['vendors', 'incidents', 'alerts', 'dashboards', 'compliance', 'assessments', 'reports', 'supply_chain', 'monitoring', 'admin'];

export default function RolesPermissionsPage() {
  const { role: currentRole, profile, teams } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AppRole>('admin');
  const [expandedResource, setExpandedResource] = useState<ResourceType | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'teams' | 'my-access'>('matrix');

  const toggleResource = (r: ResourceType) =>
    setExpandedResource((prev) => (prev === r ? null : r));

  return (
    <AppLayout>
      <div className="space-y-5 fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Shield size={22} className="text-primary" />
              Roles &amp; Permissions
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Fine-grained access control for vendors, incidents, alerts, and dashboards
            </p>
          </div>
          {currentRole && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold ${ROLE_DEFINITIONS[currentRole].badgeClass}`}>
              <Crown size={12} />
              Your role: {ROLE_DEFINITIONS[currentRole].label}
            </div>
          )}
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ALL_ROLES.map((r) => {
            const def = ROLE_DEFINITIONS[r];
            const totalPerms = Object.values(PERMISSION_MATRIX[r]).reduce((acc, acts) => acc + acts.length, 0);
            return (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`text-left p-4 rounded-lg border transition-all duration-150 ${
                  selectedRole === r
                    ? 'border-primary bg-primary/5' :'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${def.badgeClass}`}>
                    {def.label}
                  </span>
                  {r === currentRole && (
                    <span className="text-2xs text-primary font-mono-data">YOU</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{def.description}</p>
                <div className="mt-3 pt-2 border-t border-border">
                  <span className="text-xs font-mono-data text-foreground font-semibold">{totalPerms}</span>
                  <span className="text-2xs text-muted-foreground ml-1">permissions</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {(['matrix', 'teams', 'my-access'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-150 -mb-px ${
                activeTab === tab
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'matrix' && 'Permission Matrix'}
              {tab === 'teams' && 'Team Memberships'}
              {tab === 'my-access' && 'My Access'}
            </button>
          ))}
        </div>

        {/* Permission Matrix Tab */}
        {activeTab === 'matrix' && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Lock size={14} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {ROLE_DEFINITIONS[selectedRole].label} — Permission Matrix
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                Click a resource to expand
              </span>
            </div>

            {/* Header row */}
            <div className="grid grid-cols-[200px_repeat(7,1fr)] text-2xs font-mono-data font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
              <div className="px-4 py-2">Resource</div>
              {ALL_ACTIONS.map((a) => (
                <div key={a} className="px-2 py-2 text-center flex flex-col items-center gap-0.5">
                  {ACTION_META[a].icon}
                  <span>{ACTION_META[a].label}</span>
                </div>
              ))}
            </div>

            {ALL_RESOURCES.map((resource) => {
              const allowed = PERMISSION_MATRIX[selectedRole][resource] ?? [];
              const isExpanded = expandedResource === resource;
              const meta = RESOURCE_META[resource];
              const grantedCount = allowed.length;

              return (
                <div key={resource} className="border-b border-border last:border-0">
                  <button
                    onClick={() => toggleResource(resource)}
                    className="w-full grid grid-cols-[200px_repeat(7,1fr)] items-center hover:bg-muted/20 transition-colors duration-100"
                  >
                    <div className="px-4 py-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <span className="text-muted-foreground">{meta.icon}</span>
                      {meta.label}
                      <span className="ml-auto text-2xs text-muted-foreground font-mono-data">
                        {grantedCount}/{ALL_ACTIONS.length}
                      </span>
                      {isExpanded ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
                    </div>
                    {ALL_ACTIONS.map((action) => {
                      const granted = allowed.includes(action);
                      return (
                        <div key={action} className="flex justify-center py-3">
                          {granted ? (
                            <CheckCircle size={16} className="text-status-low" />
                          ) : (
                            <XCircle size={16} className="text-muted-foreground/30" />
                          )}
                        </div>
                      );
                    })}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 bg-muted/10">
                      <div className="flex flex-wrap gap-2 pt-2">
                        {ALL_ACTIONS.map((action) => {
                          const granted = allowed.includes(action);
                          return (
                            <span
                              key={action}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-2xs font-medium border ${
                                granted
                                  ? 'bg-status-low/10 text-status-low border-status-low/30' :'bg-muted/50 text-muted-foreground/50 border-border/50'
                              }`}
                            >
                              {ACTION_META[action].icon}
                              {ACTION_META[action].label}
                            </span>
                          );
                        })}
                      </div>
                      <p className="text-2xs text-muted-foreground mt-2">
                        {ROLE_DEFINITIONS[selectedRole].label} has{' '}
                        <span className="text-foreground font-semibold">{grantedCount}</span> of{' '}
                        {ALL_ACTIONS.length} actions on {RESOURCE_META[resource].label}.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-3">
            {teams.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Users size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {profile ? 'You are not a member of any team yet.' : 'Sign in to view your team memberships.'}
                </p>
              </div>
            ) : (
              teams.map((team) => (
                <div key={team.team_id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Users size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{team.team_name}</p>
                      <p className="text-2xs text-muted-foreground capitalize">{team.team_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {team.role_override && (
                      <span className="text-2xs text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
                        Override active
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_DEFINITIONS[team.effective_role].badgeClass}`}>
                      {ROLE_DEFINITIONS[team.effective_role].label}
                    </span>
                  </div>
                </div>
              ))
            )}

            <AdminOnly>
              <div className="bg-card border border-dashed border-border rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  As an Admin, you can manage team memberships and role overrides from the{' '}
                  <span className="text-primary font-medium">User Management</span> panel.
                </p>
              </div>
            </AdminOnly>
          </div>
        )}

        {/* My Access Tab */}
        {activeTab === 'my-access' && (
          <div className="space-y-3">
            {!profile ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Shield size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Sign in to view your access summary.</p>
              </div>
            ) : (
              <>
                <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {profile.full_name?.charAt(0) ?? profile.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{profile.full_name || profile.email}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                    {profile.job_title && (
                      <p className="text-2xs text-muted-foreground">{profile.job_title} · {profile.department}</p>
                    )}
                  </div>
                  {currentRole && (
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${ROLE_DEFINITIONS[currentRole].badgeClass}`}>
                      {ROLE_DEFINITIONS[currentRole].label}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ALL_RESOURCES.map((resource) => {
                    if (!currentRole) return null;
                    const allowed = PERMISSION_MATRIX[currentRole][resource] ?? [];
                    if (allowed.length === 0) return null;
                    const meta = RESOURCE_META[resource];
                    return (
                      <div key={resource} className="bg-card border border-border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-muted-foreground">{meta.icon}</span>
                          <span className="text-sm font-medium text-foreground">{meta.label}</span>
                          <span className="ml-auto text-2xs font-mono-data text-muted-foreground">{allowed.length} actions</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {allowed.map((action) => (
                            <span
                              key={action}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium bg-status-low/10 text-status-low border border-status-low/20"
                            >
                              {ACTION_META[action].icon}
                              {ACTION_META[action].label}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
