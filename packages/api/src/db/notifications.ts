import { supabase, isSupabaseConfigured } from '../supabase';
import type { Notification } from '../types';

export function mapDbNotificationToNotification(dbNotif: any): Notification {
  return {
    id: dbNotif.id,
    title: dbNotif.title,
    message: dbNotif.message,
    type: dbNotif.type || 'system',
    isRead: Boolean(dbNotif.is_read),
    createdAt: dbNotif.created_at || new Date().toISOString(),
    icon: dbNotif.icon,
  };
}

export async function getNotifications(opts: { userId?: string; driverId?: string }): Promise<Notification[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (opts.userId) {
      if (opts.userId.includes('-')) {
        query = query.eq('user_id', opts.userId);
      }
    } else if (opts.driverId) {
      if (opts.driverId.includes('-')) {
        query = query.eq('driver_id', opts.driverId);
      }
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapDbNotificationToNotification);
  } catch (err) {
    console.warn('getNotifications error:', err);
    return [];
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  } catch (err) {
    console.warn(err);
  }
}

export async function markAllNotificationsAsRead(opts: { userId?: string; driverId?: string }): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    let query = supabase.from('notifications').update({ is_read: true });
    if (opts.userId && opts.userId.includes('-')) {
      query = query.eq('user_id', opts.userId);
    } else if (opts.driverId && opts.driverId.includes('-')) {
      query = query.eq('driver_id', opts.driverId);
    }
    await query;
  } catch (err) {
    console.warn(err);
  }
}

export async function createNotification(data: Partial<Notification> & { userId?: string; driverId?: string }): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const insertPayload: any = {
      title: data.title || 'Notification',
      message: data.message || '',
      type: data.type || 'system',
      is_read: false,
      user_id: data.userId && data.userId.includes('-') ? data.userId : null,
      driver_id: data.driverId && data.driverId.includes('-') ? data.driverId : null,
      icon: data.icon || null,
    };

    const { data: created, error } = await supabase
      .from('notifications')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !created) return null;
    return mapDbNotificationToNotification(created);
  } catch (err) {
    return null;
  }
}

export async function deleteNotification(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('notifications').delete().eq('id', id);
  } catch (err) {
    console.warn(err);
  }
}
