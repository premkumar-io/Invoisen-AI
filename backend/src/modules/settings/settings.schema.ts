import { z } from 'zod';

const currencyEnum = z.enum(['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD']);

export const businessProfileSchema = z.object({
  name: z.string().max(200).optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  address: z.string().max(500).optional(),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().max(30).optional(),
  gstNumber: z.string().max(50).optional(),
});

export const updateSettingsSchema = z.object({
  theme: z.string().max(50).optional(),
  defaultCurrency: currencyEnum.optional(),
  invoicePrefix: z.string().min(1).max(10).regex(/^[A-Z0-9-]+$/i, 'Invalid prefix').optional(),
  businessProfile: businessProfileSchema.optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
