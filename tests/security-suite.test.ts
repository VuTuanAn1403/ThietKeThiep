import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit, enforceRateLimit } from '../lib/security/rate-limiter';
import { ErrorMonitoring, sanitizeData } from '../lib/monitoring/sentry';

describe('SECURITY SUITE: RATE LIMITING & ANTI-ABUSE', () => {
  it('1. DIFFERENTIATED LIMITS: Login limit enforces 5 requests', () => {
    const ip = `192.168.10.${Math.floor(Math.random() * 9000)}`;
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(ip, 'login');
      assert.strictEqual(res.allowed, true);
    }
    const blocked = checkRateLimit(ip, 'login');
    assert.strictEqual(blocked.allowed, false);
    assert.strictEqual(blocked.remaining, 0);
  });

  it('2. DIFFERENTIATED LIMITS: RSVP limit enforces 10 requests', () => {
    const ip = `192.168.20.${Math.floor(Math.random() * 9000)}`;
    for (let i = 0; i < 10; i++) {
      const res = checkRateLimit(ip, 'rsvp', 'inv-123');
      assert.strictEqual(res.allowed, true);
    }
    const blocked = checkRateLimit(ip, 'rsvp', 'inv-123');
    assert.strictEqual(blocked.allowed, false);
  });

  it('3. COMPOSITE KEYS: Different invitations have isolated rate quotas', () => {
    const ip = `192.168.30.${Math.floor(Math.random() * 9000)}`;
    // Exhaust limit on inv-A
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip, 'rsvp', 'inv-A');
    }
    const blockedA = checkRateLimit(ip, 'rsvp', 'inv-A');
    assert.strictEqual(blockedA.allowed, false);

    // inv-B for same IP should still be allowed!
    const allowedB = checkRateLimit(ip, 'rsvp', 'inv-B');
    assert.strictEqual(allowedB.allowed, true);
    assert.strictEqual(allowedB.remaining, 9);
  });

  it('4. HTTP 429 & RETRY-AFTER: Exceeded rate limit returns standard 429 response', async () => {
    const ip = `172.16.1.${Math.floor(Math.random() * 9000)}`;
    const mockRequest = new Request('http://localhost:3000/api/v1/auth/login', {
      headers: { 'x-forwarded-for': ip },
    });

    // Exhaust 5 allowed logins
    for (let i = 0; i < 5; i++) {
      await enforceRateLimit(mockRequest, 'login');
    }

    // 6th attempt must trigger 429
    const response = await enforceRateLimit(mockRequest, 'login');
    assert.ok(response !== null);
    assert.strictEqual(response.status, 429);

    const body = await response.json();
    assert.strictEqual(body.error, 'TOO_MANY_REQUESTS');
    assert.ok(body.message);

    const retryAfter = response.headers.get('Retry-After');
    assert.ok(retryAfter);
    assert.ok(Number(retryAfter) > 0);
  });

  it('5. UPLOAD LIMIT: Enforces 10 uploads per window', () => {
    const ip = `10.10.10.${Math.floor(Math.random() * 9000)}`;
    for (let i = 0; i < 10; i++) {
      const res = checkRateLimit(ip, 'upload');
      assert.strictEqual(res.allowed, true);
    }
    const blocked = checkRateLimit(ip, 'upload');
    assert.strictEqual(blocked.allowed, false);
  });

  it('6. PAYMENT LIMIT: Enforces 5 payment orders per window', () => {
    const ip = `10.20.20.${Math.floor(Math.random() * 9000)}`;
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(ip, 'payment');
      assert.strictEqual(res.allowed, true);
    }
    const blocked = checkRateLimit(ip, 'payment');
    assert.strictEqual(blocked.allowed, false);
  });
});

describe('SECURITY SUITE: SENTRY & SENSITIVE DATA REDACTION', () => {
  it('1. REDACTION: Strips passwords, tokens, API keys and secrets from context', () => {
    const rawContext = {
      username: 'testuser',
      password: 'superSecretPassword123!',
      token: 'jwt-bearer-token-xyz',
      nested: {
        apiKey: 'sk_live_123456789',
        normalField: 'hello world',
      },
    };

    const sanitized = sanitizeData(rawContext);
    assert.strictEqual(sanitized.username, 'testuser');
    assert.strictEqual(sanitized.password, '[REDACTED]');
    assert.strictEqual(sanitized.token, '[REDACTED]');

    const nested = sanitized.nested as Record<string, unknown>;
    assert.strictEqual(nested.apiKey, '[REDACTED]');
    assert.strictEqual(nested.normalField, 'hello world');
  });

  it('2. SENTRY EXCEPTION: Handles errors gracefully without crashing', () => {
    assert.doesNotThrow(() => {
      ErrorMonitoring.captureException(new Error('Test handled error'), {
        route: '/api/v1/test',
        classification: 'DATABASE_ERROR',
        userId: 'usr-123',
      });
    });
  });

  it('3. SECURITY EVENT: Logs security events with classification', () => {
    assert.doesNotThrow(() => {
      ErrorMonitoring.logSecurityEvent({
        action: 'FAILED_LOGIN_EXCEEDED',
        ip: '1.2.3.4',
        reason: '5 failed login attempts in 15 minutes',
      });
    });
  });

  it('4. PERFORMANCE TRACKER: Flags slow operations exceeding threshold', () => {
    assert.doesNotThrow(() => {
      ErrorMonitoring.trackPerformance('DATABASE_QUERY_INVITATIONS', 1500, 1000);
    });
  });
});

describe('SECURITY SUITE: HEALTH CHECK VERIFICATION', () => {
  it('1. HEALTH CHECK: Returns status ok and does not leak credentials', async () => {
    // Dynamically import GET handler from route
    const { GET } = await import('../app/api/health/route');
    const response = await GET();

    assert.strictEqual(response.status, 200);
    const body = await response.json();

    assert.strictEqual(body.status, 'healthy');
    assert.ok(body.timestamp);
    assert.ok(body.services);
    assert.strictEqual(body.services.database, 'operational');
    assert.strictEqual(body.services.auth, 'operational');

    // Verify no sensitive keys leaked in JSON
    const bodyStr = JSON.stringify(body);
    assert.strictEqual(bodyStr.includes('password'), false);
    assert.strictEqual(bodyStr.includes('service_role'), false);
    assert.strictEqual(bodyStr.includes('postgres://'), false);
    assert.strictEqual(bodyStr.includes('SECRET'), false);
  });
});
