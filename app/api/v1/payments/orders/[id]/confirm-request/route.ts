import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { requireAuth } from '@/lib/auth/server-auth';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error || 'Chưa đăng nhập' }, { status: auth.statusCode || 401 });
  }

  const { id } = await params;
  try {
    const res = await PaymentService.confirmPaymentRequest(id, auth.user.id);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      data: res.order,
      message: 'Yêu cầu xác nhận thanh toán đã được gửi tới hệ thống.',
    });
  } catch (err) {
    ErrorMonitoring.captureException(err, { route: `/api/v1/payments/orders/${id}/confirm-request` });
    return NextResponse.json({ error: 'Lỗi xác nhận thanh toán' }, { status: 500 });
  }
}
