import { PaymentOrder, PaymentOrderStatus } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';
import { PAYMENT_CONFIG, defaultPaymentProvider } from '@/lib/payment/config';
import { SubscriptionService } from '@/services/subscription.service';
import { NotificationService } from '@/services/notification.service';
import { AuditService } from '@/services/audit.service';

export class PaymentService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  /**
   * Generate a unique order code, e.g. ZLP3018, ZLP8942
   */
  static generateOrderCode(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = 'ZLP';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create or reuse an unexpired payment order
   */
  static async createOrder(
    userId: string,
    planId: string,
    discountCode?: string
  ): Promise<{ order?: PaymentOrder; error?: string }> {
    // 1. Fetch official plan from database (Server-side price authority)
    const plans = await SubscriptionService.getPlans();
    const targetPlan = plans.find((p) => p.id === planId);
    if (!targetPlan) {
      return { error: 'Gói dịch vụ không tồn tại' };
    }

    if (targetPlan.price_vnd <= 0) {
      return { error: 'Gói dịch vụ này là miễn phí, không cần thanh toán' };
    }

    // 2. Check Idempotency: Reuse active unexpired order if exists
    const now = new Date();
    const existingOrders = await this.getUserOrders(userId);
    const reusableOrder = existingOrders.find(
      (o) =>
        o.subscription_plan_id === planId &&
        (o.status === 'PENDING' || o.status === 'WAITING_CONFIRMATION') &&
        new Date(o.expires_at) > now
    );

    if (reusableOrder) {
      return { order: reusableOrder };
    }

    // 3. Calculate server-side price & discount
    const originalAmount = targetPlan.price_vnd;
    let discountAmount = 0;
    if (discountCode && discountCode.trim()) {
      const cleanCode = discountCode.trim().toUpperCase();
      discountAmount = PAYMENT_CONFIG.VALID_DISCOUNT_CODES[cleanCode] || 0;
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);
    const orderCode = this.generateOrderCode();

    // 4. Generate QR Details via Provider
    const providerResult = await defaultPaymentProvider.createPayment(orderCode, finalAmount);

    const newOrder: PaymentOrder = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      subscription_plan_id: planId,
      order_code: orderCode,
      amount: originalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      currency: 'VND',
      payment_method: 'QR_TRANSFER',
      status: 'PENDING',
      transfer_content: providerResult.transferContent,
      bank_name: providerResult.bankName,
      account_number: providerResult.accountNumber,
      account_name: providerResult.accountName,
      qr_code_url: providerResult.qrCodeUrl,
      expires_at: providerResult.expiresAt,
      paid_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('payment_orders')
          .insert(newOrder)
          .select()
          .single();

        if (!error && data) return { order: data as PaymentOrder };
      } catch (err) {
        console.error('Supabase createOrder error:', err);
      }
    }

    mockStore.paymentOrders.unshift(newOrder);
    return { order: newOrder };
  }

  static async getOrderById(orderId: string): Promise<PaymentOrder | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('payment_orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (!error && data) return data as PaymentOrder;
      } catch (err) {
        console.error('Supabase getOrderById error:', err);
      }
    }

    const order = mockStore.paymentOrders.find((o) => o.id === orderId);
    if (order) {
      this.checkAndExpireOrder(order);
      return order;
    }
    return null;
  }

  static async getOrderByCode(orderCode: string): Promise<PaymentOrder | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('payment_orders')
          .select('*')
          .eq('order_code', orderCode)
          .single();

        if (!error && data) return data as PaymentOrder;
      } catch (err) {
        console.error('Supabase getOrderByCode error:', err);
      }
    }

    const order = mockStore.paymentOrders.find((o) => o.order_code === orderCode);
    if (order) {
      this.checkAndExpireOrder(order);
      return order;
    }
    return null;
  }

  static async getUserOrders(userId: string): Promise<PaymentOrder[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('payment_orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as PaymentOrder[];
      } catch (err) {
        console.error('Supabase getUserOrders error:', err);
      }
    }

    return mockStore.paymentOrders
      .filter((o) => o.user_id === userId)
      .map((o) => {
        this.checkAndExpireOrder(o);
        return o;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getAllOrders(): Promise<PaymentOrder[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('payment_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) return data as PaymentOrder[];
      } catch (err) {
        console.error('Supabase getAllOrders error:', err);
      }
    }

    return mockStore.paymentOrders
      .map((o) => {
        this.checkAndExpireOrder(o);
        return o;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * User clicks "Tôi đã thanh toán"
   * Moves status: PENDING -> WAITING_CONFIRMATION
   */
  static async confirmPaymentRequest(
    orderId: string,
    userId: string
  ): Promise<{ success: boolean; order?: PaymentOrder; error?: string }> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      return { success: false, error: 'Đơn hàng không tồn tại' };
    }

    if (order.user_id !== userId) {
      return { success: false, error: 'Bạn không có quyền truy cập đơn hàng này' };
    }

    if (order.status === 'PAID') {
      return { success: true, order };
    }

    if (new Date(order.expires_at) < new Date()) {
      order.status = 'EXPIRED';
      return { success: false, error: 'Giao dịch đã hết thời gian thanh toán. Vui lòng tạo giao dịch mới.' };
    }

    const now = new Date().toISOString();
    order.status = 'WAITING_CONFIRMATION';
    order.updated_at = now;

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase
          .from('payment_orders')
          .update({ status: 'WAITING_CONFIRMATION', updated_at: now })
          .eq('id', orderId);
      } catch (err) {
        console.error('Supabase confirmPaymentRequest error:', err);
      }
    }

    return { success: true, order };
  }

  /**
   * Admin approves payment
   * Moves status: WAITING_CONFIRMATION / PENDING -> PAID
   * Activates Subscription for user
   */
  static async adminApprovePayment(
    orderId: string,
    adminId: string
  ): Promise<{ success: boolean; order?: PaymentOrder; error?: string }> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      return { success: false, error: 'Đơn hàng không tồn tại' };
    }

    if (order.status === 'EXPIRED') {
      return { success: false, error: 'Không thể duyệt đơn hàng đã hết hạn' };
    }

    const now = new Date().toISOString();
    order.status = 'PAID';
    order.paid_at = now;
    order.updated_at = now;

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase
          .from('payment_orders')
          .update({ status: 'PAID', paid_at: now, updated_at: now })
          .eq('id', orderId);
      } catch (err) {
        console.error('Supabase adminApprovePayment error:', err);
      }
    }

    // 1. Activate subscription
    await SubscriptionService.upgradeSubscription(order.user_id, order.subscription_plan_id);

    // 2. Send notification to user
    await NotificationService.createNotification(
      order.user_id,
      'SYSTEM_ALERT',
      'Thanh toán thành công 🎉',
      `Đơn hàng #${order.order_code} đã được xác nhận. Gói dịch vụ đã được kích hoạt thành công!`
    );

    // 3. Log Audit Trail
    await AuditService.logAdminAction(
      adminId,
      'APPROVE_PAYMENT',
      'PAYMENT_ORDER',
      order.order_code
    );

    return { success: true, order };
  }

  /**
   * Admin rejects payment
   * Moves status -> FAILED
   */
  static async adminRejectPayment(
    orderId: string,
    adminId: string,
    reason?: string
  ): Promise<{ success: boolean; order?: PaymentOrder; error?: string }> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      return { success: false, error: 'Đơn hàng không tồn tại' };
    }

    const now = new Date().toISOString();
    order.status = 'FAILED';
    order.updated_at = now;

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase
          .from('payment_orders')
          .update({ status: 'FAILED', updated_at: now })
          .eq('id', orderId);
      } catch (err) {
        console.error('Supabase adminRejectPayment error:', err);
      }
    }

    // Send notification to user
    await NotificationService.createNotification(
      order.user_id,
      'SYSTEM_ALERT',
      'Thanh toán chưa được xác nhận ⚠️',
      `Đơn hàng #${order.order_code} chưa thể xác nhận thanh toán.${reason ? ` Lý do: ${reason}` : ' Vui lòng liên hệ bộ phận hỗ trợ.'}`
    );

    // Log Audit Trail
    await AuditService.logAdminAction(
      adminId,
      'REJECT_PAYMENT',
      'PAYMENT_ORDER',
      order.order_code
    );

    return { success: true, order };
  }

  private static checkAndExpireOrder(order: PaymentOrder) {
    if (order.status === 'PENDING' && new Date(order.expires_at) < new Date()) {
      order.status = 'EXPIRED';
      order.updated_at = new Date().toISOString();
    }
  }
}
