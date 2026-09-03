import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { requireAuth } from '@/lib/auth/server-auth';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error || 'Chưa đăng nhập' }, { status: auth.statusCode || 401 });
  }

  const orders = await PaymentService.getUserOrders(auth.user.id);
  return NextResponse.json({ data: orders });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error || 'Chưa đăng nhập' }, { status: auth.statusCode || 401 });
  }

  try {
    const body = await request.json();
    const { planId, discountCode } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Mã gói dịch vụ (planId) là bắt buộc' }, { status: 422 });
    }

    const res = await PaymentService.createOrder(auth.user.id, planId, discountCode);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ data: res.order, message: 'Tạo đơn thanh toán thành công' }, { status: 201 });
  } catch (err) {
    ErrorMonitoring.captureException(err, { route: '/api/v1/payments/orders' });
    return NextResponse.json({ error: 'Lỗi tạo đơn hàng thanh toán' }, { status: 500 });
  }
}
