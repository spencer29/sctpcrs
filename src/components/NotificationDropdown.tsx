'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  ShieldAlert,
  ArrowUpCircle,
  Users,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { useRealtimeNotifications, NotificationType } from '@/lib/supabase/notifications';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  incident_update: {
    icon: <AlertTriangle size={13} />,
    color: 'text-status-high',
    bg: 'bg-status-high/10',
    label: 'Incident',
  },
  alert_status: {
    icon: <ShieldAlert size={13} />,
    color: 'text-status-critical',
    bg: 'bg-status-critical/10',
    label: 'Alert',
  },
  escalation: {
    icon: <ArrowUpCircle size={13} />,
    color: 'text-status-medium',
    bg: 'bg-status-medium/10',
    label: 'Escalation',
  },
  team_action: {
    icon: <Users size={13} />,
    color: 'text-primary',
    bg: 'bg-primary/10',
    label: 'Team',
  },
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, dismiss } =
    useRealtimeNotifications();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleOpen = () => setOpen((v) => !v);

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) markAsRead(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-status-critical flex items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none px-0.5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[520px] flex flex-col rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-status-critical/15 text-status-critical text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1 divide-y divide-border/50">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Bell size={24} className="opacity-30" />
                <span className="text-sm">No notifications</span>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.notification_type];
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id, n.is_read)}
                    className={`group relative flex gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      n.is_read
                        ? 'bg-transparent hover:bg-muted/30' :'bg-primary/[0.03] hover:bg-primary/[0.06]'
                    }`}
                  >
                    {/* Unread dot */}
                    {!n.is_read && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center mt-0.5 ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-medium mt-0.5 leading-snug ${
                          n.is_read ? 'text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                        {n.body}
                      </p>
                    </div>

                    {/* Dismiss button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismiss(n.id);
                      }}
                      aria-label="Dismiss notification"
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all mt-0.5"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border flex-shrink-0">
              <p className="text-[11px] text-muted-foreground text-center">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''} · Real-time
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
