import { Types } from 'mongoose';
import { Invoice, IInvoice } from './invoice.model.js';
import { User } from '../users/user.model.js';
import { getOrCreateSettings } from '../settings/settings.service.js';
import {
  generateInvoiceNumber,
  calculateInvoiceTotals,
  canTransition,
} from '../../utils/invoiceNumber.js';
import { assertOwnership } from '../../utils/ownershipCheck.js';
import { AppError, ForbiddenError, NotFoundError } from '../../utils/errors.js';
import { env } from '../../config/env.js';
import type { CreateInvoiceInput, UpdateInvoiceInput, ListInvoicesQuery } from './invoice.schema.js';

function mapItems(items: { name: string; description?: string; quantity: number; rate: number }[]) {
  return items.map((item) => ({
    name: item.name,
    description: item.description ?? '',
    quantity: item.quantity,
    rate: item.rate,
    amount: Math.round(item.quantity * item.rate * 100) / 100,
  }));
}

function buildCalculations(
  items: { quantity: number; rate: number }[],
  calc?: { taxType?: string; taxRate?: number; discount?: number }
) {
  const taxRate = calc?.taxRate ?? 0;
  const discount = calc?.discount ?? 0;
  const { subtotal, taxAmount, total } = calculateInvoiceTotals(items, taxRate, discount);
  return {
    subtotal,
    taxType: (calc?.taxType ?? 'None') as IInvoice['calculations']['taxType'],
    taxRate,
    taxAmount,
    discount,
    total,
  };
}

async function enforcePlanLimit(userId: string, targetStatus: string): Promise<void> {
  if (targetStatus !== 'published') return;

  const user = await User.findById(userId);
  if (!user || user.plan !== 'free') return;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const count = await Invoice.countDocuments({
    userId,
    status: 'published',
    isDeleted: false,
    updatedAt: { $gte: startOfMonth },
  });

  if (count >= env.FREE_PLAN_MONTHLY_INVOICE_LIMIT) {
    throw new ForbiddenError(
      `Free plan limit of ${env.FREE_PLAN_MONTHLY_INVOICE_LIMIT} published invoices per month reached`
    );
  }
}

export async function createInvoice(userId: string, input: CreateInvoiceInput) {
  const settings = await getOrCreateSettings(userId);
  const status = input.status ?? 'draft';

  if (status === 'published') {
    await enforcePlanLimit(userId, 'published');
  }

  const items = mapItems(input.items);
  const calculations = buildCalculations(items, input.calculations);
  const invoiceNumber = await generateInvoiceNumber(userId);

  const businessInfo = {
    name: input.businessInfo?.name ?? settings.businessProfile.name,
    logoUrl: input.businessInfo?.logoUrl ?? settings.businessProfile.logoUrl,
    address: input.businessInfo?.address ?? settings.businessProfile.address,
    email: input.businessInfo?.email ?? settings.businessProfile.email,
    phone: input.businessInfo?.phone ?? settings.businessProfile.phone,
    gstNumber: input.businessInfo?.gstNumber ?? settings.businessProfile.gstNumber,
  };

  const invoice = await Invoice.create({
    userId,
    invoiceNumber,
    status,
    businessInfo,
    clientInfo: input.clientInfo,
    items,
    calculations,
    customization: {
      fontFamily: input.customization?.fontFamily ?? 'Inter',
      fontSize: input.customization?.fontSize ?? 14,
      themeColor: input.customization?.themeColor ?? '#2563EB',
      backgroundColor: input.customization?.backgroundColor ?? '#FFFFFF',
      signatureDataUrl: input.customization?.signatureDataUrl ?? '',
      currency: input.customization?.currency ?? settings.defaultCurrency,
      templateId: input.customization?.templateId ?? 'modern',
    },
    invoiceDate: input.invoiceDate,
    dueDate: input.dueDate,
  });

  return invoice;
}

