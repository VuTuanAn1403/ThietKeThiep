import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'nha-co-tiec-hmac-auth-secret-key-2026-production';

export interface SessionPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
  timestamp: number;
}

export interface VerificationResult {
  valid: boolean;
  userId?: string;
  role?: 'USER' | 'ADMIN';
  error?: string;
}

/**
 * Generates an HMAC-SHA256 signature for the given payload string.
 */
function signPayload(payloadString: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payloadString).digest('hex');
}

/**
 * Creates a cryptographically signed session token string:
 * Format: `<userId>.<role>.<timestamp>.<hmacSignature>`
 */
export function createSignedSessionToken(userId: string, role: 'USER' | 'ADMIN'): string {
  const timestamp = Date.now();
  const dataString = `${userId}.${role}.${timestamp}`;
  const signature = signPayload(dataString);
  return `${dataString}.${signature}`;
}

/**
 * Verifies a signed session token.
 * Detects any tampering with role, userId, or signature.
 */
export function verifySessionToken(token: string | undefined | null): VerificationResult {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'NO_TOKEN' };
  }

  const parts = token.split('.');
  if (parts.length !== 4) {
    return { valid: false, error: 'MALFORMED_TOKEN' };
  }

  const [userId, role, timestampStr, providedSignature] = parts;

  if (role !== 'USER' && role !== 'ADMIN') {
    return { valid: false, error: 'INVALID_ROLE' };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, error: 'INVALID_TIMESTAMP' };
  }

  // Verify HMAC signature
  const dataString = `${userId}.${role}.${timestampStr}`;
  const expectedSignature = signPayload(dataString);

  // Timing-safe comparison to prevent timing attacks
  const expectedBuf = Buffer.from(expectedSignature);
  const providedBuf = Buffer.from(providedSignature);

  if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
    return { valid: false, error: 'SIGNATURE_MISMATCH' };
  }

  return {
    valid: true,
    userId,
    role: role as 'USER' | 'ADMIN',
  };
}
