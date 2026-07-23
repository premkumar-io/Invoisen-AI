import type { Request, Response } from 'express';
import { createClientSuggestion, createDescriptionSuggestion, createInvoiceSuggestions, createTaxSuggestion, sendInvoiceByEmail } from './ai.service.js';
import type { ClientAutofillInput, GenerateDescriptionInput, InvoiceAssistInput, TaxSuggestionInput } from './ai.schema.js';

export async function invoiceAssistController(req: Request, res: Response) {
  const suggestions = createInvoiceSuggestions(req.body as InvoiceAssistInput);
  res.status(200).json({ success: true, data: suggestions });
}

export async function generateDescriptionController(req: Request, res: Response) {
  const suggestion = createDescriptionSuggestion(req.body as GenerateDescriptionInput);
  res.status(200).json({ success: true, data: suggestion });
}

export async function taxSuggestionController(req: Request, res: Response) {
  const suggestion = createTaxSuggestion(req.body as TaxSuggestionInput);
  res.status(200).json({ success: true, data: suggestion });
}

export async function clientAutofillController(req: Request, res: Response) {
  const suggestions = createClientSuggestion(req.body as ClientAutofillInput);
  res.status(200).json({ success: true, data: suggestions });
}

// NOTE: This controller is placed here for demonstration purposes.
// In a real application, this would belong in `invoice.controller.ts`.
export async function sendInvoiceController(req: Request, res: Response) {
  const userId = (req as any).user?._id;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing authenticated user' } });
    return;
  }
  const result = await sendInvoiceByEmail(req.params.id as string, userId);
  res.status(200).json({ success: true, data: result });
}