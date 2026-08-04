import { z } from 'zod';

const statusEnum = z.enum(['draft', 'published', 'archived']);

const businessInfoSchema = z.object({
  name: z.string().max(500).optional().default(''),
  logoUrl: z.string().optional().default(''),
  address: z.string().max(1000).optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().max(100).optional().default(''),
  gstNumber: z.string().max(100).optional().default(''),
});

const clientInfoSchema = z.object({
  name: z.string().max(500).optional().default('Client Name'),
  email: z.string().optional().default(''),
  address: z.string().max(1000).optional().default(''),
});

const itemSchema = z.object({
  name: z.string().max(500).optional().default('Line Item'),
  description: z.string().optional().default(''),
  quantity: z.number().optional().default(1),
  rate: z.number().optional().default(0),
  amount: z.number().optional().default(0),
});

const customizationSchema = z.object({
  fontFamily: z.string().optional(),
  fontSize: z.number().optional(),
  themeColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  signatureDataUrl: z.string().optional(),
  currency: z.string().optional().default('USD'),
  templateId: z.string().optional().default('modern'),
});

const calculationsSchema = z.object({
  taxType: z.string().optional().default('None'),
  taxRate: z.number().optional().default(0),
  taxAmount: z.number().optional().default(0),
  discount: z.number().optional().default(0),
  subtotal: z.number().optional().default(0),
  total: z.number().optional().default(0),
});

export const createInvoiceSchema = z.object({
  clientInfo: clientInfoSchema.optional().default({ name: 'Client Name', email: '', address: '' }),
  businessInfo: businessInfoSchema.optional(),
  items: z.array(itemSchema).optional().default([]),
  calculations: calculationsSchema.optional(),
  customization: customizationSchema.optional(),
  invoiceDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  status: statusEnum.optional().default('draft'),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  clientInfo: clientInfoSchema.partial().optional(),
  businessInfo: businessInfoSchema.optional(),
  items: z.array(itemSchema).optional(),
  calculations: calculationsSchema.optional(),
  customization: customizationSchema.optional(),
  invoiceDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  status: statusEnum.optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
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
