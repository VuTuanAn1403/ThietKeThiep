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
  const rateLimitResponse = enforceRateLimit(request, 'rsvp');
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;

  try {
    const body = await request.json();
    const { guestId, attendance, guestCount, note, captchaToken } = body;

    // 1. CAPTCHA Check
    const captchaRes = await verifyTurnstileToken(captchaToken);
    if (!captchaRes.success) {
      return NextResponse.json({ error: captchaRes.error || 'Xác thực bảo vệ thất bại' }, { status: 403 });
    }

    const res = await RSVPService.submitRSVP(guestId, {
      attendance,
      guest_count: guestCount ?? 1,
      note,
    });

    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 422 });
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

    return NextResponse.json({ data: res.rsvp, message: 'Phản hồi RSVP thành công' }, { status: 201 });
  } catch (err) {
    ErrorMonitoring.captureException(err, { route: `/api/v1/invitations/${id}/rsvps` });
    return NextResponse.json({ error: 'Lỗi gửi RSVP' }, { status: 500 });
  }
}
