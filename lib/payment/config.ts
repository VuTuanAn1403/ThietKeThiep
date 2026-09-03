/**
 * ============================================================
 * NHÀ CÓ TIỆC — PAYMENT CONFIGURATION & PROVIDER ABSTRACTION
 * ============================================================
 * NOTE: Currently configured with placeholder bank information.
 * When going to production with real banking details, update the
 * constants below or populate environment variables.
 */

export const PAYMENT_CONFIG = {
  // Placeholder Bank Information (Easily replaceable)
  BANK_NAME: process.env.PAYMENT_BANK_NAME || 'DEMO BANK',
  ACCOUNT_NUMBER: process.env.PAYMENT_ACCOUNT_NUMBER || '0000000000',
  ACCOUNT_NAME: process.env.PAYMENT_ACCOUNT_NAME || 'DEMO ACCOUNT',
  
  // Placeholder QR Image (SVG/PNG URL or generated string)
  DEFAULT_QR_IMAGE:
    process.env.PAYMENT_QR_IMAGE ||
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DEMO_PAYMENT_ORDER',

  // Order Expiration Duration (10 minutes)
  ORDER_TIMEOUT_MINUTES: 10,

  // Support contact URL
  SUPPORT_URL: '/dashboard/support',

  // Pre-configured discount voucher codes
  VALID_DISCOUNT_CODES: {
    'TIECVUI': 50000,
    'NHAMOI': 30000,
    'HAPPYWEDDING': 100000,
    'PROMO130': 130000,
  } as Record<string, number>,
};

/**
 * Payment Provider Abstraction
 * Allows seamless swap with VNPay, PayOS, MoMo in the future.
 */
export interface PaymentResult {
  orderCode: string;
  qrCodeUrl: string;
  transferContent: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  expiresAt: string;
}

export interface PaymentProvider {
  createPayment(orderCode: string, amount: number): Promise<PaymentResult>;
  verifyPayment(orderCode: string): Promise<boolean>;
}

export class ManualQRProvider implements PaymentProvider {
  async createPayment(orderCode: string, amount: number): Promise<PaymentResult> {
    const expiresAt = new Date(Date.now() + PAYMENT_CONFIG.ORDER_TIMEOUT_MINUTES * 60 * 1000).toISOString();
    
    // Dynamic QR generation link using QR Server (safe for demo, generates code for transfer content)
    const qrData = `2|99|${PAYMENT_CONFIG.ACCOUNT_NUMBER}|${PAYMENT_CONFIG.ACCOUNT_NAME}|${amount}|0|0|${orderCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrData)}`;

    return {
      orderCode,
      qrCodeUrl,
      transferContent: orderCode,
      bankName: PAYMENT_CONFIG.BANK_NAME,
      accountNumber: PAYMENT_CONFIG.ACCOUNT_NUMBER,
      accountName: PAYMENT_CONFIG.ACCOUNT_NAME,
      amount,
      expiresAt,
    };
  }

  async verifyPayment(_orderCode: string): Promise<boolean> {
    // Manual verification by administrator in Phase 1
    return false;
  }
}

export const defaultPaymentProvider = new ManualQRProvider();
