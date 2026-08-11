import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().trim().min(1, 'Product ID is required'),
    quantity: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1').default(1),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    productId: z.string().trim().min(1, 'Product ID is required'),
  }),
  body: z.object({
    quantity: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1'),
  }),
});

export const removeCartItemSchema = z.object({
  params: z.object({
    productId: z.string().trim().min(1, 'Product ID is required'),
  }),
});

export const mergeCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().min(1),
      })
    ),
  }),
});
