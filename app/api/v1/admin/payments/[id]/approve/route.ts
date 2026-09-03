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
    const res = await PaymentService.adminApprovePayment(id, auth.user.id);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      data: res.order,
      message: 'Đã xác nhận thanh toán và kích hoạt gói dịch vụ thành công.',
    });
  } catch (err) {
    ErrorMonitoring.captureException(err, { route: `/api/v1/admin/payments/${id}/approve` });
    return NextResponse.json({ error: 'Lỗi duyệt thanh toán' }, { status: 500 });
  }
}
