import { NextResponse } from 'next/server';
import { RSVPService } from '@/services/rsvp.service';
import { InvitationService } from '@/services/invitation.service';
import { NotificationService } from '@/services/notification.service';
import { requireInvitationOwnership } from '@/lib/auth/server-auth';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { verifyTurnstileToken } from '@/lib/security/captcha';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireInvitationOwnership(id);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
  }

  const stats = await RSVPService.getInvitationRSVPStats(id);
  return NextResponse.json({ data: stats });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rateLimitResponse = await enforceRateLimit(request, 'rsvp', id);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { guestId, guestName, phone, attendance, guestCount, note, captchaToken } = body;

    // 1. CAPTCHA Check
    const captchaRes = await verifyTurnstileToken(captchaToken);
    if (!captchaRes.success) {
      return NextResponse.json({ error: captchaRes.error || 'Xác thực bảo vệ thất bại' }, { status: 403 });
    }

    let rsvpResult;
    if (guestId) {
      // Personalized RSVP with strict invitation ownership check
      rsvpResult = await RSVPService.submitRSVP(
        guestId,
        {
          attendance,
          guest_count: guestCount ?? 1,
          note,
        },
        id
      );
    } else if (guestName && guestName.trim()) {
      // Anonymous / Public RSVP submission
      rsvpResult = await RSVPService.submitPublicRSVP(id, {
        guest_name: guestName,
        attendance,
        guest_count: guestCount ?? 1,
        note,
        phone,
      });
    } else {
      return NextResponse.json({ error: 'Vui lòng cung cấp thông tin khách mời' }, { status: 422 });
    }

    if (rsvpResult.error) {
      const isForbidden = rsvpResult.error.includes('không thuộc');
      return NextResponse.json({ error: rsvpResult.error }, { status: isForbidden ? 403 : 422 });
    }

    // 2. Trigger in-app notification for the invitation owner
    try {
      const invitation = await InvitationService.getInvitationById(id);
      if (invitation) {
        const attendanceLabel = attendance === 'ATTENDING' ? 'sẽ tham dự' : attendance === 'NOT_ATTENDING' ? 'rất tiếc không thể tham dự' : 'có thể tham dự';
        await NotificationService.createNotification(
          invitation.user_id,
          'RSVP_RECEIVED',
          'Phản hồi RSVP mới',
          `Một khách mời vừa xác nhận ${attendanceLabel} cho thiệp "${invitation.title}".`
        );
      }
    } catch {
      // Non-blocking notification
    }

    return NextResponse.json({ data: rsvpResult.rsvp, message: 'Phản hồi RSVP thành công' }, { status: 201 });
  } catch (err) {
    ErrorMonitoring.captureException(err, { route: `/api/v1/invitations/${id}/rsvps` });
    return NextResponse.json({ error: 'Lỗi gửi RSVP' }, { status: 500 });
  }
}
