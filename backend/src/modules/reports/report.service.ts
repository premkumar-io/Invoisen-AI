import { Types } from 'mongoose';
import { Invoice } from '../invoices/invoice.model.js';
import type { ReportQuery } from './report.schema.js';

function dateFilter(query: ReportQuery) {
  const filter: Record<string, unknown> = {};
  if (query.from || query.to) {
    filter.invoiceDate = {
      ...(query.from ? { $gte: query.from } : {}),
      ...(query.to ? { $lte: query.to } : {}),
    };
  }
  return filter;
}

function csvEscape(value: unknown) {
  const raw = String(value ?? '');
  if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

export async function getReportSummary(userId: string, query: ReportQuery) {
  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
    isDeleted: false,
    ...dateFilter(query),
  };

  if (query.currency) filter['customization.currency'] = query.currency;
  if (query.clientId) filter['clientInfo.clientId'] = new Types.ObjectId(query.clientId);

  const rawInvoices = await Invoice.find(filter)
    .select('invoiceNumber clientInfo calculations status dueDate invoiceDate customization.currency')
    .lean();

  const invoices = rawInvoices as any[];

  const now = new Date();
  const collected = invoices.reduce((sum, invoice) => sum + (invoice.payment?.amountPaid ?? 0), 0);
  const outstanding = invoices.reduce((sum, invoice) => sum + (invoice.payment?.amountDue ?? invoice.calculations.total), 0);
  const overdue = invoices.reduce((sum, invoice) => {
    const due = invoice.payment?.amountDue ?? invoice.calculations.total;
    return invoice.status === 'published' && due > 0 && invoice.dueDate < now ? sum + due : sum;
  }, 0);
  const gst = invoices.reduce((sum, invoice) => {
    return invoice.calculations.taxType === 'GST' ? sum + invoice.calculations.taxAmount : sum;
  }, 0);

  type ClientStat = { clientName: string; invoiceCount: number; totalBilled: number; totalPaid: number };
  const clientMap = invoices.reduce((map: Map<string, ClientStat>, invoice) => {
    const key = invoice.clientInfo?.name || 'Unknown client';
    const current = map.get(key) ?? { clientName: key, invoiceCount: 0, totalBilled: 0, totalPaid: 0 };
    current.invoiceCount += 1;
    current.totalBilled += invoice.calculations.total;
    current.totalPaid += invoice.payment?.amountPaid ?? 0;
    map.set(key, current);
    return map;
  }, new Map<string, ClientStat>());

  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.totalBilled - a.totalBilled)
    .slice(0, 10);

  return {
    totals: {
      invoiceCount: invoices.length,
      billed: Math.round(invoices.reduce((sum, invoice) => sum + invoice.calculations.total, 0) * 100) / 100,
      collected: Math.round(collected * 100) / 100,
      outstanding: Math.round(outstanding * 100) / 100,
      overdue: Math.round(overdue * 100) / 100,
      gst: Math.round(gst * 100) / 100,
    },
    topClients,
    invoices: invoices.map((invoice) => ({
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientInfo?.name ?? '',
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      paymentStatus: invoice.paymentStatus || 'unpaid',
      currency: invoice.customization?.currency ?? 'INR',
      total: invoice.calculations.total,
      taxAmount: invoice.calculations.taxAmount,
      amountPaid: invoice.payment?.amountPaid ?? 0,
      amountDue: invoice.payment?.amountDue ?? invoice.calculations.total,
    })),
  };
}

export async function getReportCsv(userId: string, query: ReportQuery) {
  const report = await getReportSummary(userId, query);
  const rows = [
    ['Invoice #', 'Client', 'Invoice Date', 'Due Date', 'Status', 'Payment Status', 'Currency', 'Total', 'GST/Tax', 'Paid', 'Due'],
    ...report.invoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.clientName,
      invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().slice(0, 10) : '',
      invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : '',
      invoice.status,
      invoice.paymentStatus,
      invoice.currency,
      invoice.total,
      invoice.taxAmount,
      invoice.amountPaid,
      invoice.amountDue,
    ]),
  ];

  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}
