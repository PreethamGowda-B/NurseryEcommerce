import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address'),
    phone: z
      .string()
      .trim()
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number too long'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});
