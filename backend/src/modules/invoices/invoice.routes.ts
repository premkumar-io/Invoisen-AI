import { Router } from 'express';
import {
  createInvoice,
  listInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  restoreInvoice,
  permanentDeleteInvoice,
  downloadInvoicePdf,
} from './invoice.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  listInvoicesQuerySchema,
  invoiceIdParamSchema,
} from './invoice.schema.js';

export const invoiceRouter = Router();

invoiceRouter.use(requireAuth);

invoiceRouter.get('/', validate(listInvoicesQuerySchema, 'query'), listInvoices);
invoiceRouter.post('/', validate(createInvoiceSchema), createInvoice);
invoiceRouter.get('/:id/pdf', validate(invoiceIdParamSchema, 'params'), downloadInvoicePdf);
invoiceRouter.get('/:id', validate(invoiceIdParamSchema, 'params'), getInvoice);
invoiceRouter.patch('/:id', validate(invoiceIdParamSchema, 'params'), validate(updateInvoiceSchema), updateInvoice);
invoiceRouter.delete('/:id', validate(invoiceIdParamSchema, 'params'), deleteInvoice);
invoiceRouter.patch('/:id/restore', validate(invoiceIdParamSchema, 'params'), restoreInvoice);
invoiceRouter.delete('/:id/permanent', validate(invoiceIdParamSchema, 'params'), permanentDeleteInvoice);
