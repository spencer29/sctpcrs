'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ResourceType, PermissionAction } from '@/lib/rbac/permissions';
import { ShieldOff } from 'lucide-react';

interface PermissionGateProps {
  resource: ResourceType;
  action: PermissionAction;
  children: React.ReactNode;
  /** Optional fallback UI. Defaults to an access-denied message. */
  fallback?: React.ReactNode;
  /** If true, renders nothing (no fallback) when access is denied */
  silent?: boolean;
}

/**
 * Wraps any UI that requires a specific permission.
 * Usage: <PermissionGate resource="vendors" action="create">...</PermissionGate>
 */
export function PermissionGate({
  resource,
  action,
  children,
  fallback,
  silent = false,
}: PermissionGateProps) {
  const { can, loading } = useAuth();

  if (loading) return null;
  if (can(resource, action)) return <>{children}</>;
  if (silent) return null;
  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border text-muted-foreground text-xs">
      <ShieldOff size={13} />
      <span>You don&apos;t have permission to {action} {resource}.</span>
    </div>
  );
}

interface RoleGateProps {
  roles: Array<'admin' | 'risk_officer' | 'analyst' | 'viewer'>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  silent?: boolean;
}

/**
 * Renders children only if the current user has one of the specified roles.
 */
export function RoleGate({ roles, children, fallback, silent = false }: RoleGateProps) {
  const { role, loading } = useAuth();

  if (loading) return null;
  if (role && roles.includes(role)) return <>{children}</>;
  if (silent) return null;
  if (fallback) return <>{fallback}</>;
  return null;
}

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** Shorthand for admin-only content */
export function AdminOnly({ children, fallback }: AdminOnlyProps) {
  return (
    <RoleGate roles={['admin']} fallback={fallback} silent={!fallback}>
      {children}
    </RoleGate>
  );
}

/** Shorthand: hide from viewers */
export function NotViewer({ children, fallback }: AdminOnlyProps) {
  return (
    <RoleGate roles={['admin', 'risk_officer', 'analyst']} fallback={fallback} silent={!fallback}>
      {children}
    </RoleGate>
  );
}
