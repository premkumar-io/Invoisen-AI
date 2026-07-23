import { Types } from 'mongoose';
import { Invoice } from '../invoices/invoice.model.js';
import { Payment } from '../payments/payment.model.js';
import { derivePaymentState } from '../invoices/invoice.service.js';

type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export async function getDashboardStats(userId: string) {
  const uid = new Types.ObjectId(userId);
  const baseFilter = { userId: uid, isDeleted: false };

  const [invoices, recentPayments] = await Promise.all([
    Invoice.find(baseFilter).sort({ createdAt: -1 }).lean(),
    Payment.find({ userId: uid, status: 'completed' }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  const paymentsByInvoice = new Map<string, number>();
  for (const payment of recentPayments) {
    if (!payment.invoiceId) continue;
    const key = payment.invoiceId.toString();
    paymentsByInvoice.set(key, (paymentsByInvoice.get(key) ?? 0) + payment.amount);
  }

  const now = new Date();
  let totalRevenue = 0;
  let paidInvoices = 0;
  let pendingInvoices = 0;
  let overdueInvoices = 0;

  const latestInvoices = invoices.slice(0, 5).map((inv) => {
    const amountPaid = paymentsByInvoice.get(inv._id.toString()) ?? 0;
    const state = derivePaymentState({
      total: inv.calculations?.total ?? 0,
      amountPaid,
      dueDate: new Date(inv.dueDate),
      status: inv.status,
      now,
    });

    if (state.paymentStatus === 'paid') paidInvoices += 1;
    else if (state.paymentStatus === 'overdue') overdueInvoices += 1;
    else if (inv.status === 'published') pendingInvoices += 1;

    if (state.paymentStatus === 'paid') {
      totalRevenue += inv.calculations?.total ?? 0;
    }

    return {
      _id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientInfo?.name ?? '',
      amount: inv.calculations?.total ?? 0,
      status: inv.status,
      paymentStatus: state.paymentStatus,
      currency: inv.customization?.currency ?? 'USD',
      date: inv.invoiceDate ?? inv.createdAt,
    };
  });

  const monthlyMap = new Map<string, number>();
  for (const inv of invoices) {
    if ((inv.status === 'published' || inv.status === 'archived') && inv.invoiceDate) {
      const key = getMonthKey(new Date(inv.invoiceDate));
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + (inv.calculations?.total ?? 0));
    }
  }

  const monthlyRevenue = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, revenue]) => ({
      month,
      label: month,
      revenue,
    }));

  const recentActivity = [
    ...recentPayments.slice(0, 5).map((p) => ({
      _id: p._id.toString(),
      type: 'payment_received' as const,
      title: `Payment received`,
      description: `${p.clientName || 'A client'} paid ${p.currency ?? 'USD'} ${p.amount.toLocaleString()}`,
      amount: p.amount,
      currency: p.currency,
      date: p.createdAt,
      invoiceId: p.invoiceId?.toString() ?? '',
    })),
    ...invoices.slice(0, 3).map((inv) => ({
      _id: inv._id.toString(),
      type: 'invoice_created' as const,
      title: `Invoice ${inv.invoiceNumber} created`,
      description: `${inv.clientInfo?.name || 'A client'} — ${inv.customization?.currency ?? 'USD'} ${(inv.calculations?.total ?? 0).toLocaleString()}`,
      amount: inv.calculations?.total ?? 0,
      currency: inv.customization?.currency ?? 'USD',
      date: inv.createdAt,
      invoiceId: inv._id.toString(),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return {
    overview: {
      totalInvoices: invoices.length,
      totalRevenue,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
    },
    monthlyRevenue,
    latestInvoices,
    recentActivity,
  };
}
