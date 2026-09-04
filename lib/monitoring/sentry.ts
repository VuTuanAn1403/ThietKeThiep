/**
 * Sentry & Production Error Monitoring Abstraction
 * Supports classified taxonomy, context sanitization, Sentry HTTP dispatch,
 * and security event observability.
 */

export type ErrorClassification =
  | 'AUTH_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'STORAGE_ERROR'
  | 'PAYMENT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'OAUTH_ERROR'
  | 'NOT_FOUND'
  | 'UNEXPECTED_CLIENT_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export interface ErrorContext {
  route?: string;
  method?: string;
  userId?: string;
  role?: string;
  invitationId?: string;
  requestId?: string;
  classification?: ErrorClassification;
  extra?: Record<string, unknown>;
}

export interface SecurityEventDetails {
  ip?: string;
  userId?: string;
  route?: string;
  action: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

const SENSITIVE_KEYS = [
  'password',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'serviceRoleKey',
  'service_role_key',
  'authorization',
  'cookie',
  'creditCard',
  'cardNumber',
  'cvv',
  'privateKey',
];

export function sanitizeData(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export class ErrorMonitoring {
  private static getSentryDsn(): string | null {
    const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (dsn && !dsn.includes('placeholder') && dsn.startsWith('http')) {
      return dsn;
    }
    return null;
  }

  /**
   * Dispatch error event to Sentry via HTTP API
   */
  private static async dispatchToSentry(payload: Record<string, unknown>) {
    const dsn = this.getSentryDsn();
    if (!dsn) return;

    try {
      const urlObj = new URL(dsn);
      const projectId = urlObj.pathname.replace(/^\//, '');
      const publicKey = urlObj.username;
      const endpoint = `${urlObj.protocol}//${urlObj.host}/api/${projectId}/store/?sentry_version=7&sentry_key=${publicKey}&sentry_client=nhacotiec/1.0.0`;

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=nhacotiec/1.0.0, sentry_key=${publicKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // Sentry dispatch failure should never crash the main thread
    }
  }

  /**
   * Capture and report an exception with non-sensitive contextual metadata
   */
  static captureException(error: unknown, context?: ErrorContext) {
    const timestamp = new Date().toISOString();
    const classification: ErrorClassification = context?.classification || 'INTERNAL_SERVER_ERROR';
    const sanitizedContext = context ? sanitizeData(context) : {};

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Unknown Application Error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Dispatch to Sentry in production
    if (this.getSentryDsn()) {
      this.dispatchToSentry({
        timestamp,
        level: 'error',
        message: `[${classification}] ${errorMessage}`,
        exception: {
          values: [
            {
              type: classification,
              value: errorMessage,
              stacktrace: errorStack ? { frames: [{ filename: errorStack }] } : undefined,
            },
          ],
        },
        tags: {
          classification,
          route: context?.route,
          method: context?.method,
          role: context?.role,
          requestId: context?.requestId,
          environment: process.env.NODE_ENV || 'production',
        },
        user: context?.userId ? { id: context.userId } : undefined,
        extra: sanitizedContext,
      });
    }

    // Local logging for dev/debugging
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.error('[ErrorMonitoring]', {
        timestamp,
        classification,
        requestId: context?.requestId,
        error: { message: errorMessage, stack: errorStack },
        context: sanitizedContext,
      });
    }
  }

  /**
   * Capture a custom message
   */
  static captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: ErrorContext
  ) {
    const sanitizedContext = context ? sanitizeData(context) : {};

    if (this.getSentryDsn()) {
      this.dispatchToSentry({
        timestamp: new Date().toISOString(),
        level,
        message,
        tags: {
          classification: context?.classification || 'INTERNAL_SERVER_ERROR',
          route: context?.route,
          requestId: context?.requestId,
        },
        extra: sanitizedContext,
      });
    }

    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.log(`[ErrorMonitoring][${level.toUpperCase()}] ${message}`, sanitizedContext);
    }
  }

  /**
   * Log security events (e.g. repeated failed login, rate limit breaches, admin suspensions)
   */
  static logSecurityEvent(event: SecurityEventDetails, level: 'warning' | 'error' = 'warning') {
    const sanitizedDetails = sanitizeData(event);

    this.captureMessage(
      `[SECURITY_EVENT] ${event.action} - ${event.reason || 'Security trigger'}`,
      level,
      {
        classification: 'RATE_LIMIT_ERROR',
        route: event.route,
        userId: event.userId,
        extra: sanitizedDetails,
      }
    );
  }

  /**
   * Performance monitoring tracker for slow operations / latency monitoring
   */
  static trackPerformance(operation: string, durationMs: number, thresholdMs: number = 1000) {
    if (durationMs > thresholdMs) {
      this.captureMessage(
        `[SLOW_OPERATION] ${operation} took ${durationMs}ms (threshold ${thresholdMs}ms)`,
        'warning',
        {
          extra: { operation, durationMs, thresholdMs },
        }
      );
    }
  }
}
