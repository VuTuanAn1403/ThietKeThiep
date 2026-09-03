import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000);
}

export type RateLimitAction = 'login' | 'register' | 'rsvp' | 'wish' | 'signature' | 'feedback' | 'default';

const ACTION_LIMITS: Record<RateLimitAction, { limit: number; windowMs: number }> = {
  login: { limit: 5, windowMs: 60000 },       // 5 requests / min
  register: { limit: 5, windowMs: 60000 },    // 5 requests / min
  rsvp: { limit: 10, windowMs: 60000 },       // 10 requests / min
  wish: { limit: 10, windowMs: 60000 },       // 10 requests / min
  signature: { limit: 10, windowMs: 60000 },  // 10 requests / min
  feedback: { limit: 5, windowMs: 60000 },    // 5 requests / min
  default: { limit: 30, windowMs: 60000 },
};

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export function checkRateLimit(
  ip: string,
  action: RateLimitAction = 'default'
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = ACTION_LIMITS[action] || ACTION_LIMITS.default;
  const key = `${action}:${ip}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (record.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.limit - record.count,
    resetTime: record.resetTime,
  };
}

export function enforceRateLimit(request: Request, action: RateLimitAction): NextResponse | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, action);

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
        error: 'Too Many Requests (Rate Limit Exceeded)',
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}
