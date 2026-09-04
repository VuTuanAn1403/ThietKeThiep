import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit(request, 'login');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu quản trị là bắt buộc' },
        { status: 422 }
      );
    }

    const res = await AuthService.login({ email, password });
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 401 });
    }

    if (res.user?.role !== 'ADMIN') {
      await AuthService.logout();
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'Tài khoản không có quyền quản trị viên' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { user: res.user, message: 'Đăng nhập Quản Trị thành công' },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi xử lý yêu cầu' }, { status: 500 });
  }
}
