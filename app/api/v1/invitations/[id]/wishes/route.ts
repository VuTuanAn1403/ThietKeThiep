import { NextResponse } from 'next/server';
import { WishService } from '@/services/wish.service';
import { InvitationService } from '@/services/invitation.service';
import { NotificationService } from '@/services/notification.service';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { verifyTurnstileToken } from '@/lib/security/captcha';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = await WishService.getVisibleWishes(id);
  return NextResponse.json({ data: list });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rateLimitResponse = await enforceRateLimit(request, 'wish', id);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { guestName, message, guestId, captchaToken } = body;

    // 1. CAPTCHA Check
    const captchaRes = await verifyTurnstileToken(captchaToken);
    if (!captchaRes.success) {
      return NextResponse.json({ error: captchaRes.error || 'Xác thực bảo vệ thất bại' }, { status: 403 });
    }

    if (!guestName || !guestName.trim() || !message || !message.trim()) {
      return NextResponse.json({ error: 'Tên và nội dung lời chúc không được để trống' }, { status: 422 });
    }

    const wish = await WishService.submitWish(id, guestName.trim(), message.trim(), guestId);

    // 2. Trigger notification for invitation owner
    try {
      const invitation = await InvitationService.getInvitationById(id);
      if (invitation) {
        await NotificationService.createNotification(
          invitation.user_id,
          'WISH_RECEIVED',
          'Lời chúc mới',
          `${guestName.trim()} vừa gửi một lời chúc mừng tới thiệp "${invitation.title}".`
        );
      }
    } catch {
      // Non-blocking notification
    }

    return NextResponse.json({ data: wish, message: 'Gửi lời chúc thành công' }, { status: 201 });
  } catch (err) {
    ErrorMonitoring.captureException(err, { route: `/api/v1/invitations/${id}/wishes` });
    return NextResponse.json({ error: 'Lỗi gửi lời chúc' }, { status: 500 });
  }
}
