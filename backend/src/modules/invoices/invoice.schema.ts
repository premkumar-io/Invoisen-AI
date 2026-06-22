import { z } from 'zod';

const currencyEnum = z.enum(['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD']);
const taxTypeEnum = z.enum(['GST', 'VAT', 'Sales Tax', 'Custom', 'None']);
const templateEnum = z.enum(['modern', 'corporate', 'minimal', 'creative']);
const statusEnum = z.enum(['draft', 'published', 'archived']);

const businessInfoSchema = z.object({
  name: z.string().max(200).optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  address: z.string().max(500).optional(),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().max(30).optional(),
  gstNumber: z.string().max(50).optional(),
});

const clientInfoSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().or(z.literal('')).optional(),
  address: z.string().max(500).optional(),
});

const itemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  quantity: z.number().min(0),
  rate: z.number().min(0),
});

const customizationSchema = z.object({
  fontFamily: z.string().max(100).optional(),
  fontSize: z.number().min(8).max(32).optional(),
  themeColor: z.string().max(20).optional(),
  backgroundColor: z.string().max(20).optional(),
  signatureDataUrl: z.string().max(500000).optional(),
  currency: currencyEnum.optional(),
  templateId: templateEnum.optional(),
});

const calculationsSchema = z.object({
  taxType: taxTypeEnum.optional(),
  taxRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
});

export const createInvoiceSchema = z.object({
  clientInfo: clientInfoSchema,
  businessInfo: businessInfoSchema.optional(),
  items: z.array(itemSchema).min(1),
  calculations: calculationsSchema.optional(),
  customization: customizationSchema.optional(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  status: statusEnum.optional(),
});

export const updateInvoiceSchema = z.object({
  clientInfo: clientInfoSchema.partial().optional(),
  businessInfo: businessInfoSchema.optional(),
  items: z.array(itemSchema).min(1).optional(),
  calculations: calculationsSchema.optional(),
  customization: customizationSchema.optional(),
  invoiceDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  status: statusEnum.optional(),
});

export const listInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: statusEnum.optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(['invoiceDate', '-invoiceDate', 'total', '-total', 'createdAt', '-createdAt']).default('-createdAt'),
  trash: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export const invoiceIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
