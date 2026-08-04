import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import {
  invoiceAssistController,
  generateDescriptionController,
  taxSuggestionController,
  clientAutofillController,
  chatController,
  insightsController,
  sendInvoiceController,
} from './ai.controller.js';
import {
  invoiceAssistSchema,
  generateDescriptionSchema,
  taxSuggestionSchema,
  clientAutofillSchema,
  chatSchema,
  insightsSchema,
} from './ai.schema.js';

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

aiRouter.post(
  '/chat',
  validate(chatSchema),
  chatController,
);

aiRouter.post(
  '/insights',
  validate(insightsSchema),
  insightsController,
);

aiRouter.post(
  '/send-invoice/:id',
  sendInvoiceController,
);
