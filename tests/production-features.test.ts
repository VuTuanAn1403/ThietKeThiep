import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit } from '../lib/security/rate-limiter';
import { verifyTurnstileToken } from '../lib/security/captcha';
import { NotificationService } from '../services/notification.service';
import { AuditService } from '../services/audit.service';
import { AnalyticsService } from '../services/analytics.service';
import { mockStore } from '../lib/supabase/mock-store';

describe('PRODUCTION FEATURES & SECURITY ENHANCEMENTS', () => {
  it('1. RATE LIMIT: Normal request succeeds within limit', () => {
    const testIp = `192.168.1.${Math.floor(Math.random() * 1000)}`;
    const res1 = checkRateLimit(testIp, 'login');
    assert.strictEqual(res1.allowed, true);
    assert.strictEqual(res1.remaining, 4); // Limit is 5
  });

  it('2. RATE LIMIT: Excessive requests return allowed=false (429 condition)', () => {
    const testIp = `10.0.0.${Math.floor(Math.random() * 1000)}`;
    // Fire 5 requests
    for (let i = 0; i < 5; i++) {
      checkRateLimit(testIp, 'login');
    }
    // 6th request must be blocked
    const res6 = checkRateLimit(testIp, 'login');
    assert.strictEqual(res6.allowed, false);
    assert.strictEqual(res6.remaining, 0);
  });

  it('3. CAPTCHA: Valid token is accepted', async () => {
    const res = await verifyTurnstileToken('mock-valid-turnstile-token');
    assert.strictEqual(res.success, true);
  });

  it('4. CAPTCHA: Invalid token is rejected', async () => {
    const res = await verifyTurnstileToken('invalid-captcha-token');
    assert.strictEqual(res.success, false);
    assert.ok(res.error);
  });

  it('5. NOTIFICATION: Create notification and query unread count', async () => {
    const userId = 'usr-demo-01';
    const beforeCount = await NotificationService.getUnreadCount(userId);

    const created = await NotificationService.createNotification(
      userId,
      'RSVP_RECEIVED',
      'Test RSVP',
      'Khách mời Nguyễn Văn C đã xác nhận tham dự'
    );
    assert.ok(created.id);
    assert.strictEqual(created.read_at, null);

    const afterCount = await NotificationService.getUnreadCount(userId);
    assert.strictEqual(afterCount, beforeCount + 1);
  });

  it('6. NOTIFICATION: Mark as read updates read_at timestamp', async () => {
    const userId = 'usr-demo-01';
    const notif = await NotificationService.createNotification(
      userId,
      'WISH_RECEIVED',
      'Test Wish',
      'Lời chúc mừng hạnh phúc'
    );
    assert.strictEqual(notif.read_at, null);

    const success = await NotificationService.markAsRead(notif.id);
    assert.strictEqual(success, true);

    const list = await NotificationService.getUserNotifications(userId);
    const updated = list.find(n => n.id === notif.id);
    assert.ok(updated?.read_at !== null);
  });

  it('7. NOTIFICATION: Mark all as read clears unread count', async () => {
    const userId = 'usr-demo-01';
    await NotificationService.markAllAsRead(userId);
    const unread = await NotificationService.getUnreadCount(userId);
    assert.strictEqual(unread, 0);
  });

  it('8. AUDIT LOG: Admin action is recorded into audit trail', async () => {
    const adminId = 'usr-admin-01';
    const initialCount = (await AuditService.getLogs()).length;

    const log = await AuditService.logAdminAction(
      adminId,
      'UPDATE_CATEGORY',
      'CATEGORY',
      'cat-wedding'
    );
    assert.ok(log.id);
    assert.strictEqual(log.action, 'UPDATE_CATEGORY');

    const logs = await AuditService.getLogs();
    assert.strictEqual(logs.length, initialCount + 1);
    assert.strictEqual(logs[0].action, 'UPDATE_CATEGORY');
  });

  it('9. ANALYTICS: Empty state returns safe zero metrics without throwing', async () => {
    const nonExistentUserId = 'usr-non-existent-999';
    const metrics = await AnalyticsService.getUserOverviewMetrics(nonExistentUserId);
    assert.strictEqual(metrics.totalInvitations, 0);
    assert.strictEqual(metrics.totalGuests, 0);
    assert.strictEqual(metrics.totalViews, 0);
    assert.strictEqual(metrics.totalAttending, 0);
  });
});
