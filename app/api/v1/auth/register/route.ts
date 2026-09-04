import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit(request, 'register');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, mật khẩu và họ tên là bắt buộc' },
        { status: 422 }
      );
    }

    const res = await AuthService.register({ email, password, fullName, confirmPassword: password });
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ user: res.user, message: 'Đăng ký thành công' }, { status: 201 });
  } catch (err) {
    ErrorMonitoring.captureException(err, { route: '/api/v1/auth/register' });
    return NextResponse.json({ error: 'Lỗi xử lý yêu cầu' }, { status: 500 });
  }
}
