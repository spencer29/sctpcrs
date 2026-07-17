'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from './client';

export type NotificationType = 'incident_update' | 'alert_status' | 'escalation' | 'team_action';

export interface DbNotification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  entity_id?: string;
  entity_table?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (err) {
        setError(err.message);
        return;
      }
      setNotifications((data as DbNotification[]) || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const supabase = createClient();

    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as DbNotification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === (payload.new as DbNotification).id ? (payload.new as DbNotification) : n
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== (payload.old as DbNotification).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error: err } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (err) setError(err.message);
  }, []);

  const markAllAsRead = useCallback(async () => {
    const supabase = createClient();
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    const { error: err } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
    if (err) setError(err.message);
  }, [notifications]);

  const dismiss = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error: err } = await supabase.from('notifications').delete().eq('id', id);
    if (err) setError(err.message);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismiss,
    refetch: fetchNotifications,
  };
}
