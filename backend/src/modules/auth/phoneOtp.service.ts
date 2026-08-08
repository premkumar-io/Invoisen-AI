import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PhoneOtp } from './phoneOtp.model.js';
import { User } from '../users/user.model.js';
import { getWhatsAppProvider } from '../../providers/whatsapp/whatsapp.factory.js';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export function formatE164Phone(rawPhone: string): string {
  const cleaned = rawPhone.replace(/[^\d+]/g, '');
  if (!cleaned) {
    throw new AppError('INVALID_PHONE', 'Invalid phone number format.', 400);
  }
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

export class PhoneOtpService {
  public static async updatePhone(userId: string, rawPhone: string) {
    const phone = formatE164Phone(rawPhone);

    const existingUser = await User.findOne({ phone, _id: { $ne: userId } });
    if (existingUser) {
      throw new AppError('PHONE_IN_USE', 'This phone number is already registered to another account. Please use a different phone number.', 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { phone, phoneVerified: true },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      success: true,
      message: 'Phone number saved to database successfully.',
      phone: user.phone,
      phoneVerified: true,
    };
  }

  public static async sendOtp(userId: string, rawPhone: string) {
    // Mobile OTP disabled by design: directly save phone to database
    return this.updatePhone(userId, rawPhone);
  }

  public static async verifyOtp(userId: string, rawPhone: string, _inputOtp?: string) {
    // Mobile OTP disabled by design: directly save phone to database
    return this.updatePhone(userId, rawPhone);
  }

  public static async getStatus(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return {
      phone: user.phone || null,
      phoneVerified: Boolean(user.phone),
    };
  }
}

