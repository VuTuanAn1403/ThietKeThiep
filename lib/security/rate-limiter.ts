import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window rate limiter (development, testing, fallback)
const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000);
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    (cleanupTimer as NodeJS.Timeout).unref();
  }
}

export type RateLimitAction =
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'rsvp'
  | 'wish'
  | 'signature'
  | 'feedback'
  | 'upload'
  | 'payment'
  | 'analytics'
  | 'default';

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

// Baseline configurable limits
export const ACTION_LIMITS: Record<RateLimitAction, RateLimitConfig> = {
  // Login: 5 requests / 15 minutes / IP
  login: {
    limit: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 5,
    windowMs: Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS) || 15 * 60 * 1000,
  },
  // Register: 5 requests / 1 hour / IP
  register: {
    limit: Number(process.env.RATE_LIMIT_REGISTER_MAX) || 5,
    windowMs: Number(process.env.RATE_LIMIT_REGISTER_WINDOW_MS) || 60 * 60 * 1000,
  },
  // Forgot password: 5 requests / 1 hour / IP
  forgot_password: {
    limit: Number(process.env.RATE_LIMIT_FORGOT_PWD_MAX) || 5,
    windowMs: Number(process.env.RATE_LIMIT_FORGOT_PWD_WINDOW_MS) || 60 * 60 * 1000,
  },
  // RSVP: 10 requests / 10 minutes / IP + invitation
  rsvp: {
    limit: Number(process.env.RATE_LIMIT_RSVP_MAX) || 10,
    windowMs: Number(process.env.RATE_LIMIT_RSVP_WINDOW_MS) || 10 * 60 * 1000,
  },
  // Wishes / Guestbook: 10 requests / 10 minutes / IP + invitation
  wish: {
    limit: Number(process.env.RATE_LIMIT_WISH_MAX) || 10,
    windowMs: Number(process.env.RATE_LIMIT_WISH_WINDOW_MS) || 10 * 60 * 1000,
  },
  // Signature: 10 requests / 10 minutes / IP + invitation
  signature: {
    limit: Number(process.env.RATE_LIMIT_SIGNATURE_MAX) || 10,
    windowMs: Number(process.env.RATE_LIMIT_SIGNATURE_WINDOW_MS) || 10 * 60 * 1000,
  },
  // Feedback: 5 requests / 10 minutes / IP
  feedback: {
    limit: Number(process.env.RATE_LIMIT_FEEDBACK_MAX) || 5,
    windowMs: Number(process.env.RATE_LIMIT_FEEDBACK_WINDOW_MS) || 10 * 60 * 1000,
  },
  // Upload: 10 requests / 10 minutes / IP
  upload: {
    limit: Number(process.env.RATE_LIMIT_UPLOAD_MAX) || 10,
    windowMs: Number(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS) || 10 * 60 * 1000,
  },
  // Payment: 5 requests / 10 minutes / IP
  payment: {
    limit: Number(process.env.RATE_LIMIT_PAYMENT_MAX) || 5,
    windowMs: Number(process.env.RATE_LIMIT_PAYMENT_WINDOW_MS) || 10 * 60 * 1000,
  },
  // Public analytics: 60 requests / 1 minute / IP (burst limit)
  analytics: {
    limit: Number(process.env.RATE_LIMIT_ANALYTICS_MAX) || 60,
    windowMs: Number(process.env.RATE_LIMIT_ANALYTICS_WINDOW_MS) || 60 * 1000,
  },
  // Default fallback: 30 requests / 1 minute / IP
  default: {
    limit: Number(process.env.RATE_LIMIT_DEFAULT_MAX) || 30,
    windowMs: Number(process.env.RATE_LIMIT_DEFAULT_WINDOW_MS) || 60 * 1000,
  },
};

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Synchronous in-memory rate check (standard & test-compatible)
 */
export function checkRateLimit(
  ip: string,
  action: RateLimitAction = 'default',
  extraId?: string
): { allowed: boolean; remaining: number; resetTime: number; limit: number } {
  const config = ACTION_LIMITS[action] || ACTION_LIMITS.default;
  const key = [action, ip, extraId].filter(Boolean).join(':');
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
      limit: config.limit,
    };
  }

  if (record.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      limit: config.limit,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.limit - record.count,
    resetTime: record.resetTime,
    limit: config.limit,
  };
}

/**
 * Serverless / Distributed KV Check (Vercel KV or Upstash Redis REST)
 * Falls back to local in-memory sliding window when KV credentials are not set.
 */
export async function checkRateLimitDistributed(
  ip: string,
  action: RateLimitAction = 'default',
  extraId?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number; limit: number }> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // Fallback to local in-memory store if distributed KV is not configured
  if (!kvUrl || !kvToken) {
    return checkRateLimit(ip, action, extraId);
  }

  const config = ACTION_LIMITS[action] || ACTION_LIMITS.default;
  const key = `ratelimit:${[action, ip, extraId].filter(Boolean).join(':')}`;
  const windowSec = Math.ceil(config.windowMs / 1000);

  try {
    // INCR and EXPIRE using Upstash/Vercel KV REST pipeline
    const res = await fetch(`${kvUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, windowSec],
      ]),
      cache: 'no-store',
    });

    if (!res.ok) {
      return checkRateLimit(ip, action, extraId);
    }

    const data = await res.json();
    const count = Number(data[0]?.result) || 1;
    const now = Date.now();
    const resetTime = now + config.windowMs;

    if (count > config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        limit: config.limit,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, config.limit - count),
      resetTime,
      limit: config.limit,
    };
  } catch {
    // Fail-open to local in-memory store on network hiccup
    return checkRateLimit(ip, action, extraId);
  }
}

/**
 * Enforce rate limit on an incoming Next.js API Request
 * Returns null if allowed, or standard 429 response if exceeded.
 */
export async function enforceRateLimit(
  request: Request,
  action: RateLimitAction,
  extraId?: string
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const result = await checkRateLimitDistributed(ip, action, extraId);

  if (!result.allowed) {
    const retryAfter = Math.max(1, Math.ceil((result.resetTime - Date.now()) / 1000));
    return NextResponse.json(
      {
        error: 'TOO_MANY_REQUESTS',
        message: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
        },
      }
    );
  }

  return null;
}
