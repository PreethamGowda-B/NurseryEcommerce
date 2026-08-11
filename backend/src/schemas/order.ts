import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z
    .object({
      addressId: z.string().trim().min(1, 'Shipping address ID is required'),
    })
    .strict('Unexpected fields in order creation request are not allowed'),
});

export const orderParamSchema = z.object({
  params: z.object({
    orderNumber: z.string().trim().min(1, 'Order number is required'),
  }),
});
