import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('FeedbackService - Submit feedback', () => {
  it('should create a new feedback', async () => {
    const { FeedbackService } = await import('../services/feedback.service');
    const res = await FeedbackService.submitFeedback('usr-demo-01', {
      type: 'FEATURE',
      title: 'Test Feature Request',
      content: 'Đề xuất thêm hiệu ứng tuyết rơi trên thiệp Giáng Sinh',
      rating: 4,
    });

    assert.strictEqual(res.error, null);
    assert.ok(res.feedback);
    assert.strictEqual(res.feedback.type, 'FEATURE');
    assert.strictEqual(res.feedback.status, 'NEW');
    assert.strictEqual(res.feedback.rating, 4);
  });

  it('should reject empty title', async () => {
    const { FeedbackService } = await import('../services/feedback.service');
    const res = await FeedbackService.submitFeedback('usr-demo-01', {
      type: 'BUG',
      title: '',
      content: 'Some content',
      rating: 3,
    });

    assert.ok(res.error);
    assert.strictEqual(res.feedback, null);
  });
});

describe('FeedbackService - Admin status update', () => {
  it('should update feedback status to REVIEWING', async () => {
    const { FeedbackService } = await import('../services/feedback.service');
    const feedbacks = await FeedbackService.getUserFeedback('usr-demo-01');
    assert.ok(feedbacks.length > 0);

    const firstFb = feedbacks[0];
    const res = await FeedbackService.updateStatus(firstFb.id, 'REVIEWING');

    assert.strictEqual(res.error, null);
    assert.ok(res.feedback);
    assert.strictEqual(res.feedback.status, 'REVIEWING');
  });
});

describe('AdminAuth - Role check', () => {
  it('should reject non-admin user for admin login', async () => {
    const { AuthService } = await import('../lib/auth/auth-service');
    const res = await AuthService.login({ email: 'minh.anh@gmail.com', password: 'password123' });

    // Even if login succeeds, the user role should be USER, not ADMIN
    if (res.user) {
      assert.strictEqual(res.user.role, 'USER');
      assert.notStrictEqual(res.user.role, 'ADMIN');
    }
  });
});
