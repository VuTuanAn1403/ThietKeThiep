import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error || 'Chưa đăng nhập' }, { status: auth.statusCode || 401 });
  }
  return NextResponse.json({ user: auth.user });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error || 'Chưa đăng nhập' }, { status: auth.statusCode || 401 });
  }

  try {
    const body = await request.json();

    // Security check: strictly reject any role escalation attempts
    if (body.role !== undefined) {
      return NextResponse.json(
        { error: 'ROLE_ESCALATION_FORBIDDEN', message: 'Không thể tự thay đổi vai trò hoặc cấp quyền quản trị' },
        { status: 403 }
      );
    }

    // Security check: reject self-modifying account status (e.g. unbanning oneself)
    if (body.status !== undefined) {
      return NextResponse.json(
        { error: 'STATUS_MODIFICATION_FORBIDDEN', message: 'Không thể tự thay đổi trạng thái tài khoản' },
        { status: 403 }
      );
    }

    const user = auth.user;
    if (body.fullName) user.full_name = body.fullName;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.avatarUrl !== undefined) user.avatar_url = body.avatarUrl;
    user.updated_at = new Date().toISOString();

    return NextResponse.json({ user, message: 'Cập nhật tài khoản thành công' });
  } catch {
    return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 });
  }
}
