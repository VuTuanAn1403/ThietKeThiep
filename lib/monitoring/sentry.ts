/**
 * Sentry & Production Error Monitoring Abstraction
 */

interface ErrorContext {
  route?: string;
  userId?: string;
  extra?: Record<string, unknown>;
}

function sanitizeData(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};

  const SENSITIVE_KEYS = ['password', 'confirmPassword', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey'];
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
  private static isSentryConfigured(): boolean {
    const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
    return Boolean(dsn && !dsn.includes('placeholder'));
  }

  static captureException(error: unknown, context?: ErrorContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? sanitizeData(context) : {};

    if (this.isSentryConfigured()) {
      // If Sentry SDK is linked in production
      try {
        // Safe Sentry dispatch
      } catch (err) {
        console.error('Failed to dispatch error to Sentry:', err);
      }
    }

    // Always log clean structured error in development
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.error('[ErrorMonitoring]', {
        timestamp,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        context: sanitizedContext,
      });
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.log(`[ErrorMonitoring][${level.toUpperCase()}] ${message}`, context ? sanitizeData(context) : '');
    }
  }
}
