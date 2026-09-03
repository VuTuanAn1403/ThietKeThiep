import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { mockStore } from '@/lib/supabase/mock-store';

export async function GET() {
  const user = AuthService.getCurrentUserSync();
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const user = AuthService.getCurrentUserSync();
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (body.fullName) user.full_name = body.fullName;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.avatarUrl !== undefined) user.avatar_url = body.avatarUrl;
    user.updated_at = new Date().toISOString();

    return NextResponse.json({ user, message: 'Cập nhật tài khoản thành công' });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 });
  }
}
