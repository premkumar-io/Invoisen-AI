import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  phoneVerified: z.boolean().nullable().optional(),
  emailVerified: z.boolean().nullable().optional(),
  country: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
  timeZone: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).nullable().optional(),
}).passthrough();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const objectIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID'),
});
