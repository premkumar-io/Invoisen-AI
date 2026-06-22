import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const updateContactStatusSchema = z.object({
  status: z.enum(['new', 'read', 'resolved']),
});

export const contactIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['new', 'read', 'resolved']).optional(),
});
