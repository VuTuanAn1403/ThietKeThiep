import { Guest, InvitationView } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';
import { GuestInput } from '@/lib/validations/guest.schema';
import QRCode from 'qrcode';
import Papa from 'papaparse';

export class GuestService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getGuests(invitationId: string, groupName?: string, search?: string): Promise<Guest[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from('guests').select('*').eq('invitation_id', invitationId);

        if (groupName && groupName !== 'all') {
          query = query.eq('group_name', groupName);
        }

        if (search && search.trim()) {
          const q = `%${search.trim()}%`;
          query = query.or(`name.ilike.${q},phone.ilike.${q},email.ilike.${q}`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) return data as Guest[];
      } catch (err) {
        console.error('Supabase getGuests error:', err);
      }
    }

    let list = mockStore.guests.filter((g) => g.invitation_id === invitationId);

    if (groupName && groupName !== 'all') {
      list = list.filter((g) => g.group_name === groupName);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.phone && g.phone.includes(q)) ||
          (g.email && g.email.toLowerCase().includes(q))
      );
    }

    return list;
  }

  static async getGuestBySlug(invitationId: string, slug: string): Promise<Guest | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .eq('invitation_id', invitationId)
          .eq('slug', slug)
          .single();
        if (!error && data) return data as Guest;
      } catch (err) {
        console.error('Supabase getGuestBySlug error:', err);
      }
    }
    return mockStore.guests.find((g) => g.invitation_id === invitationId && g.slug === slug) || null;
  }

  static async createGuest(invitationId: string, input: GuestInput): Promise<{ guest: Guest | null; error: string | null }> {
    const rawSlug = input.slug || input.name;
    const slug = rawSlug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: existing } = await supabase
          .from('guests')
          .select('id')
          .eq('invitation_id', invitationId)
          .eq('slug', slug)
          .single();

        if (existing) {
          return { guest: null, error: `Tên hoặc slug khách mời "${slug}" đã tồn tại trong danh sách tiệc này.` };
        }

        const { data: created, error } = await supabase
          .from('guests')
          .insert({
            invitation_id: invitationId,
            name: input.name,
            slug,
            phone: input.phone || null,
            email: input.email || null,
            group_name: input.groupName || 'Khách mời',
            max_guests: input.maxGuests || 1,
          })
          .select()
          .single();

        if (!error && created) return { guest: created as Guest, error: null };
        if (error) return { guest: null, error: error.message };
      } catch (err: unknown) {
        console.error('Supabase createGuest error:', err);
      }
    }

    const existing = mockStore.guests.find((g) => g.invitation_id === invitationId && g.slug === slug);
    if (existing) {
      return { guest: null, error: `Tên hoặc slug khách mời "${slug}" đã tồn tại trong danh sách tiệc này.` };
    }

    const newGuest: Guest = {
      id: `gst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invitation_id: invitationId,
      name: input.name,
      slug,
      phone: input.phone || null,
      email: input.email || null,
      group_name: input.groupName || 'Khách mời',
      max_guests: input.maxGuests || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockStore.guests.push(newGuest);
    return { guest: newGuest, error: null };
  }

  static async updateGuest(id: string, updates: Partial<Guest>): Promise<{ guest: Guest | null; error: string | null }> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: updated, error } = await supabase
          .from('guests')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) return { guest: updated as Guest, error: null };
      } catch (err) {
        console.error('Supabase updateGuest error:', err);
      }
    }

    const idx = mockStore.guests.findIndex((g) => g.id === id);
    if (idx === -1) return { guest: null, error: 'Không tìm thấy thông tin khách mời' };

    const current = mockStore.guests[idx];
    const updated: Guest = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    mockStore.guests[idx] = updated;
    return { guest: updated, error: null };
  }

  static async deleteGuest(id: string): Promise<boolean> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('guests').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.error('Supabase deleteGuest error:', err);
      }
    }

    mockStore.guests = mockStore.guests.filter((g) => g.id !== id);
    mockStore.rsvps = mockStore.rsvps.filter((r) => r.guest_id !== id);
    return true;
  }

  static async importCSV(invitationId: string, csvContent: string): Promise<{ total: number; success: number; failed: number; errors: string[] }> {
    const parseResult = Papa.parse<{
      name?: string;
      email?: string;
      phone?: string;
      max_guests?: string;
      group_name?: string;
    }>(csvContent, { header: true, skipEmptyLines: true });

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const row of parseResult.data) {
      if (!row.name || !row.name.trim()) {
        failedCount++;
        errors.push('Bản ghi thiếu cột name');
        continue;
      }

      const res = await this.createGuest(invitationId, {
        name: row.name.trim(),
        email: row.email ? row.email.trim() : null,
        phone: row.phone ? row.phone.trim() : null,
        groupName: row.group_name ? row.group_name.trim() : 'Khách mời',
        maxGuests: row.max_guests ? parseInt(row.max_guests) || 1 : 1,
      });

      if (res.error) {
        failedCount++;
        errors.push(`${row.name}: ${res.error}`);
      } else {
        successCount++;
      }
    }

    return {
      total: parseResult.data.length,
      success: successCount,
      failed: failedCount,
      errors,
    };
  }

  static async generateQRCodeDataUrl(url: string): Promise<string> {
    try {
      return await QRCode.toDataURL(url, { width: 300, margin: 2 });
    } catch {
      return '';
    }
  }

  static generatePersonalizedUrl(invitationSlug: string, guestSlug: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${origin}/i/${invitationSlug}?to=${guestSlug}`;
  }

  static async recordView(invitationId: string, guestId?: string | null): Promise<void> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('invitation_views').insert({
          invitation_id: invitationId,
          guest_id: guestId || null,
          session_id: typeof window !== 'undefined' ? sessionStorage.getItem('nha_co_tiec_sess') || 'sess-random' : 'sess-ssr',
        });
        return;
      } catch (err) {
        console.error('Supabase recordView error:', err);
      }
    }

    const view: InvitationView = {
      id: `vw-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invitation_id: invitationId,
      guest_id: guestId || null,
      session_id: typeof window !== 'undefined' ? sessionStorage.getItem('nha_co_tiec_sess') || 'sess-random' : 'sess-ssr',
      viewed_at: new Date().toISOString(),
    };
    mockStore.views.push(view);
  }
}
