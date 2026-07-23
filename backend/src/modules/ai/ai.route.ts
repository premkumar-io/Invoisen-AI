import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { invoiceAssistSchema, generateDescriptionSchema } from './ai.schema.js';
import { invoiceAssistController, generateDescriptionController } from './ai.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.post(
  '/invoice-assist',
  requireAuth,
  validate(invoiceAssistSchema),
  invoiceAssistController,
);

router.post(
  '/generate-description',
  requireAuth,
  validate(generateDescriptionSchema),
  generateDescriptionController,
);

export default router;