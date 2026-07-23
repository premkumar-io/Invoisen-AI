import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { invoiceAssistController, generateDescriptionController, taxSuggestionController, clientAutofillController, sendInvoiceController } from './ai.controller.js';
import { invoiceAssistSchema, generateDescriptionSchema, taxSuggestionSchema, clientAutofillSchema } from './ai.schema.js';

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.post(
  '/invoice-assist',
  validate(invoiceAssistSchema),
  invoiceAssistController,
);

aiRouter.post(
  '/generate-description',
  validate(generateDescriptionSchema),
  generateDescriptionController,
);

aiRouter.post(
  '/tax-suggestion',
  validate(taxSuggestionSchema),
  taxSuggestionController,
);

aiRouter.post(
  '/client-autofill',
  validate(clientAutofillSchema),
  clientAutofillController,
);

// NOTE: This endpoint is placed here for demonstration purposes as invoice routes were not provided.
// In a real application, this would belong in `invoice.routes.ts` as `POST /invoices/:id/send`.
aiRouter.post(
  '/send-invoice/:id',
  sendInvoiceController,
);
