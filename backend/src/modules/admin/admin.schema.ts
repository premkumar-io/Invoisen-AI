import { z } from 'zod';

export const adminUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
});

export const adminUserIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export { updateContactStatusSchema, contactIdParamSchema, adminListQuerySchema } from '../contact/contact.schema.js';
