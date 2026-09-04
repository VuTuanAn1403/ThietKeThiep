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
