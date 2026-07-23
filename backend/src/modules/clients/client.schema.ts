import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(200),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  company: z.string().max(200).optional(),
  gstNumber: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  company: z.string().max(200).optional(),
  gstNumber: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export const getClientsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  trash: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export const clientIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID'),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type GetClientsQuery = z.infer<typeof getClientsSchema>;
