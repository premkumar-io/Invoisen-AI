import { Types } from 'mongoose';
import { Invoice } from '../invoices/invoice.model.js';

export async function getDashboardStats(userId: string) {
  const uid = new Types.ObjectId(userId);
  const baseFilter = { userId: uid, isDeleted: false };

  const [total, draft, published, archived, recentInvoices] = await Promise.all([
    Invoice.countDocuments(baseFilter),
    Invoice.countDocuments({ ...baseFilter, status: 'draft' }),
    Invoice.countDocuments({ ...baseFilter, status: 'published' }),
    Invoice.countDocuments({ ...baseFilter, status: 'archived' }),
    Invoice.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('invoiceNumber clientInfo.name calculations.total status invoiceDate createdAt')
      .lean(),
  ]);

  const recent = recentInvoices.map((inv) => ({
    _id: inv._id,
    invoiceNumber: inv.invoiceNumber,
    clientName: inv.clientInfo?.name ?? '',
    amount: inv.calculations?.total ?? 0,
    status: inv.status,
    date: inv.invoiceDate ?? inv.createdAt,
  }));

  return {
    widgets: { total, draft, published, archived },
    recentInvoices: recent,
  };
}
