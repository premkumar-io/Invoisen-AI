import type { Request, Response, NextFunction } from 'express';
import * as invoiceService from './invoice.service.js';
import { generateInvoicePdf } from '../../services/pdf.service.js';
import { successResponse, paginatedResponse } from '../../utils/response.js';
import type { ListInvoicesQuery } from './invoice.schema.js';

type InvoiceIdParams = { id: string };

export async function createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await invoiceService.createInvoice(req.user!._id, req.body);
    res.status(201).json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function listInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.validatedQuery as ListInvoicesQuery;
    const result = await invoiceService.listInvoices(req.user!._id, query);
    res.json(paginatedResponse(result.data, result.pagination));
  } catch (err) {
    next(err);
  }
}

export async function getInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as InvoiceIdParams;
    const data = await invoiceService.getInvoice(req.user!._id, params.id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function updateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as InvoiceIdParams;
    const data = await invoiceService.updateInvoice(req.user!._id, params.id, req.body);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function deleteInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as InvoiceIdParams;
    const data = await invoiceService.softDeleteInvoice(req.user!._id, params.id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function restoreInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as InvoiceIdParams;
    const data = await invoiceService.restoreInvoice(req.user!._id, params.id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function permanentDeleteInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as InvoiceIdParams;
    const data = await invoiceService.permanentDeleteInvoice(req.user!._id, params.id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function downloadInvoicePdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = res.locals.validatedParams as InvoiceIdParams;
    const invoice = await invoiceService.getInvoice(req.user!._id, params.id);
    const pdfBuffer = await generateInvoicePdf(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}
