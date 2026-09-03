import { NextResponse } from 'next/server';
import { GuestService } from '@/services/guest.service';
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

  const list = await GuestService.getGuests(id);
  return NextResponse.json({ data: list });
}

export async function POST(
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
    const res = await GuestService.createGuest(id, body);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 422 });
    }
    return NextResponse.json({ data: res.guest, message: 'Thêm khách mời thành công' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Lỗi thêm khách mời' }, { status: 500 });
  }
}
