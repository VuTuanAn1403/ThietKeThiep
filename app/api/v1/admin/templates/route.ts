import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server-auth';
import { AdminService } from '@/services/admin.service';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.user || auth.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: auth.error || 'Yêu cầu quyền Quản trị viên' },
      { status: auth.statusCode || 403 }
    );
  }

  const templates = await AdminService.getTemplates();
  return NextResponse.json({ data: templates });
}
