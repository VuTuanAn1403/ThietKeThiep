import { NextRequest, NextResponse } from 'next/server';
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

  const categories = await AdminService.getCategories();
  return NextResponse.json({ data: categories });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user || auth.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: auth.error || 'Yêu cầu quyền Quản trị viên' },
      { status: auth.statusCode || 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, slug, description } = body;
    if (!name || !slug) {
      return NextResponse.json({ error: 'Tên và đường dẫn slug là bắt buộc' }, { status: 400 });
    }

    const created = await AdminService.createCategory(name, slug, description);
    return NextResponse.json({ data: created, message: 'Tạo danh mục thành công' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Lỗi xử lý yêu cầu' }, { status: 500 });
  }
}
