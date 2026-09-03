import { NextResponse } from 'next/server';
import { SignatureService } from '@/services/signature.service';
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
  const list = await SignatureService.getVisibleSignatures(id);
  return NextResponse.json({ data: list });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = enforceRateLimit(request, 'signature');
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;

  try {
    const body = await request.json();
    const { guestName, message, signatureImageUrl, guestId, captchaToken } = body;

    // 1. CAPTCHA Check
    const captchaRes = await verifyTurnstileToken(captchaToken);
    if (!captchaRes.success) {
      return NextResponse.json({ error: captchaRes.error || 'Xác thực bảo vệ thất bại' }, { status: 403 });
    }

    const res = await SignatureService.submitSignature(id, guestName, message, signatureImageUrl, guestId);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 422 });
    }

    // 2. Trigger notification for invitation owner
    try {
      const invitation = await InvitationService.getInvitationById(id);
      if (invitation) {
        await NotificationService.createNotification(
          invitation.user_id,
          'SIGNATURE_RECEIVED',
          'Chữ ký lưu bút mới',
          `${guestName} vừa để lại chữ ký lưu bút trên thiệp "${invitation.title}".`
        );
      }
    } catch {
      // Non-blocking notification
    }

    return NextResponse.json({ data: res.signature, message: 'Gửi lưu bút thành công' }, { status: 201 });
  } catch (err) {
    ErrorMonitoring.captureException(err, { route: `/api/v1/invitations/${id}/signatures` });
    return NextResponse.json({ error: 'Lỗi gửi lưu bút' }, { status: 500 });
  }
}
