import { Types } from 'mongoose';
import { Invoice } from '../invoices/invoice.model.js';
import { Payment } from '../payments/payment.model.js';
import { Client } from '../clients/client.model.js';
import { derivePaymentState } from '../invoices/invoice.service.js';

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export async function getDashboardStats(userId: string) {
  const uid = new Types.ObjectId(userId);
  const baseFilter = { userId: uid, isDeleted: false };

  const [invoices, recentPayments, clients] = await Promise.all([
    Invoice.find(baseFilter).sort({ createdAt: -1 }).lean(),
    Payment.find({ userId: uid, status: 'completed' }).sort({ createdAt: -1 }).limit(20).lean(),
    Client.find({ userId: uid, isDeleted: false }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const paymentsByInvoice = new Map<string, number>();
  for (const payment of recentPayments) {
    if (!payment.invoiceId) continue;
    const key = payment.invoiceId.toString();
    paymentsByInvoice.set(key, (paymentsByInvoice.get(key) ?? 0) + payment.amount);
  }

  const now = new Date();
  let totalRevenue = 0;
  let paidRevenue = 0;
  let pendingAmount = 0;
  let paidInvoices = 0;
  let pendingInvoices = 0;
  let overdueInvoices = 0;

  const mappedInvoices = invoices.map((inv) => {
    const amountPaid = paymentsByInvoice.get(inv._id.toString()) ?? 0;
    const invTotal = inv.calculations?.total ?? 0;
    const state = derivePaymentState({
      total: invTotal,
      amountPaid,
      dueDate: new Date(inv.dueDate),
      status: inv.status,
      now,
    });

    totalRevenue += invTotal;

    if (state.paymentStatus === 'paid') {
      paidInvoices += 1;
      paidRevenue += invTotal;
    } else if (state.paymentStatus === 'overdue') {
      overdueInvoices += 1;
      pendingAmount += state.amountDue;
    } else {
      pendingInvoices += 1;
      pendingAmount += state.amountDue;
    }

    return {
      _id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientInfo?.name ?? '',
      amount: invTotal,
      status: inv.status,
      paymentStatus: state.paymentStatus,
      currency: inv.customization?.currency ?? 'USD',
      date: inv.invoiceDate ?? inv.createdAt,
      dueDate: inv.dueDate,
    };
  });

  const latestInvoices = mappedInvoices.slice(0, 5);

  const monthlyMap = new Map<string, number>();
  for (const inv of invoices) {
    if (inv.invoiceDate) {
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

  const clientBilledMap = new Map<string, { total: number; count: number }>();
  for (const inv of invoices) {
    const clientName = inv.clientInfo?.name?.trim();
    if (!clientName) continue;
    const existing = clientBilledMap.get(clientName) || { total: 0, count: 0 };
    clientBilledMap.set(clientName, {
      total: existing.total + (inv.calculations?.total ?? 0),
      count: existing.count + 1,
    });
  }

  const recentClients = clients.slice(0, 4).map((c) => {
    const stats = clientBilledMap.get(c.name) || { total: 0, count: 0 };
    return {
      _id: c._id.toString(),
      name: c.name,
      email: c.email || c.company || 'Client',
      totalBilled: `$${stats.total.toLocaleString()}`,
      invoices: stats.count,
      status: 'Active',
    };
  });

  const upcomingCalendarEvents = mappedInvoices
    .filter((inv) => inv.paymentStatus === 'unpaid' || inv.paymentStatus === 'overdue' || inv.paymentStatus === 'partially_paid')
    .slice(0, 4)
    .map((inv) => ({
      title: `${inv.clientName || 'Invoice'} (${inv.invoiceNumber})`,
      date: new Date(inv.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      type: inv.paymentStatus === 'overdue' ? 'Overdue' : 'Due Date',
      badge: inv.paymentStatus === 'overdue' ? 'Action Required' : 'Pending',
    }));

  const recentActivity = [
    ...recentPayments.slice(0, 5).map((p) => ({
      _id: p._id.toString(),
      type: 'payment_received' as const,
      title: `Payment Received`,
      description: `${p.clientName || 'Client'} paid ${p.currency ?? 'USD'} ${p.amount.toLocaleString()}`,
      amount: p.amount,
      currency: p.currency,
      date: new Date(p.createdAt).toISOString(),
      invoiceId: p.invoiceId?.toString() ?? '',
    })),
    ...invoices.slice(0, 5).map((inv) => ({
      _id: inv._id.toString(),
      type: 'invoice_created' as const,
      title: `Invoice ${inv.invoiceNumber} Created`,
      description: `${inv.clientInfo?.name || 'Client'} — ${inv.customization?.currency ?? 'USD'} ${(inv.calculations?.total ?? 0).toLocaleString()}`,
      amount: inv.calculations?.total ?? 0,
      currency: inv.customization?.currency ?? 'USD',
      date: new Date(inv.createdAt).toISOString(),
      invoiceId: inv._id.toString(),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return {
    overview: {
      totalInvoices: invoices.length,
      totalRevenue,
      paidRevenue,
      pendingAmount,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
    },
    monthlyRevenue,
    latestInvoices,
    recentActivity,
    recentClients,
    upcomingCalendarEvents,
  };
}
