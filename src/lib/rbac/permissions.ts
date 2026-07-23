// SC-TPCRS Role-Based Access Control
// Roles: Admin, Risk Officer, Compliance Manager, CISO, Analyst, Viewer

export type AppRole = 'admin' | 'risk_officer' | 'compliance_manager' | 'ciso' | 'analyst' | 'viewer';
export type ResourceType =
  | 'vendors'
  | 'incidents' |'alerts' |'dashboards' |'compliance' |'assessments' |'reports' |'supply_chain' |'monitoring' |'admin';
export type PermissionAction =
  | 'view' |'create' |'edit' |'delete' |'export' |'escalate' |'approve'
  // Granular vendor actions
  | 'assess_vendor'    // Trigger / initiate a vendor risk assessment
  | 'suspend_vendor'   // Suspend / place a vendor under review
  // Granular compliance actions
  | 'modify_compliance' // Edit framework scores, remediation items, audit schedules
  | 'close_remediation' // Mark a remediation item as resolved
  | 'schedule_audit';   // Create or reschedule audit entries

export interface RoleDefinition {
  id: AppRole;
  label: string;
  description: string;
  color: string;
  badgeClass: string;
  level: number; // higher = more privileged
}

export const ROLE_DEFINITIONS: Record<AppRole, RoleDefinition> = {
  admin: {
    id: 'admin',
    label: 'Admin',
    description: 'Full platform access — manage users, roles, teams, and all resources',
    color: '#ef4444',
    badgeClass: 'bg-status-critical/10 text-status-critical border border-status-critical/30',
    level: 6,
  },
  ciso: {
    id: 'ciso',
    label: 'CISO',
    description: 'Chief Information Security Officer — near-admin strategic oversight across all security domains',
    color: '#8b5cf6',
    badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    level: 5,
  },
  risk_officer: {
    id: 'risk_officer',
    label: 'Risk Officer',
    description: 'Broad access to risk resources — can escalate, approve, and manage incidents',
    color: '#f97316',
    badgeClass: 'bg-status-high/10 text-status-high border border-status-high/30',
    level: 4,
  },
  compliance_manager: {
    id: 'compliance_manager',
    label: 'Compliance Manager',
    description: 'Full compliance and assessment access — can approve compliance items and manage frameworks',
    color: '#06b6d4',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    level: 3,
  },
  analyst: {
    id: 'analyst',
    label: 'Analyst',
    description: 'Create and edit core resources — can escalate incidents but not approve',
    color: '#eab308',
    badgeClass: 'bg-status-medium/10 text-status-medium border border-status-medium/30',
    level: 2,
  },
  viewer: {
    id: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to all non-admin resources',
    color: '#22c55e',
    badgeClass: 'bg-status-low/10 text-status-low border border-status-low/30',
    level: 1,
  },
};

// Permission matrix: role → resource → allowed actions
// Granular vendor/compliance actions are listed explicitly per role.
export const PERMISSION_MATRIX: Record<AppRole, Partial<Record<ResourceType, PermissionAction[]>>> = {
  admin: {
    vendors:      ['view', 'create', 'edit', 'delete', 'export', 'assess_vendor', 'suspend_vendor'],
    incidents:    ['view', 'create', 'edit', 'delete', 'escalate', 'approve'],
    alerts:       ['view', 'create', 'edit', 'delete', 'escalate'],
    dashboards:   ['view', 'create', 'edit', 'delete', 'export'],
    compliance:   ['view', 'create', 'edit', 'delete', 'approve', 'modify_compliance', 'close_remediation', 'schedule_audit'],
    assessments:  ['view', 'create', 'edit', 'delete', 'approve'],
    reports:      ['view', 'create', 'export'],
    supply_chain: ['view', 'edit'],
    monitoring:   ['view', 'edit'],
    admin:        ['view', 'create', 'edit', 'delete'],
  },
  ciso: {
    vendors:      ['view', 'create', 'edit', 'delete', 'export', 'assess_vendor', 'suspend_vendor'],
    incidents:    ['view', 'create', 'edit', 'delete', 'escalate', 'approve'],
    alerts:       ['view', 'create', 'edit', 'delete', 'escalate'],
    dashboards:   ['view', 'create', 'edit', 'delete', 'export'],
    compliance:   ['view', 'create', 'edit', 'delete', 'approve', 'modify_compliance', 'close_remediation', 'schedule_audit'],
    assessments:  ['view', 'create', 'edit', 'delete', 'approve'],
    reports:      ['view', 'create', 'export'],
    supply_chain: ['view', 'edit'],
    monitoring:   ['view', 'edit'],
    admin:        [],
  },
  risk_officer: {
    vendors:      ['view', 'create', 'edit', 'export', 'assess_vendor', 'suspend_vendor'],
    incidents:    ['view', 'create', 'edit', 'escalate', 'approve'],
    alerts:       ['view', 'create', 'edit', 'escalate'],
    dashboards:   ['view', 'create', 'edit', 'export'],
    compliance:   ['view', 'create', 'edit', 'approve', 'modify_compliance', 'close_remediation', 'schedule_audit'],
    assessments:  ['view', 'create', 'edit', 'approve'],
    reports:      ['view', 'create', 'export'],
    supply_chain: ['view'],
    monitoring:   ['view'],
    admin:        [],
  },
  compliance_manager: {
    // Can view and assess vendors; cannot suspend (no risk authority)
    vendors:      ['view', 'create', 'edit', 'export', 'assess_vendor'],
    incidents:    ['view', 'create', 'edit', 'escalate'],
    alerts:       ['view', 'create', 'edit'],
    dashboards:   ['view', 'create', 'edit'],
    compliance:   ['view', 'create', 'edit', 'delete', 'approve', 'modify_compliance', 'close_remediation', 'schedule_audit'],
    assessments:  ['view', 'create', 'edit', 'approve'],
    reports:      ['view', 'create', 'export'],
    supply_chain: ['view'],
    monitoring:   ['view'],
    admin:        [],
  },
  analyst: {
    // Can assess vendors but cannot suspend or modify compliance data
    vendors:      ['view', 'create', 'edit', 'export', 'assess_vendor'],
    incidents:    ['view', 'create', 'edit', 'escalate'],
    alerts:       ['view', 'create', 'edit'],
    dashboards:   ['view'],
    compliance:   ['view', 'create', 'edit'],
    assessments:  ['view', 'create', 'edit'],
    reports:      ['view', 'create', 'export'],
    supply_chain: ['view'],
    monitoring:   ['view'],
    admin:        [],
  },
  viewer: {
    // Read-only; no write, assess, suspend, or modify actions
    vendors:      ['view'],
    incidents:    ['view'],
    alerts:       ['view'],
    dashboards:   ['view'],
    compliance:   ['view'],
    assessments:  ['view'],
    reports:      ['view'],
    supply_chain: ['view'],
    monitoring:   ['view'],
    admin:        [],
  },
};

