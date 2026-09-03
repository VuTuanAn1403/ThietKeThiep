import { NextResponse } from 'next/server';
import { GiftService } from '@/services/gift.service';
import { requireInvitationOwnership } from '@/lib/auth/server-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gift = await GiftService.getGiftByInvitationId(id);
  return NextResponse.json({ data: gift });
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
    const res = await GiftService.saveGift(id, body);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 422 });
    }
    return NextResponse.json({ data: res.gift, message: 'Cập nhật quà tặng thành công' });
  } catch {
    return NextResponse.json({ error: 'Lỗi cập nhật quà tặng' }, { status: 500 });
  }
}
