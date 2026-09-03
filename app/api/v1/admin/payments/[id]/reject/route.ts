import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { requireAdmin } from '@/lib/auth/server-auth';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.user || auth.user.role !== 'ADMIN') {
    return NextResponse.json({ error: auth.error || 'Yêu cầu quyền Quản trị viên' }, { status: auth.statusCode || 403 });
  }

  const { id } = await params;
  try {
    let reason = '';
    try {
      const body = await request.json();
      reason = body.reason || '';
    } catch {
      // Empty body allowed
    }

    const res = await PaymentService.adminRejectPayment(id, auth.user.id, reason);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      data: res.order,
      message: 'Đã từ chối đơn thanh toán.',
    });
  } catch (err) {
    ErrorMonitoring.captureException(err, { route: `/api/v1/admin/payments/${id}/reject` });
    return NextResponse.json({ error: 'Lỗi từ chối thanh toán' }, { status: 500 });
  }
}
