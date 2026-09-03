import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { PaymentService } from '../services/payment.service';
import { SubscriptionService } from '../services/subscription.service';
import { mockStore } from '../lib/supabase/mock-store';

describe('QR PAYMENT & SUBSCRIPTION ACTIVATION LIFECYCLE', () => {
  const testUserId = 'usr-demo-01';
  const adminUserId = 'usr-admin-01';

  it('1. CREATE PAYMENT ORDER: Creates valid order with ZLP code and 10-minute expiry', async () => {
    const res = await PaymentService.createOrder(testUserId, 'plan-basic');
    assert.ok(res.order, 'Order must be created');
    assert.ok(res.order.order_code.startsWith('ZLP'), 'Order code must start with ZLP');
    assert.strictEqual(res.order.status, 'PENDING');
    assert.strictEqual(res.order.amount, 299000);
    assert.strictEqual(res.order.final_amount, 299000);
    assert.strictEqual(res.order.discount_amount, 0);

    const expiry = new Date(res.order.expires_at).getTime();
    const now = Date.now();
    assert.ok(expiry > now + 9 * 60 * 1000, 'Expires at should be ~10 minutes in the future');
  });

  it('2. PRICE & DISCOUNT: Calculates server-side price and valid discount (PROMO130)', async () => {
    // Force new code by removing previous orders in mock store for clean test
    mockStore.paymentOrders = mockStore.paymentOrders.filter(o => o.user_id !== 'usr-discount-test');

    const res = await PaymentService.createOrder('usr-discount-test', 'plan-basic', 'PROMO130');
    assert.ok(res.order);
    assert.strictEqual(res.order.amount, 299000);
    assert.strictEqual(res.order.discount_amount, 130000);
    assert.strictEqual(res.order.final_amount, 169000);
  });

  it('3. IDEMPOTENCY: Reuses active unexpired order on repeated submit', async () => {
    const res1 = await PaymentService.createOrder('usr-idempotency-test', 'plan-premium');
    assert.ok(res1.order);

    const res2 = await PaymentService.createOrder('usr-idempotency-test', 'plan-premium');
    assert.ok(res2.order);
    assert.strictEqual(res1.order.id, res2.order.id, 'Must reuse identical active order');
    assert.strictEqual(res1.order.order_code, res2.order.order_code);
  });

  it('4. USER CONFIRMATION: "Tôi đã thanh toán" updates status to WAITING_CONFIRMATION', async () => {
    const res = await PaymentService.createOrder('usr-confirm-test', 'plan-basic');
    assert.ok(res.order);

    const confirmRes = await PaymentService.confirmPaymentRequest(res.order.id, 'usr-confirm-test');
    assert.strictEqual(confirmRes.success, true);
    assert.strictEqual(confirmRes.order?.status, 'WAITING_CONFIRMATION');
  });

  it('5. SECURITY: Non-owner cannot confirm someone else payment order', async () => {
    const res = await PaymentService.createOrder('usr-owner-01', 'plan-basic');
    assert.ok(res.order);

    const evilConfirm = await PaymentService.confirmPaymentRequest(res.order.id, 'usr-attacker-99');
    assert.strictEqual(evilConfirm.success, false);
    assert.ok(evilConfirm.error?.includes('quyền'));
  });

  it('6. ADMIN APPROVAL: Admin approves payment -> status PAID and activates Subscription', async () => {
    const targetUser = 'usr-activation-test';
    const createRes = await PaymentService.createOrder(targetUser, 'plan-premium');
    assert.ok(createRes.order);

    // Initial subscription before approval
    const subBefore = await SubscriptionService.getUserSubscription(targetUser);
    assert.strictEqual(subBefore.plan.id, 'plan-free');

    // Admin approves
    const approveRes = await PaymentService.adminApprovePayment(createRes.order.id, adminUserId);
    assert.strictEqual(approveRes.success, true);
    assert.strictEqual(approveRes.order?.status, 'PAID');
    assert.ok(approveRes.order?.paid_at !== null);

    // Subscription after approval must now be PREMIUM
    const subAfter = await SubscriptionService.getUserSubscription(targetUser);
    assert.strictEqual(subAfter.plan.id, 'plan-premium');
    assert.strictEqual(subAfter.subscription?.is_active, true);
  });

  it('7. ADMIN REJECTION: Admin rejects payment -> status FAILED', async () => {
    const createRes = await PaymentService.createOrder('usr-reject-test', 'plan-basic');
    assert.ok(createRes.order);

    const rejectRes = await PaymentService.adminRejectPayment(createRes.order.id, adminUserId, 'Sai nội dung chuyển khoản');
    assert.strictEqual(rejectRes.success, true);
    assert.strictEqual(rejectRes.order?.status, 'FAILED');
  });

  it('8. EXPIRATION: Expired order cannot be approved', async () => {
    const createRes = await PaymentService.createOrder('usr-expired-test', 'plan-basic');
    assert.ok(createRes.order);

    // Manually simulate past expiration
    createRes.order.expires_at = new Date(Date.now() - 3600000).toISOString();
    createRes.order.status = 'EXPIRED';

    const approveExpired = await PaymentService.adminApprovePayment(createRes.order.id, adminUserId);
    assert.strictEqual(approveExpired.success, false);
    assert.ok(approveExpired.error?.includes('hết hạn'));
  });

  it('9. USER PAYMENT HISTORY: User only retrieves their own orders', async () => {
    const userA = 'usr-filter-a';
    const userB = 'usr-filter-b';

    await PaymentService.createOrder(userA, 'plan-basic');
    await PaymentService.createOrder(userB, 'plan-premium');

    const ordersA = await PaymentService.getUserOrders(userA);
    assert.ok(ordersA.every(o => o.user_id === userA));
    assert.ok(!ordersA.some(o => o.user_id === userB));
  });
});
