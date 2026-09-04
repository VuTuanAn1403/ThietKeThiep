import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server-auth';
import { AdminService } from '@/services/admin.service';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user || auth.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: auth.error || 'Yêu cầu quyền Quản trị viên' },
      { status: auth.statusCode || 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;

  const users = await AdminService.getUsers(search);
  return NextResponse.json({ data: users });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user || auth.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: auth.error || 'Yêu cầu quyền Quản trị viên' },
      { status: auth.statusCode || 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId là bắt buộc' }, { status: 400 });
    }

    const updated = await AdminService.toggleUserStatus(userId);
    if (!updated) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    return NextResponse.json({ data: updated, message: 'Cập nhật trạng thái thành công' });
  } catch {
    return NextResponse.json({ error: 'Lỗi xử lý yêu cầu' }, { status: 500 });
  }
}
