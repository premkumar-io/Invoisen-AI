import { User, toSafeUser } from './user.model.js';
import { Invoice } from '../invoices/invoice.model.js';
import { Settings } from '../settings/settings.model.js';
import { Client } from '../clients/client.model.js';
import { Product } from '../products/product.model.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import type { UpdateProfileInput } from './user.schema.js';

export async function getProfile(userId: string) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new NotFoundError('User not found');
  if (user.avatar && (user.avatar.startsWith('data:') || user.avatar.length > 120)) {
    const cleanName = (user.fullName || 'User').replace(/[^a-zA-Z0-9 ]/g, '');
    user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=6366f1&color=fff&size=128`;
    await user.save();
  }
  return toSafeUser(user);
}

export async function checkUsernameAvailability(username: string, currentUserId?: string) {
  const clean = (username || '').trim();
  if (!clean) {
    return { available: false, message: 'Username cannot be empty.' };
  }

  const query: any = {
    displayName: { $regex: new RegExp(`^${clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  };
  if (currentUserId) {
    query._id = { $ne: currentUserId };
  }

  const existing = await User.findOne(query);
  if (existing) {
    return { available: false, message: `Username "${clean}" is already taken. Please choose a different username.` };
  }

  return { available: true, message: 'Username is available.' };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const currentUser = await User.findById(userId);
  if (!currentUser) throw new NotFoundError('User not found');

  if (typeof input.email === 'string' && input.email.trim() !== '') {
    const cleanEmail = input.email.trim().toLowerCase();
    if (cleanEmail !== currentUser.email) {
      const existing = await User.findOne({ email: cleanEmail, _id: { $ne: userId } });
      if (existing) throw new ConflictError('Email already in use by another account');
    }
  }

  if (typeof input.displayName === 'string' && input.displayName.trim() !== '') {
    const cleanUsername = input.displayName.trim();
    if (cleanUsername.toLowerCase() !== (currentUser.displayName || '').toLowerCase()) {
      const check = await checkUsernameAvailability(cleanUsername, userId);
      if (!check.available) {
        throw new ConflictError(check.message);
      }
    }
  }

  if (typeof input.phone === 'string' && input.phone.trim() !== '') {
    const cleanedPhone = input.phone.replace(/[^\d+]/g, '');
    const formattedPhone = cleanedPhone.startsWith('+') ? cleanedPhone : `+${cleanedPhone}`;
    if (formattedPhone !== currentUser.phone) {
      const existingPhoneUser = await User.findOne({ phone: formattedPhone, _id: { $ne: userId } });
      if (existingPhoneUser) {
        throw new ConflictError('This phone number is already registered to another account. Please use a different phone number.');
      }
    }
  }

  const updateFields: Record<string, any> = {};
  if (input.fullName !== undefined) updateFields.fullName = input.fullName;
  if (input.displayName !== undefined) updateFields.displayName = input.displayName ? input.displayName.trim() : '';
  if (typeof input.email === 'string' && input.email.trim() !== '') {
    const cleanEmail = input.email.trim().toLowerCase();
    updateFields.email = cleanEmail;
    if (cleanEmail !== currentUser.email && input.emailVerified === undefined) {
      updateFields.emailVerified = false;
    }
  }
  if (input.avatar !== undefined) {
    if (!input.avatar) {
      updateFields.avatar = null;
    } else if (typeof input.avatar === 'string' && (input.avatar.startsWith('data:') || input.avatar.length > 120)) {
      const cleanName = (currentUser.fullName || 'User').replace(/[^a-zA-Z0-9 ]/g, '');
      updateFields.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=6366f1&color=fff&size=128`;
    } else {
      updateFields.avatar = input.avatar;
    }
  }
  if (input.phone !== undefined) {
    if (typeof input.phone === 'string' && input.phone.trim() !== '') {
      const cleaned = input.phone.replace(/[^\d+]/g, '');
      updateFields.phone = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
      updateFields.phoneVerified = true;
    } else {
      updateFields.phone = null;
      updateFields.phoneVerified = false;
    }
  }
  if (input.phoneVerified !== undefined && updateFields.phoneVerified === undefined) updateFields.phoneVerified = input.phoneVerified;
  if (input.emailVerified !== undefined) updateFields.emailVerified = input.emailVerified;
  if (input.country !== undefined) updateFields.country = input.country;
  if (input.timeZone !== undefined) updateFields.timeZone = input.timeZone;
  if (input.language !== undefined) updateFields.language = input.language;
  if (input.plan !== undefined && input.plan !== null) updateFields.plan = input.plan;

  const user = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select('+password');
  if (!user) throw new NotFoundError('User not found');
  return toSafeUser(user);
}

export async function exportUserData(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const [settings, invoices, clients, products] = await Promise.all([
    Settings.findOne({ userId }).lean(),
    Invoice.find({ userId }).lean(),
    Client.find({ userId }).lean(),
    Product.find({ userId }).lean(),
  ]);

  return {
    profile: toSafeUser(user),
    settings,
    invoices,
    clients,
    products,
    exportedAt: new Date().toISOString(),
  };
}

export async function deleteAccount(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  await Promise.all([
    User.findByIdAndDelete(userId),
    Settings.deleteMany({ userId }),
    Invoice.deleteMany({ userId }),
    Client.deleteMany({ userId }),
    Product.deleteMany({ userId }),
  ]);

  return { message: 'Account and associated workspace data deleted successfully' };
}
