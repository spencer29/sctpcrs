'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from './permissions';

/**
 * Role-scoped data filtering utilities for SC-TPCRS.
 *
 * Role scoping rules (per blueprint):
 *  - Admin        → sees all data, no restrictions
 *  - Risk Officer → sees all vendors/incidents/assessments; can approve/escalate
 *  - Auditor      → scoped to compliance, assessments, and audit-related data; read-only on vendors
 *  - Vendor Manager → scoped to vendor records and their assessments; no incident/escalation access
 *  - Analyst      → sees all operational data; can create/edit but not approve
 *  - Viewer       → read-only across all resources
 *
 * NOTE: "Auditor" maps to the `analyst` role with compliance focus. *"Vendor Manager" maps to the `analyst` role with vendor focus.
 *       The blueprint uses these as persona labels; the underlying RBAC role is `analyst`.
 *       Job-title-based scoping is applied on top of the role matrix.
 */

export interface RoleFilterConfig {
  /** Whether the current user can see all vendors or only their assigned ones */
  vendorScope: 'all' | 'assigned';
  /** Whether the current user can see all incidents or only assigned/critical */
  incidentScope: 'all' | 'assigned' | 'none';
  /** Whether the current user can see all assessments or only assigned ones */
  assessmentScope: 'all' | 'assigned';
  /** Whether the current user can perform approval actions */
  canApprove: boolean;
  /** Whether the current user can escalate incidents */
  canEscalate: boolean;
  /** Whether the current user can schedule/modify audits */
  canScheduleAudits: boolean;
  /** Whether the current user can close/approve remediations */
  canCloseRemediations: boolean;
  /** Whether the current user can trigger compliance checks */
  canTriggerComplianceChecks: boolean;
  /** Whether the current user can delete vendors */
  canDeleteVendors: boolean;
  /** Whether the current user can access admin routes */
  canAccessAdmin: boolean;
  /** Role label for display */
  roleLabel: string;
  /** Current role */
  role: AppRole | null;
}

/**
 * Returns role-scoped filter configuration for the current user.
 * Components use this to conditionally render data and actions.
 */
export function useRoleFilter(): RoleFilterConfig {
  const { role, can, isAdmin, isRiskOfficer, profile } = useAuth();

  // Detect persona from job title (Auditor / Vendor Manager)
  const jobTitle = profile?.job_title?.toLowerCase() ?? '';
  const isAuditorPersona = jobTitle.includes('auditor') || jobTitle.includes('audit');
  const isVendorManagerPersona = jobTitle.includes('vendor manager') || jobTitle.includes('vendor mgr');

  const adminOrRiskOfficer = isAdmin() || isRiskOfficer();

  return {
    vendorScope: isVendorManagerPersona ? 'assigned' : 'all',
    incidentScope: isAuditorPersona ? 'none' : isVendorManagerPersona ? 'assigned' : 'all',
    assessmentScope: isAuditorPersona || isVendorManagerPersona ? 'assigned' : 'all',
    canApprove: can('assessments', 'approve') && can('compliance', 'approve'),
    canEscalate: can('incidents', 'escalate'),
    canScheduleAudits: adminOrRiskOfficer,
    canCloseRemediations: adminOrRiskOfficer,
    canTriggerComplianceChecks: isRiskOfficer() || isAdmin(),
    canDeleteVendors: can('vendors', 'delete'),
    canAccessAdmin: can('admin', 'view'),
    roleLabel: role
      ? role === 'risk_officer' ? 'Risk Officer'
        : role === 'analyst' ? (isAuditorPersona ? 'Auditor' : isVendorManagerPersona ? 'Vendor Manager' : 'Analyst')
        : role === 'admin'? 'Admin' :'Viewer' :'Guest',
    role,
  };
}

/**
 * Filter an array of items to those assigned to the current user.
 * Falls back to showing all items if no profile is loaded.
 */
export function filterByAssignee<T extends { assignee?: string }>(
  items: T[],
  scope: 'all' | 'assigned',
  currentUserName: string | null | undefined
): T[] {
  if (scope === 'all' || !currentUserName) return items;
  return items.filter(
    (item) =>
      !item.assignee ||
      item.assignee.toLowerCase().includes(currentUserName.toLowerCase())
  );
}
