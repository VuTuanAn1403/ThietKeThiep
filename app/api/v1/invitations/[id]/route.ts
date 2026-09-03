import { NextResponse } from 'next/server';
import { InvitationService } from '@/services/invitation.service';
import { requireInvitationOwnership } from '@/lib/auth/server-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireInvitationOwnership(id);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
  }

  const invitation = await InvitationService.getInvitationById(id);
  if (!invitation) {
    return NextResponse.json({ error: 'Không tìm thấy thiệp mời' }, { status: 404 });
  }
  return NextResponse.json({ data: invitation });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireInvitationOwnership(id);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
  }

  try {
    const body = await request.json();
    const res = await InvitationService.updateInvitation(id, body);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 422 });
    }
    return NextResponse.json({ data: res.invitation, message: 'Cập nhật thành công' });
  } catch {
    return NextResponse.json({ error: 'Lỗi cập nhật thiệp' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireInvitationOwnership(id);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
  }

  const success = await InvitationService.deleteInvitation(id);
  if (!success) {
    return NextResponse.json({ error: 'Lỗi khi xóa thiệp' }, { status: 500 });
  }
  return NextResponse.json({ message: 'Đã xóa thiệp thành công' });
}
