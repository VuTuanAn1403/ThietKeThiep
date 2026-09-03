import { NextResponse } from 'next/server';
import { InvitationService } from '@/services/invitation.service';
import { requireAuth } from '@/lib/auth/server-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error || 'Chưa đăng nhập' }, { status: auth.statusCode || 401 });
  }

  const list = await InvitationService.getUserInvitations(auth.user.id);
  return NextResponse.json({ data: list });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error || 'Chưa đăng nhập' }, { status: auth.statusCode || 401 });
  }

  try {
    const body = await request.json();
    const { templateId, categoryId, ...inputData } = body;

    // Always use verified server-side authenticated user ID
    const res = await InvitationService.createInvitation(auth.user.id, templateId, categoryId, inputData);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 422 });
    }
    return NextResponse.json({ data: res.invitation, message: 'Tạo thiệp thành công' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Lỗi tạo thiệp' }, { status: 500 });
  }
}
