import { Wish } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';

export class WishService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getVisibleWishes(invitationId: string): Promise<Wish[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('wishes')
          .select('*')
          .eq('invitation_id', invitationId)
          .eq('is_visible', true)
          .order('created_at', { ascending: false });
        if (!error && data) return data as Wish[];
      } catch (err) {
        console.error('Supabase getVisibleWishes error:', err);
      }
    }

    return mockStore.wishes
      .filter((w) => w.invitation_id === invitationId && w.is_visible)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getAllWishes(invitationId: string): Promise<Wish[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('wishes')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as Wish[];
      } catch (err) {
        console.error('Supabase getAllWishes error:', err);
      }
    }

    return mockStore.wishes
      .filter((w) => w.invitation_id === invitationId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async submitWish(
    invitationId: string,
    guestName: string,
    message: string,
    guestId?: string | null
  ): Promise<Wish> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('wishes')
          .insert({
            invitation_id: invitationId,
            guest_id: guestId || null,
            guest_name: guestName,
            message,
            is_visible: true,
          })
          .select()
          .single();
        if (!error && data) return data as Wish;
      } catch (err) {
        console.error('Supabase submitWish error:', err);
      }
    }

    const newWish: Wish = {
      id: `wsh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invitation_id: invitationId,
      guest_id: guestId || null,
      guest_name: guestName,
      message,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.wishes.unshift(newWish);
    return newWish;
  }

  static async toggleVisibility(wishId: string): Promise<Wish | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: current } = await supabase
          .from('wishes')
          .select('is_visible')
          .eq('id', wishId)
          .single();

        if (current) {
          const { data: updated } = await supabase
            .from('wishes')
            .update({ is_visible: !current.is_visible, updated_at: new Date().toISOString() })
            .eq('id', wishId)
            .select()
            .single();
          if (updated) return updated as Wish;
        }
      } catch (err) {
        console.error('Supabase toggleVisibility error:', err);
      }
    }

    const wish = mockStore.wishes.find((w) => w.id === wishId);
    if (!wish) return null;
    wish.is_visible = !wish.is_visible;
    wish.updated_at = new Date().toISOString();
    return wish;
  }

  static async deleteWish(wishId: string): Promise<boolean> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('wishes').delete().eq('id', wishId);
        if (!error) return true;
      } catch (err) {
        console.error('Supabase deleteWish error:', err);
      }
    }

    mockStore.wishes = mockStore.wishes.filter((w) => w.id !== wishId);
    return true;
  }
}
