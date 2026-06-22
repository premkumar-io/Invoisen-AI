import { User, toSafeUser } from '../users/user.model.js';
import { Invoice } from '../invoices/invoice.model.js';
import { ContactRequest } from '../contact/contact.model.js';
import { NotFoundError, AppError } from '../../utils/errors.js';

export async function listUsers(query: { page: number; limit: number; search?: string }) {
  const filter: Record<string, unknown> = {};
  if (query.search) {
    filter.$or = [
      { email: { $regex: query.search, $options: 'i' } },
      { fullName: { $regex: query.search, $options: 'i' } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    User.countDocuments(filter),
  ]);

  return {
    data: users.map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      plan: u.plan,
      createdAt: u.createdAt,
    })),
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
}

export async function updateUser(
  adminId: string,
  userId: string,
  input: { role?: 'user' | 'admin'; plan?: 'free' | 'pro' | 'enterprise' }
) {
  if (adminId === userId && input.role === 'user') {
    throw new AppError('CANNOT_SELF_DEMOTE', 'Cannot remove your own admin role', 403);
  }

  const user = await User.findByIdAndUpdate(userId, { $set: input }, { new: true });
  if (!user) throw new NotFoundError('User not found');
  return toSafeUser(user);
}

export async function getAnalytics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    totalInvoices,
    publishedInvoices,
    archivedInvoices,
    draftInvoices,
    newContacts,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Invoice.countDocuments({ isDeleted: false }),
    Invoice.countDocuments({ status: 'published', isDeleted: false }),
    Invoice.countDocuments({ status: 'archived', isDeleted: false }),
    Invoice.countDocuments({ status: 'draft', isDeleted: false }),
    ContactRequest.countDocuments({ status: 'new' }),
  ]);

  return {
    users: { total: totalUsers, newRegistrations: newUsers, activeUsers: totalUsers },
    invoices: { total: totalInvoices, published: publishedInvoices, archived: archivedInvoices, draft: draftInvoices },
    contacts: { pending: newContacts },
  };
}

export async function listContacts(query: { page: number; limit: number; status?: string }) {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;
  const [data, total] = await Promise.all([
    ContactRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    ContactRequest.countDocuments(filter),
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

export async function updateContactStatus(contactId: string, status: 'new' | 'read' | 'resolved') {
  const contact = await ContactRequest.findByIdAndUpdate(contactId, { status }, { new: true });
  if (!contact) throw new NotFoundError('Contact request not found');
  return contact;
}
