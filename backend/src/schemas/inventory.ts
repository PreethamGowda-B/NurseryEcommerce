import { z } from 'zod';

export const adjustStockSchema = z.object({
  body: z
    .object({
      quantity: z.number().int().refine((val) => val !== 0, {
        message: 'Adjustment quantity must not be zero',
      }),
      reason: z.string().trim().min(3, 'Adjustment reason must be at least 3 characters long'),
    })
    .strict('Unexpected fields in stock adjustment are not allowed'),
});

export const listInventorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    search: z.string().trim().optional(),
    status: z.enum(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).optional().default('ALL'),
    categoryId: z.string().optional(),
  }),
});

export const listInventoryTransactionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    productId: z.string().optional(),
    type: z.enum(['ALL', 'RESERVE', 'SALE', 'RELEASE', 'ADJUSTMENT']).optional().default('ALL'),
  }),
});