export async function listInvoices(userId: string, query: ListInvoicesQuery) {
  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
    isDeleted: query.trash ? true : false,
  };

  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const sortField = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort;
  const sortOrder = query.sort.startsWith('-') ? -1 : 1;
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

  const skip = (query.page - 1) * query.limit;
  const [data, total] = await Promise.all([
    Invoice.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
    Invoice.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
}

export async function getInvoice(userId: string, invoiceId: string) {
  return assertOwnership(Invoice, invoiceId, userId);
}

export async function updateInvoice(userId: string, invoiceId: string, input: UpdateInvoiceInput) {
  const invoice = await assertOwnership(Invoice, invoiceId, userId, { isDeleted: false });

  if (input.status && !canTransition(invoice.status, input.status)) {
    throw new AppError('INVALID_REQUEST', `Cannot transition from ${invoice.status} to ${input.status}`, 400);
  }

  if (input.status === 'published' && invoice.status !== 'published') {
    await enforcePlanLimit(userId, 'published');
  }

  if (input.items) {
    invoice.items = mapItems(input.items);
    invoice.calculations = buildCalculations(invoice.items, {
      taxType: input.calculations?.taxType ?? invoice.calculations.taxType,
      taxRate: input.calculations?.taxRate ?? invoice.calculations.taxRate,
      discount: input.calculations?.discount ?? invoice.calculations.discount,
    });
  } else if (input.calculations) {
    invoice.calculations = buildCalculations(invoice.items, {
      taxType: input.calculations.taxType ?? invoice.calculations.taxType,
      taxRate: input.calculations.taxRate ?? invoice.calculations.taxRate,
      discount: input.calculations.discount ?? invoice.calculations.discount,
    });
  }

  if (input.clientInfo) invoice.clientInfo = { ...invoice.clientInfo, ...input.clientInfo };
  if (input.businessInfo) invoice.businessInfo = { ...invoice.businessInfo, ...input.businessInfo };
  if (input.invoiceDate) invoice.invoiceDate = input.invoiceDate;
  if (input.dueDate) invoice.dueDate = input.dueDate;
  if (input.status) invoice.status = input.status;

  if (input.customization) {
    invoice.customization = { ...invoice.customization, ...input.customization };
  }

  await invoice.save();
  return invoice;
}

export async function softDeleteInvoice(userId: string, invoiceId: string) {
  const invoice = await assertOwnership(Invoice, invoiceId, userId, { isDeleted: false });
  invoice.isDeleted = true;
  invoice.deletedAt = new Date();
  await invoice.save();
  return { message: 'Invoice moved to trash' };
}

export async function restoreInvoice(userId: string, invoiceId: string) {
  const invoice = await assertOwnership(Invoice, invoiceId, userId, { isDeleted: true });
  invoice.isDeleted = false;
  invoice.deletedAt = null;
  await invoice.save();
  return invoice;
}

export async function permanentDeleteInvoice(userId: string, invoiceId: string) {
  const invoice = await assertOwnership(Invoice, invoiceId, userId, { isDeleted: true });
  await invoice.deleteOne();
  return { message: 'Invoice permanently deleted' };
}

export function derivePaymentState({
  total,
  amountPaid,
  dueDate,
  status,
  now = new Date(),
}: {
  total: number;
  amountPaid: number;
  dueDate: Date;
  status: string;
  now?: Date;
}) {
  const roundedTotal = Math.round(total * 100) / 100;
  const roundedPaid = Math.round(amountPaid * 100) / 100;
  const amountDue = Math.max(0, Math.round((roundedTotal - roundedPaid) * 100) / 100);

  let paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overdue' = 'unpaid';

  if (roundedPaid >= roundedTotal && roundedTotal > 0) {
    paymentStatus = 'paid';
  } else if (roundedPaid > 0) {
    paymentStatus = 'partially_paid';
  } else if (dueDate < now && status === 'published') {
    paymentStatus = 'overdue';
  }

  return { amountDue, amountPaid: roundedPaid, paymentStatus };
}

export async function purgeExpiredTrash(): Promise<number> {
  const cutoff = new Date(Date.now() - env.TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const result = await Invoice.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: cutoff },
  });
  return result.deletedCount ?? 0;
}

export async function duplicateInvoice(userId: string, invoiceId: string) {
  const original = await assertOwnership(Invoice, invoiceId, userId);
  const newInvoiceNumber = await generateInvoiceNumber(userId);

  const duplicated = await Invoice.create({
    userId,
    invoiceNumber: newInvoiceNumber,
    status: 'draft',
    businessInfo: original.businessInfo,
    clientInfo: original.clientInfo,
    items: original.items,
    calculations: original.calculations,
    customization: original.customization,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  });

  return duplicated;
}
