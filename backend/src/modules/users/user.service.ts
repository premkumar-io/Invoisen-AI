import { User, toSafeUser } from './user.model.js';
import { Invoice } from '../invoices/invoice.model.js';
import { Settings } from '../settings/settings.model.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import type { UpdateProfileInput } from './user.schema.js';

export async function getProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  return toSafeUser(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  if (input.email) {
    const existing = await User.findOne({ email: input.email.toLowerCase(), _id: { $ne: userId } });
    if (existing) throw new ConflictError('Email already in use');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      ...(input.fullName ? { fullName: input.fullName } : {}),
      ...(input.email ? { email: input.email.toLowerCase() } : {}),
    },
    { new: true }
  );
  if (!user) throw new NotFoundError('User not found');
  return toSafeUser(user);
}

export async function exportUserData(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const [settings, invoices] = await Promise.all([
    Settings.findOne({ userId }),
    Invoice.find({ userId }).lean(),
  ]);

  return {
    profile: toSafeUser(user),
    settings,
    invoices,
    exportedAt: new Date().toISOString(),
  };
}
