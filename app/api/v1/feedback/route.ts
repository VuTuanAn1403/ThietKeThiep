import { NextResponse } from 'next/server';
import { FeedbackService } from '@/services/feedback.service';
import { requireAuth } from '@/lib/auth/server-auth';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { verifyTurnstileToken } from '@/lib/security/captcha';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error || 'Chưa đăng nhập' }, { status: auth.statusCode || 401 });
  }

  // Admin sees all, User sees own
  if (auth.user.role === 'ADMIN') {
    const list = await FeedbackService.getAllFeedback();
    return NextResponse.json({ data: list });
  }

  const list = await FeedbackService.getUserFeedback(auth.user.id);
  return NextResponse.json({ data: list });
}

export async function POST(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, 'feedback');
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await requireAuth();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error || 'Chưa đăng nhập' }, { status: auth.statusCode || 401 });
  }

  try {
    const body = await request.json();
    const { captchaToken, ...feedbackData } = body;

    // CAPTCHA check if provided
    if (captchaToken) {
      const captchaRes = await verifyTurnstileToken(captchaToken);
      if (!captchaRes.success) {
        return NextResponse.json({ error: captchaRes.error || 'Xác thực bảo vệ thất bại' }, { status: 403 });
      }
    }

    const res = await FeedbackService.submitFeedback(auth.user.id, feedbackData);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 422 });
    }

    return NextResponse.json({ data: res.feedback, message: 'Gửi góp ý thành công' }, { status: 201 });
  } catch (err) {
    ErrorMonitoring.captureException(err, { route: '/api/v1/feedback' });
    return NextResponse.json({ error: 'Lỗi gửi góp ý' }, { status: 500 });
  }
}
