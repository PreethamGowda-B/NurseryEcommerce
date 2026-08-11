import { z } from 'zod';

export const createRazorpayOrderSchema = z.object({
  body: z
    .object({
      orderNumber: z.string().trim().min(1, 'Order number is required'),
    })
    .strict('Unexpected fields in payment request are not allowed'),
});

export const verifyRazorpayPaymentSchema = z.object({
  body: z.object({
    orderNumber: z.string().trim().min(1, 'Order number is required'),
    razorpayOrderId: z.string().trim().min(1, 'Razorpay order ID is required'),
    razorpayPaymentId: z.string().trim().min(1, 'Razorpay payment ID is required'),
    razorpaySignature: z.string().trim().min(1, 'Razorpay signature is required'),
  }),
});

export const confirmCodOrderSchema = z.object({
  body: z
    .object({
      orderNumber: z.string().trim().min(1, 'Order number is required'),
    })
    .strict('Unexpected fields in COD confirmation request are not allowed'),
});
