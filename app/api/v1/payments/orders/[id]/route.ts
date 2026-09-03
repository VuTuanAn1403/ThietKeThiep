import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { requireAuth } from '@/lib/auth/server-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error || 'Chưa đăng nhập' }, { status: auth.statusCode || 401 });
  }

  const { id } = await params;
  const order = await PaymentService.getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 });
  }

  // Security check: Only the order owner or ADMIN can view
  if (order.user_id !== auth.user.id && auth.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Bạn không có quyền truy cập đơn hàng này' }, { status: 403 });
  }

  return NextResponse.json({ data: order });
}
