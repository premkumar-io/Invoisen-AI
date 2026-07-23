import { z } from 'zod';

export const reportQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    currency: z.enum(['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD']).optional(),
    clientId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'from must be before to',
    path: ['from'],
  });

export type ReportQuery = z.infer<typeof reportQuerySchema>;
