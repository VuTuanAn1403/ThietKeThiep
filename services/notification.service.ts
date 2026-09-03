import { Notification, NotificationType } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';

export class NotificationService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getUserNotifications(userId: string): Promise<Notification[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as Notification[];
      } catch (err) {
        console.error('Supabase getUserNotifications error:', err);
      }
    }

    return mockStore.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const list = await this.getUserNotifications(userId);
    return list.filter((n) => n.read_at === null).length;
  }

  static async markAsRead(id: string): Promise<boolean> {
    const readAt = new Date().toISOString();

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('notifications')
          .update({ read_at: readAt })
          .eq('id', id);

        if (!error) return true;
      } catch (err) {
        console.error('Supabase markAsRead error:', err);
      }
    }

    const notif = mockStore.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read_at = readAt;
      return true;
    }
    return false;
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    const readAt = new Date().toISOString();

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('notifications')
          .update({ read_at: readAt })
          .eq('user_id', userId)
          .is('read_at', null);

        if (!error) return true;
      } catch (err) {
        console.error('Supabase markAllAsRead error:', err);
      }
    }

    mockStore.notifications.forEach((n) => {
      if (n.user_id === userId && n.read_at === null) {
        n.read_at = readAt;
      }
    });
    return true;
  }

  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string
  ): Promise<Notification> {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      type,
      title,
      message,
      read_at: null,
      created_at: new Date().toISOString(),
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('notifications')
          .insert(newNotif)
          .select()
          .single();

        if (!error && data) return data as Notification;
      } catch (err) {
        console.error('Supabase createNotification error:', err);
      }
    }

    mockStore.notifications.unshift(newNotif);
    return newNotif;
  }
}
