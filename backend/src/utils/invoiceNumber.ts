import { InvoiceCounter } from '../modules/invoices/invoice.model.js';
import { getOrCreateSettings } from '../modules/settings/settings.service.js';

export async function generateInvoiceNumber(userId: string): Promise<string> {
  const settings = await getOrCreateSettings(userId);
  const prefix = settings.invoicePrefix || 'INV';

  const counter = await InvoiceCounter.findOneAndUpdate(
    { userId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const padded = String(counter!.seq).padStart(4, '0');
  return `${prefix}-${padded}`;
}

export function calculateInvoiceTotals(items: { quantity: number; rate: number }[], taxRate: number, discount: number) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round(afterDiscount * (taxRate / 100) * 100) / 100;
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100;
  return { subtotal, taxAmount, total };
}

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['published', 'archived'],
  published: ['archived', 'draft'],
  archived: ['draft', 'published'],
};

export function canTransition(from: string, to: string): boolean {
  if (from === to) return true;
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
