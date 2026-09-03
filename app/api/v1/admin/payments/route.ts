import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { requireAdmin } from '@/lib/auth/server-auth';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.user || auth.user.role !== 'ADMIN') {
    return NextResponse.json({ error: auth.error || 'Yêu cầu quyền Quản trị viên' }, { status: auth.statusCode || 403 });
  }

  const orders = await PaymentService.getAllOrders();
  return NextResponse.json({ data: orders });
}
