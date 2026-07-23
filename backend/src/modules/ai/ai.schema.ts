import { z } from 'zod';

export const invoiceAssistSchema = z.object({
  prompt: z.string().min(10).max(500),
  clientName: z.string().max(100).optional(),
  currency: z.string().min(3).max(3).optional(),
});

export type InvoiceAssistInput = z.infer<typeof invoiceAssistSchema>;

export const generateDescriptionSchema = z.object({
  productName: z.string().min(2).max(100),
});

export type GenerateDescriptionInput = z.infer<typeof generateDescriptionSchema>;

export const taxSuggestionSchema = z.object({
  country: z.string().min(2).max(2),
});

export type TaxSuggestionInput = z.infer<typeof taxSuggestionSchema>;

export const clientAutofillSchema = z.object({
  query: z.string().min(2).max(100),
});

export type ClientAutofillInput = z.infer<typeof clientAutofillSchema>;