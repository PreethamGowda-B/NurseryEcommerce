import { z } from 'zod';

export const productQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().positive('Page must be a positive integer')),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 12))
      .pipe(z.number().int().min(1, 'Limit must be at least 1').max(50, 'Maximum limit is 50')),

    search: z.string().trim().optional(),
    category: z.string().trim().optional(),

    minPrice: z
      .string()
      .optional()
      .transform((val) => (val !== undefined && val !== '' ? parseFloat(val) : undefined))
      .pipe(z.number().min(0, 'minPrice must be >= 0').optional()),

    maxPrice: z
      .string()
      .optional()
      .transform((val) => (val !== undefined && val !== '' ? parseFloat(val) : undefined))
      .pipe(z.number().min(0, 'maxPrice must be >= 0').optional()),

    inStock: z
      .string()
      .optional()
      .transform((val) => val === 'true'),

    featured: z
      .string()
      .optional()
      .transform((val) => val === 'true'),

    sort: z
      .enum(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'])
      .optional()
      .default('newest'),
  }).refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'minPrice cannot be greater than maxPrice',
      path: ['minPrice'],
    }
  ),
});

export const productSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Product slug is required'),
  }),
});
