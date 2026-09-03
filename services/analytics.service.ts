import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';
import { InvitationService } from './invitation.service';
import { GuestService } from './guest.service';
import { RSVPService } from './rsvp.service';

export interface OverviewMetrics {
  totalInvitations: number;
  publishedInvitations: number;
  draftInvitations: number;
  totalViews: number;
  totalGuests: number;
  totalAttending: number;
}

export interface InvitationAnalytics {
  totalViews: number;
  uniqueSessions: number;
  viewsByDay: Array<{ date: string; views: number }>;
  rsvpDistribution: Array<{ name: string; value: number }>;
  groupBreakdown: Array<{ group: string; total: number; attending: number }>;
}

export class AnalyticsService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getUserOverviewMetrics(userId: string): Promise<OverviewMetrics> {
    const userInvs = await InvitationService.getUserInvitations(userId);
    const userInvIds = userInvs.map((i) => i.id);

    const publishedInvitations = userInvs.filter((i) => i.status === 'PUBLISHED').length;
    const draftInvitations = userInvs.filter((i) => i.status === 'DRAFT').length;

    let totalViews = 0;
    let totalGuests = 0;
    let totalAttending = 0;

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (userInvIds.length > 0) {
          const [{ count: viewsCount }, { data: guests }] = await Promise.all([
            supabase.from('invitation_views').select('*', { count: 'exact', head: true }).in('invitation_id', userInvIds),
            supabase.from('guests').select('id, max_guests').in('invitation_id', userInvIds),
          ]);
          totalViews = viewsCount || 0;
          totalGuests = guests ? guests.length : 0;
        }
      } catch (err) {
        console.error('Supabase getUserOverviewMetrics error:', err);
      }
    } else {
      totalViews = mockStore.views.filter((v) => userInvIds.includes(v.invitation_id)).length;
      const userGuests = mockStore.guests.filter((g) => userInvIds.includes(g.invitation_id));
      totalGuests = userGuests.length;

      for (const g of userGuests) {
        const r = mockStore.rsvps.find((r) => r.guest_id === g.id);
        if (r && r.attendance === 'ATTENDING') {
          totalAttending += r.guest_count;
        }
      }
    }

    return {
      totalInvitations: userInvs.length,
      publishedInvitations,
      draftInvitations,
      totalViews,
      totalGuests,
      totalAttending,
    };
  }

  static async getInvitationAnalytics(invitationId: string): Promise<InvitationAnalytics> {
    const guests = await GuestService.getGuests(invitationId);
    let totalViews = 0;
    let uniqueSessions = 0;

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: views } = await supabase
          .from('invitation_views')
          .select('session_id, viewed_at')
          .eq('invitation_id', invitationId);

        if (views) {
          totalViews = views.length;
          uniqueSessions = new Set(views.map((v) => v.session_id)).size;
        }
      } catch (err) {
        console.error('Supabase getInvitationAnalytics error:', err);
      }
    } else {
      const views = mockStore.views.filter((v) => v.invitation_id === invitationId);
      totalViews = views.length;
      uniqueSessions = new Set(views.map((v) => v.session_id)).size;
    }

    const dayMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' });
      dayMap[dateStr] = 0;
    }

    const viewsByDay = Object.keys(dayMap).map((date) => ({
      date,
      views: dayMap[date],
    }));

    let attending = 0;
    let notAttending = 0;
    let maybe = 0;
    let pending = 0;

    for (const g of guests) {
      const r = await RSVPService.getRSVPByGuestId(g.id);
      if (!r) pending++;
      else if (r.attendance === 'ATTENDING') attending++;
      else if (r.attendance === 'NOT_ATTENDING') notAttending++;
      else if (r.attendance === 'MAYBE') maybe++;
    }

    const rsvpDistribution = [
      { name: 'Tham dự', value: attending },
      { name: 'Có thể', value: maybe },
      { name: 'Vắng mặt', value: notAttending },
      { name: 'Chưa trả lời', value: pending },
    ];

    const groupMap: Record<string, { total: number; attending: number }> = {};
    for (const g of guests) {
      const grp = g.group_name || 'Khách mời';
      if (!groupMap[grp]) groupMap[grp] = { total: 0, attending: 0 };
      groupMap[grp].total++;

      const r = await RSVPService.getRSVPByGuestId(g.id);
      if (r && r.attendance === 'ATTENDING') {
        groupMap[grp].attending++;
      }
    }

    const groupBreakdown = Object.keys(groupMap).map((group) => ({
      group,
      total: groupMap[group].total,
      attending: groupMap[group].attending,
    }));

    return {
      totalViews,
      uniqueSessions,
      viewsByDay,
      rsvpDistribution,
      groupBreakdown,
    };
  }
}
