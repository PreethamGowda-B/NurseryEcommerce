import { z } from 'zod';

export const createAdminProductSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
      botanicalName: z.string().trim().optional(),
      sku: z.string().trim().min(2, 'SKU must be at least 2 characters').max(50),
      categoryId: z.string().trim().min(1, 'Category is required'),
      description: z.string().trim().min(10, 'Description must be at least 10 characters'),
      shortDescription: z.string().trim().optional(),
      price: z.number().min(0, 'Price must be greater than or equal to 0'),
      salePrice: z.number().min(0, 'Sale price must be greater than or equal to 0').nullable().optional(),
      stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative').default(0),
      lowStockThreshold: z.number().int().min(0).default(5),
      sunlight: z.string().trim().optional(),
      watering: z.string().trim().optional(),
      careLevel: z.string().trim().optional(),
      plantSize: z.string().trim().optional(),
      featured: z.boolean().default(false),
      published: z.boolean().default(true),
      imageUrl: z.string().trim().url('Invalid image URL').optional(),
    })
    .refine(
      (data) => {
        if (data.salePrice !== undefined && data.salePrice !== null) {
          return data.salePrice <= data.price;
        }
        return true;
      },
      {
        message: 'Sale price cannot be greater than regular price',
        path: ['salePrice'],
      }
    ),
});

export const updateAdminProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID required'),
  }),
  body: z
    .object({
      name: z.string().trim().min(2).max(150).optional(),
      botanicalName: z.string().trim().optional(),
      sku: z.string().trim().min(2).max(50).optional(),
      categoryId: z.string().trim().min(1).optional(),
      description: z.string().trim().min(10).optional(),
      shortDescription: z.string().trim().optional(),
      price: z.number().min(0).optional(),
      salePrice: z.number().min(0).nullable().optional(),
      stockQuantity: z.number().int().min(0).optional(),
      lowStockThreshold: z.number().int().min(0).optional(),
      sunlight: z.string().trim().optional(),
      watering: z.string().trim().optional(),
      careLevel: z.string().trim().optional(),
      plantSize: z.string().trim().optional(),
      featured: z.boolean().optional(),
      published: z.boolean().optional(),
      imageUrl: z.string().trim().url().optional(),
    })
    .refine(
      (data) => {
        if (data.price !== undefined && data.salePrice !== undefined && data.salePrice !== null) {
          return data.salePrice <= data.price;
        }
        return true;
      },
      {
        message: 'Sale price cannot be greater than regular price',
        path: ['salePrice'],
      }
    ),
});
