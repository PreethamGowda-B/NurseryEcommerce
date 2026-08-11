import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
      phone: z.string().trim().min(10, 'Phone must be at least 10 digits').max(15).optional(),
    })
    .strict('Unexpected fields in profile update request are not allowed'),
});

export const createAddressSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Full name is required').max(100),
    phone: z.string().trim().min(10, 'Valid phone number is required').max(15),
    addressLine1: z.string().trim().min(3, 'Address line 1 is required').max(150),
    addressLine2: z.string().trim().max(150).optional(),
    city: z.string().trim().min(2, 'City is required').max(50),
    state: z.string().trim().min(2, 'State is required').max(50),
    postalCode: z
      .string()
      .trim()
      .min(5, 'Postal code must be 5 to 10 characters')
      .max(10)
      .regex(/^[A-Za-z0-9\s-]+$/, 'Postal code contains invalid characters'),
    country: z.string().trim().min(2).default('India'),
    label: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
    landmark: z.string().trim().max(100).optional(),
  }),
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Address ID is required'),
  }),
  body: z.object({
    fullName: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(10).max(15).optional(),
    addressLine1: z.string().trim().min(3).max(150).optional(),
    addressLine2: z.string().trim().max(150).optional(),
    city: z.string().trim().min(2).max(50).optional(),
    state: z.string().trim().min(2).max(50).optional(),
    postalCode: z
      .string()
      .trim()
      .min(5)
      .max(10)
      .regex(/^[A-Za-z0-9\s-]+$/, 'Postal code contains invalid characters')
      .optional(),
    country: z.string().trim().min(2).optional(),
    label: z.enum(['HOME', 'WORK', 'OTHER']).optional(),
    landmark: z.string().trim().max(100).optional(),
  }),
});

export const addressParamSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Address ID is required'),
  }),
});
