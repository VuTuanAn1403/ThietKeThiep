import { RSVP, RSVPAttendance } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';
import { GuestService } from './guest.service';

export interface RSVPInput {
  attendance: RSVPAttendance;
  guest_count: number;
  note?: string | null;
}

export interface RSVPStats {
  attending: number;
  notAttending: number;
  maybe: number;
  pending: number;
  totalGuestCountAttending: number;
}

export class RSVPService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getRSVPByGuestId(guestId: string): Promise<RSVP | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('rsvps')
          .select('*')
          .eq('guest_id', guestId)
          .single();
        if (!error && data) return data as RSVP;
      } catch (err) {
        console.error('Supabase getRSVPByGuestId error:', err);
      }
    }
    return mockStore.rsvps.find((r) => r.guest_id === guestId) || null;
  }

  static async submitRSVP(
    guestId: string,
    input: RSVPInput
  ): Promise<{ rsvp: RSVP | null; error: string | null }> {
    let maxGuests = 1;
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: guest } = await supabase
          .from('guests')
          .select('id, max_guests')
          .eq('id', guestId)
          .single();

        if (!guest) return { rsvp: null, error: 'Không tìm thấy thông tin khách mời' };
        maxGuests = guest.max_guests;
      } catch (err) {
        console.error('Supabase fetch guest max_guests error:', err);
      }
    } else {
      const guest = mockStore.guests.find((g) => g.id === guestId);
      if (!guest) return { rsvp: null, error: 'Không tìm thấy thông tin khách mời' };
      maxGuests = guest.max_guests;
    }

    if (input.attendance === 'NOT_ATTENDING') {
      input.guest_count = 0;
    } else {
      if (input.guest_count < 1) {
        return { rsvp: null, error: 'Số người tham dự tối thiểu là 1' };
      }
      if (input.guest_count > maxGuests) {
        return { rsvp: null, error: `Số người tham dự vượt quá giới hạn tối đa (${maxGuests} người)` };
      }
    }

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: existing } = await supabase
          .from('rsvps')
          .select('id')
          .eq('guest_id', guestId)
          .single();

        if (existing) {
          const { data: updated, error } = await supabase
            .from('rsvps')
            .update({
              attendance: input.attendance,
              guest_count: input.guest_count,
              note: input.note || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (!error && updated) return { rsvp: updated as RSVP, error: null };
          if (error) return { rsvp: null, error: error.message };
        } else {
          const { data: created, error } = await supabase
            .from('rsvps')
            .insert({
              guest_id: guestId,
              attendance: input.attendance,
              guest_count: input.guest_count,
              note: input.note || null,
            })
            .select()
            .single();

          if (!error && created) return { rsvp: created as RSVP, error: null };
          if (error) return { rsvp: null, error: error.message };
        }
      } catch (err: unknown) {
        console.error('Supabase submitRSVP error:', err);
      }
    }

    const existingIdx = mockStore.rsvps.findIndex((r) => r.guest_id === guestId);

    if (existingIdx !== -1) {
      const updated: RSVP = {
        ...mockStore.rsvps[existingIdx],
        attendance: input.attendance,
        guest_count: input.guest_count,
        note: input.note || null,
        updated_at: new Date().toISOString(),
      };
      mockStore.rsvps[existingIdx] = updated;
      return { rsvp: updated, error: null };
    } else {
      const newRSVP: RSVP = {
        id: `rsvp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        guest_id: guestId,
        attendance: input.attendance,
        guest_count: input.guest_count,
        note: input.note || null,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockStore.rsvps.push(newRSVP);
      return { rsvp: newRSVP, error: null };
    }
  }

  static async getInvitationRSVPStats(invitationId: string): Promise<RSVPStats> {
    const guests = await GuestService.getGuests(invitationId);
    let attending = 0;
    let notAttending = 0;
    let maybe = 0;
    let pending = 0;
    let totalGuestCountAttending = 0;

    for (const g of guests) {
      const rsvp = await this.getRSVPByGuestId(g.id);
      if (!rsvp) {
        pending++;
      } else if (rsvp.attendance === 'ATTENDING') {
        attending++;
        totalGuestCountAttending += rsvp.guest_count;
      } else if (rsvp.attendance === 'NOT_ATTENDING') {
        notAttending++;
      } else if (rsvp.attendance === 'MAYBE') {
        maybe++;
        totalGuestCountAttending += rsvp.guest_count;
      }
    }

    return {
      attending,
      notAttending,
      maybe,
      pending,
      totalGuestCountAttending,
    };
  }
}
