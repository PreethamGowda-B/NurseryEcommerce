import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { PaymentService } from '../services/paymentService.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
  confirmCodOrderSchema,
} from '../schemas/payment.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

/**
 * POST /api/payments/razorpay/webhook
 * Unauthenticated endpoint called directly by Razorpay Webhooks
 */
router.post(
  '/payments/razorpay/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const signatureHeader = req.headers['x-razorpay-signature'] as string;
      const result = await PaymentService.handleWebhook(req.body, signatureHeader || '');
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/payments/razorpay/create
 * Create Razorpay Order with server-side amount calculation
 */
router.post(
  '/payments/razorpay/create',
  authenticate,
  validate(createRazorpayOrderSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { orderNumber } = req.body;
      const data = await PaymentService.createRazorpayOrder(userId, orderNumber);
      sendSuccess(res, data, 'Razorpay order created');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/payments/razorpay/verify
 * Verify Razorpay payment HMAC SHA-256 signature
 */
router.post(
  '/payments/razorpay/verify',
  authenticate,
  validate(verifyRazorpayPaymentSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const result = await PaymentService.verifyRazorpayPayment(userId, {
        orderNumber,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });
      sendSuccess(res, result.order, result.message);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/payments/cod/confirm
 * Confirm Cash on Delivery order
 */
router.post(
  '/payments/cod/confirm',
  authenticate,
  validate(confirmCodOrderSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { orderNumber } = req.body;
      const result = await PaymentService.confirmCodOrder(userId, orderNumber);
      sendSuccess(res, result.order, result.message);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
