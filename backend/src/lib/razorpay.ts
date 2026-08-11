import Razorpay from 'razorpay';
import crypto from 'crypto';

export function getRazorpayInstance(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId12345';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mockKeySecret123456789';

  try {
    return new Razorpay({
      key_id,
      key_secret,
    });
  } catch (err) {
    console.error('Failed to initialize Razorpay SDK:', err);
    return null;
  }
}

/**
 * Verify Razorpay payment HMAC SHA-256 signature
 */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
  keySecret?: string
): boolean {
  const secret = keySecret || process.env.RAZORPAY_KEY_SECRET || 'mockKeySecret123456789';
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch {
    return false;
  }
}

/**
 * Verify Razorpay Webhook HMAC SHA-256 signature
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string,
  webhookSecret?: string
): boolean {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || 'mockWebhookSecret12345';

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(signatureHeader, 'utf8')
    );
  } catch {
    return false;
  }
}
