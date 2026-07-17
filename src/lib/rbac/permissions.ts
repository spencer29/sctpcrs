// SC-TPCRS Role-Based Access Control
// Roles: Admin, Risk Officer, Analyst, Viewer

export type AppRole = 'admin' | 'risk_officer' | 'analyst' | 'viewer';
export type ResourceType =
  | 'vendors'
  | 'incidents' |'alerts' |'dashboards' |'compliance' |'assessments' |'reports' |'supply_chain' |'monitoring' |'admin';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'escalate' | 'approve';

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
    level: 4,
  },
  risk_officer: {
    id: 'risk_officer',
    label: 'Risk Officer',
    description: 'Broad access to risk resources — can escalate, approve, and manage incidents',
    color: '#f97316',
    badgeClass: 'bg-status-high/10 text-status-high border border-status-high/30',
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
export const PERMISSION_MATRIX: Record<AppRole, Partial<Record<ResourceType, PermissionAction[]>>> = {
  admin: {
    vendors:      ['view', 'create', 'edit', 'delete', 'export'],
    incidents:    ['view', 'create', 'edit', 'delete', 'escalate', 'approve'],
    alerts:       ['view', 'create', 'edit', 'delete', 'escalate'],
    dashboards:   ['view', 'create', 'edit', 'delete'],
    compliance:   ['view', 'create', 'edit', 'delete', 'approve'],
    assessments:  ['view', 'create', 'edit', 'delete', 'approve'],
    reports:      ['view', 'create', 'export'],
    supply_chain: ['view', 'edit'],
    monitoring:   ['view', 'edit'],
    admin:        ['view', 'create', 'edit', 'delete'],
  },
  risk_officer: {
    vendors:      ['view', 'create', 'edit', 'export'],
    incidents:    ['view', 'create', 'edit', 'escalate', 'approve'],
    alerts:       ['view', 'create', 'edit', 'escalate'],
    dashboards:   ['view', 'create', 'edit'],
    compliance:   ['view', 'create', 'edit', 'approve'],
    assessments:  ['view', 'create', 'edit', 'approve'],
    reports:      ['view', 'create', 'export'],
    supply_chain: ['view'],
    monitoring:   ['view'],
    admin:        [],
  },
  analyst: {
    vendors:      ['view', 'create', 'edit', 'export'],
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
  admin: ['/', '/vendor-management', '/supply-chain', '/assessments', '/compliance', '/incidents', '/monitoring', '/reports', '/admin/users', '/admin/config'],
  risk_officer: ['/', '/vendor-management', '/supply-chain', '/assessments', '/compliance', '/incidents', '/monitoring', '/reports'],
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
  risk_officer: 'Risk Officer',
  analyst: 'Analyst',
  viewer: 'Viewer',
};

export const ALL_ROLES: AppRole[] = ['admin', 'risk_officer', 'analyst', 'viewer'];
