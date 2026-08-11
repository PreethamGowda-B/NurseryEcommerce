import { z } from 'zod';

export const createAdminCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    slug: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().optional(),
    image: z.string().trim().url('Invalid image URL').optional(),
    sortOrder: z.number().int().default(0),
    active: z.boolean().default(true),
  }),
});

export const updateAdminCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category ID required'),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    slug: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().optional(),
    image: z.string().trim().url('Invalid image URL').optional(),
    sortOrder: z.number().int().optional(),
    active: z.boolean().optional(),
  }),
});
