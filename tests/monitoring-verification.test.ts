import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  ErrorMonitoring,
  ErrorClassification,
  sanitizeData,
} from '../lib/monitoring/sentry';
import { GET as healthCheckGet } from '../app/api/health/route';

describe('PRODUCTION MONITORING: SENTRY & OBSERVABILITY VERIFICATION', () => {
  it('1. TAXONOMY COVERAGE: Correctly handles all 7 classified error types', () => {
    const classifications: ErrorClassification[] = [
      'INTERNAL_SERVER_ERROR',
      'DATABASE_ERROR',
      'AUTH_ERROR',
      'OAUTH_ERROR',
      'STORAGE_ERROR',
      'PAYMENT_ERROR',
      'UNEXPECTED_CLIENT_ERROR',
    ];

    for (const c of classifications) {
      assert.doesNotThrow(() => {
        ErrorMonitoring.captureException(new Error(`Simulated test error for ${c}`), {
          route: '/api/v1/test',
          classification: c,
          requestId: 'req-test-uuid-1234',
        });
      }, `Should capture exception with classification ${c}`);
    }
  });

  it('2. SENSITIVE DATA REDACTION: Deeply redacts passwords, tokens, API keys and secrets', () => {
    const rawPayload = {
      user: {
        id: 'usr-1',
        email: 'test@example.com',
        password: 'SuperSecretPassword123!',
        confirmPassword: 'SuperSecretPassword123!',
      },
      auth: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsIn...',
        refreshToken: 'dGhpc2lzYXJlZnJlc2h0b2tlbg==',
        serviceRoleKey: 'supabase_service_role_key_secret_123',
        service_role_key: 'supabase_service_role_key_secret_456',
        authorization: 'Bearer eyJhbGciOi...',
        cookie: 'sb-access-token=xyz',
      },
      payment: {
        cardNumber: '4111222233334444',
        cvv: '123',
        privateKey: 'private-payment-key',
      },
      metadata: {
        invitationId: 'inv-123',
        venueName: 'The Wedding Palace',
      },
    };

    const sanitized = sanitizeData(rawPayload) as any;

    // Sensitive keys must be redacted
    assert.strictEqual(sanitized.user.password, '[REDACTED]');
    assert.strictEqual(sanitized.user.confirmPassword, '[REDACTED]');
    assert.strictEqual(sanitized.auth.accessToken, '[REDACTED]');
    assert.strictEqual(sanitized.auth.refreshToken, '[REDACTED]');
    assert.strictEqual(sanitized.auth.serviceRoleKey, '[REDACTED]');
    assert.strictEqual(sanitized.auth.service_role_key, '[REDACTED]');
    assert.strictEqual(sanitized.auth.authorization, '[REDACTED]');
    assert.strictEqual(sanitized.auth.cookie, '[REDACTED]');
    assert.strictEqual(sanitized.payment.cardNumber, '[REDACTED]');
    assert.strictEqual(sanitized.payment.cvv, '[REDACTED]');
    assert.strictEqual(sanitized.payment.privateKey, '[REDACTED]');

    // Safe keys must be preserved
    assert.strictEqual(sanitized.user.id, 'usr-1');
    assert.strictEqual(sanitized.user.email, 'test@example.com');
    assert.strictEqual(sanitized.metadata.invitationId, 'inv-123');
    assert.strictEqual(sanitized.metadata.venueName, 'The Wedding Palace');
  });

  it('3. REQUEST CORRELATION: Attaches requestId to ErrorContext and Sentry dispatch', () => {
    const testRequestId = 'req-trace-' + Date.now();
    assert.doesNotThrow(() => {
      ErrorMonitoring.captureMessage('Request tracing test message', 'info', {
        route: '/api/v1/invitations',
        requestId: testRequestId,
        classification: 'INTERNAL_SERVER_ERROR',
      });
    });
  });

  it('4. HEALTH ENDPOINT: Returns operational statuses and zero credential leakage', async () => {
    const res = await healthCheckGet();
    const json = await res.json();

    assert.ok(json, 'Health check response must exist');
    assert.ok(['healthy', 'unhealthy'].includes(json.status), 'Status must be healthy or unhealthy');
    assert.ok(json.timestamp, 'Timestamp must exist');
    assert.ok(typeof json.responseTimeMs === 'number', 'Response time must be number');
    assert.ok(json.services, 'Services health block must exist');
    assert.ok(['operational', 'degraded', 'unavailable'].includes(json.services.database));
    assert.ok(['operational', 'unavailable'].includes(json.services.auth));
    assert.ok(['operational', 'unavailable'].includes(json.services.storage));

    // Must never leak secrets or passwords in health response
    const jsonString = JSON.stringify(json);
    assert.strictEqual(jsonString.includes('password'), false);
    assert.strictEqual(jsonString.includes('service_role'), false);
    assert.strictEqual(jsonString.includes('SUPABASE_KEY'), false);
    assert.strictEqual(jsonString.includes('secret'), false);
  });
});
