'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  Activity,
  FileText,
  Settings,
  Users,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  HelpCircle,
  ClipboardList,
  Lock,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeSeverity?: 'critical' | 'high' | 'medium' | 'info';
  group?: string;
}

const navItems: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Risk Overview',
    href: '/',
    icon: <LayoutDashboard size={18} />,
    group: 'core',
  },
  {
    id: 'nav-vendors',
    label: 'Vendors',
    href: '/vendor-management',
    icon: <Building2 size={18} />,
    badge: 3,
    badgeSeverity: 'high',
    group: 'core',
  },
  {
    id: 'nav-supplychain',
    label: 'Supply Chain',
    href: '/supply-chain',
    icon: <GitBranch size={18} />,
    badge: 2,
    badgeSeverity: 'critical',
    group: 'core',
  },
  {
    id: 'nav-assessments',
    label: 'Assessments',
    href: '/assessments',
    icon: <ClipboardList size={18} />,
    badge: 2,
    badgeSeverity: 'high',
    group: 'core',
  },
  {
    id: 'nav-compliance',
    label: 'Compliance',
    href: '/compliance',
    icon: <ShieldCheck size={18} />,
    badge: 4,
    badgeSeverity: 'high',
    group: 'core',
  },
  {
    id: 'nav-incidents',
    label: 'Incidents',
    href: '/incidents',
    icon: <AlertTriangle size={18} />,
    badge: 1,
    badgeSeverity: 'critical',
    group: 'core',
  },
  {
    id: 'nav-monitoring',
    label: 'Monitoring',
    href: '/monitoring',
    icon: <Activity size={18} />,
    badge: 7,
    badgeSeverity: 'medium',
    group: 'core',
  },
  {
    id: 'nav-reports',
    label: 'Reports',
    href: '/reports',
    icon: <FileText size={18} />,
    group: 'reporting',
  },
  {
    id: 'nav-users',
    label: 'User Management',
    href: '/admin/users',
    icon: <Users size={18} />,
    group: 'admin',
  },
  {
    id: 'nav-team-management',
    label: 'Team Management',
    href: '/admin/team-management',
    icon: <UserCog size={18} />,
    group: 'admin',
  },
  {
    id: 'nav-roles',
    label: 'Roles & Permissions',
    href: '/admin/roles',
    icon: <Lock size={18} />,
    group: 'admin',
  },
  {
    id: 'nav-config',
    label: 'Configuration',
    href: '/admin/config',
    icon: <Settings size={18} />,
    group: 'admin',
  },
];

const groupLabels: Record<string, string> = {
  core: 'OPERATIONS',
  reporting: 'REPORTING',
  admin: 'ADMINISTRATION',
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { canVisit, profile, role, roleDefinition, signOut } = useAuth();

  const groups = ['core', 'reporting', 'admin'];

  const getBadgeClass = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-status-critical text-white';
      case 'high': return 'bg-status-high text-white';
      case 'medium': return 'bg-status-medium text-background';
      case 'info': return 'bg-status-info text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Derive initials from profile name
  const displayName = profile?.full_name ?? 'User';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  const roleLabel = roleDefinition?.label ?? 'Viewer';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col bg-card border-r border-border sidebar-transition ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-border h-16 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-foreground tracking-tight leading-none">SC-TPCRS</span>
            <span className="text-2xs text-muted-foreground mt-0.5 tracking-widest uppercase">Risk Platform</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {groups.map((group) => {
          // Filter nav items by role permission
          const items = navItems.filter((n) => n.group === group && canVisit(n.href));
          if (!items.length) return null;
          return (
            <div key={`group-${group}`} className="mb-4">
              {!collapsed && (
                <p className="text-2xs font-mono-data font-semibold tracking-widest text-muted-foreground uppercase px-2 mb-1.5">
                  {groupLabels[group]}
                </p>
              )}
              {collapsed && group !== 'core' && <div className="h-px bg-border mx-1 mb-3" />}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-all duration-150 group relative ${
                          active
                            ? 'nav-item-active' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                        } ${collapsed ? 'justify-center' : ''}`}
                      >
                        <span className={`flex-shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {!collapsed && item.badge !== undefined && (
                          <span className={`text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded-full ${getBadgeClass(item.badgeSeverity)}`}>
                            {item.badge}
                          </span>
                        )}
                        {collapsed && item.badge !== undefined && (
                          <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                            item.badgeSeverity === 'critical' ? 'bg-status-critical alert-pulse' :
                            item.badgeSeverity === 'high' ? 'bg-status-high' : 'bg-status-medium'
                          }`} />
                        )}
                        {/* Tooltip for collapsed */}
                        {collapsed && (
                          <span className="absolute left-full ml-3 px-2 py-1 bg-secondary border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                            {item.label}
                            {item.badge !== undefined && ` (${item.badge})`}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2 space-y-1 flex-shrink-0">
        {/* Notifications */}
        <button
          title={collapsed ? 'Notifications' : undefined}
          className={`flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 group relative ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="relative flex-shrink-0">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-status-critical alert-pulse" />
          </div>
          {!collapsed && <span className="flex-1 text-left">Notifications</span>}
          {!collapsed && (
            <span className="text-2xs font-mono-data font-semibold px-1.5 py-0.5 rounded-full bg-status-critical text-white">4</span>
          )}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2 py-1 bg-secondary border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Notifications (4)
            </span>
          )}
        </button>

        {/* Help */}
        <button
          title={collapsed ? 'Help & Documentation' : undefined}
          className={`flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 group relative ${collapsed ? 'justify-center' : ''}`}
        >
          <HelpCircle size={18} className="flex-shrink-0" />
          {!collapsed && <span>Help & Docs</span>}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2 py-1 bg-secondary border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Help & Docs
            </span>
          )}
        </button>

        {/* User — shows real profile + role badge */}
        <div
          className={`flex items-center gap-2.5 px-2 py-2 mt-1 rounded-md hover:bg-muted cursor-pointer transition-all duration-150 group relative ${collapsed ? 'justify-center' : ''}`}
          onClick={handleSignOut}
          title={collapsed ? `${displayName} — ${roleLabel}` : undefined}
        >
          <div
            className="w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${roleDefinition?.color ?? '#6366f1'}22`,
              borderColor: `${roleDefinition?.color ?? '#6366f1'}66`,
            }}
          >
            <span
              className="text-2xs font-semibold font-mono-data"
              style={{ color: roleDefinition?.color ?? '#6366f1' }}
            >
              {initials || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
              <p
                className="text-2xs truncate font-medium"
                style={{ color: roleDefinition?.color ?? '#6366f1' }}
              >
                {roleLabel}
              </p>
            </div>
          )}
          {!collapsed && (
            <LogOut size={14} className="text-muted-foreground group-hover:text-foreground flex-shrink-0" />
          )}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2 py-1 bg-secondary border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {displayName} — {roleLabel}
            </span>
          )}
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-150 z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}