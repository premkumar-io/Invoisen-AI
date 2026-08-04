import type { Request, Response } from 'express';
import {
  createClientSuggestion,
  createDescriptionSuggestion,
  createInvoiceSuggestions,
  createTaxSuggestion,
  createChatResponse,
  createFinancialInsights,
  sendInvoiceByEmail,
} from './ai.service.js';
import type {
  ClientAutofillInput,
  GenerateDescriptionInput,
  InvoiceAssistInput,
  TaxSuggestionInput,
  ChatInput,
  InsightsInput,
} from './ai.schema.js';

export async function invoiceAssistController(req: Request, res: Response) {
  const suggestions = await createInvoiceSuggestions(req.body as InvoiceAssistInput);
  res.status(200).json({ success: true, data: suggestions });
}

export async function generateDescriptionController(req: Request, res: Response) {
  const suggestion = await createDescriptionSuggestion(req.body as GenerateDescriptionInput);
  res.status(200).json({ success: true, data: suggestion });
}

export async function taxSuggestionController(req: Request, res: Response) {
  const suggestion = await createTaxSuggestion(req.body as TaxSuggestionInput);
  res.status(200).json({ success: true, data: suggestion });
}

export async function clientAutofillController(req: Request, res: Response) {
  const suggestions = await createClientSuggestion(req.body as ClientAutofillInput);
  res.status(200).json({ success: true, data: suggestions });
}

export async function chatController(req: Request, res: Response) {
  const userId = (req as any).user?._id;
  const reply = await createChatResponse(req.body as ChatInput, userId);
  res.status(200).json({ success: true, data: reply });
}

export async function insightsController(req: Request, res: Response) {
  const userId = (req as any).user?._id;
  const insights = await createFinancialInsights(req.body as InsightsInput, userId);
  res.status(200).json({ success: true, data: insights });
}

export async function sendInvoiceController(req: Request, res: Response) {
  const userId = (req as any).user?._id;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing authenticated user' } });
    return;
  }
  const recipientEmail = req.body?.email;
  const result = await sendInvoiceByEmail(req.params.id as string, userId, recipientEmail);
  res.status(200).json({ success: true, data: result });
}