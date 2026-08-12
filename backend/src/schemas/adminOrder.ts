import { z } from 'zod';

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const;

export const listAdminOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(200).optional().default(20),
    search: z.string().trim().optional(),
    status: z.enum([...ORDER_STATUSES, 'ALL']).optional(),
    paymentStatus: z.enum(['ALL', 'PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    paymentMethod: z.enum(['ALL', 'RAZORPAY', 'COD']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z
    .object({
      status: z.enum(ORDER_STATUSES),
      note: z.string().trim().optional(),
      internalNotes: z.string().trim().optional(),
    })
    .strict('Unexpected fields in status update are not allowed'),
});

export const updateInternalNotesSchema = z.object({
  body: z
    .object({
      internalNotes: z.string().trim(),
    })
    .strict('Unexpected fields in internal notes update are not allowed'),
});