/**
 * Check if a role has permission for a resource+action
 */
export function hasPermission(
  role: AppRole | null | undefined,
  resource: ResourceType,
  action: PermissionAction
): boolean {
  if (!role) return false;
  const actions = PERMISSION_MATRIX[role]?.[resource] ?? [];
  return actions.includes(action);
}

/**
 * Check if a role can access a resource at all (has at least 'view')
 */
export function canAccessResource(role: AppRole | null | undefined, resource: ResourceType): boolean {
  return hasPermission(role, resource, 'view');
}

/**
 * Get all allowed actions for a role+resource
 */
export function getAllowedActions(role: AppRole | null | undefined, resource: ResourceType): PermissionAction[] {
  if (!role) return [];
  return PERMISSION_MATRIX[role]?.[resource] ?? [];
}

/**
 * Navigation items visible to each role
 */
export const ROLE_NAV_ACCESS: Record<AppRole, string[]> = {
  admin: ['/', '/vendor-management', '/supply-chain', '/assessments', '/compliance', '/incidents', '/monitoring', '/reports', '/admin/users', '/admin/team-management', '/admin/roles', '/admin/config'],
  ciso: ['/', '/vendor-management', '/supply-chain', '/assessments', '/compliance', '/incidents', '/monitoring', '/reports'],
  risk_officer: ['/', '/vendor-management', '/supply-chain', '/assessments', '/compliance', '/incidents', '/monitoring', '/reports'],
  compliance_manager: ['/', '/vendor-management', '/supply-chain', '/assessments', '/compliance', '/incidents', '/monitoring', '/reports'],
  analyst: ['/', '/vendor-management', '/supply-chain', '/assessments', '/compliance', '/incidents', '/monitoring', '/reports'],
  viewer: ['/', '/vendor-management', '/supply-chain', '/assessments', '/compliance', '/incidents', '/monitoring', '/reports'],
};

export function canAccessRoute(role: AppRole | null | undefined, path: string): boolean {
  if (!role) return false;
  const allowed = ROLE_NAV_ACCESS[role];
  return allowed.some((r) => (r === '/' ? path === '/' : path.startsWith(r)));
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Admin',
  ciso: 'CISO',
  risk_officer: 'Risk Officer',
  compliance_manager: 'Compliance Manager',
  analyst: 'Analyst',
  viewer: 'Viewer',
};

export const ALL_ROLES: AppRole[] = ['admin', 'ciso', 'risk_officer', 'compliance_manager', 'analyst', 'viewer'];

/**
 * Human-readable labels for granular permission actions (for UI tooltips / access-denied messages)
 */
export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'view',
  create: 'create',
  edit: 'edit',
  delete: 'delete',
  export: 'export',
  escalate: 'escalate',
  approve: 'approve',
  assess_vendor: 'assess vendors',
  suspend_vendor: 'suspend vendors',
  modify_compliance: 'modify compliance data',
  close_remediation: 'close remediations',
  schedule_audit: 'schedule audits',
};
