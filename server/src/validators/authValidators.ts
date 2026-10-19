import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
  phone: z.string().trim().optional(),
  city: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  bio: z.string().max(300).optional(),
  city: z.string().trim().optional(),
  avatar: z.string().url().optional(),
  phone: z.string().trim().optional(),
  preferences: z
    .object({
      smoking: z.boolean().optional(),
      music: z.boolean().optional(),
      pets: z.boolean().optional(),
      ac: z.boolean().optional(),
      ladiesOnly: z.boolean().optional(),
      chatter: z.enum(['quiet', 'moderate', 'talkative']).optional(),
    })
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
