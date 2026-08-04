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
      message: 'Phone number updated successfully.',
      phone: user.phone,
      phoneVerified: user.phoneVerified,
    };
  }

  public static async sendOtp(userId: string, rawPhone: string) {
    const phone = formatE164Phone(rawPhone);

    // Check if phone number is already registered to another user
    const existingUser = await User.findOne({ phone, _id: { $ne: userId } });
    if (existingUser) {
      throw new AppError('PHONE_IN_USE', 'This phone number is already registered to another account. Please use a different phone number.', 400);
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Rate Limit 1: Hourly cap (max 3 OTP requests per hour)
    const hourlyCount = await PhoneOtp.countDocuments({
      phone,
      createdAt: { $gte: oneHourAgo },
    });

    if (hourlyCount >= 3) {
      throw new AppError('RATE_LIMIT_EXCEEDED', 'Maximum 3 OTP requests allowed per hour. Please try again later.', 429);
    }

    // Rate Limit 2: 60-second resend cooldown
    const latestOtp = await PhoneOtp.findOne({ userId, phone }).sort({ createdAt: -1 });
    if (latestOtp) {
      const elapsedSeconds = Math.floor((now.getTime() - latestOtp.createdAt.getTime()) / 1000);
      if (elapsedSeconds < 60) {
        const remainingCooldown = 60 - elapsedSeconds;
        throw new AppError('COOLDOWN_ACTIVE', `Please wait ${remainingCooldown} seconds before requesting a new OTP.`, 429);
      }
    }

    // Delete existing active OTPs for this user
    await PhoneOtp.deleteMany({ userId });

    // Generate random 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes TTL

    await PhoneOtp.create({
      userId,
      phone,
      otpHash,
      expiresAt,
      attempts: 0,
      resendCount: (latestOtp?.resendCount || 0) + 1,
    });

    // Send OTP via configured WhatsApp Provider
    const provider = getWhatsAppProvider();
    const sent = await provider.sendWhatsAppOtp(phone, rawOtp);

    if (!sent) {
      logger.error(`Failed to dispatch WhatsApp message to ${phone} via provider ${provider.name}`);
      throw new AppError('WHATSAPP_DELIVERY_FAILED', 'Failed to dispatch WhatsApp verification code. Please check your phone number and try again.', 500);
    }

    logger.info(`WhatsApp OTP generated and sent to user ${userId} (${phone})`);

    return {
      success: true,
      message: `Verification code sent to your WhatsApp number (${phone}).`,
      cooldownSeconds: 60,
      expiresAt,
      providerName: provider.name,
    };
  }

  public static async verifyOtp(userId: string, rawPhone: string, inputOtp: string) {
    const phone = formatE164Phone(rawPhone);
    const now = new Date();

    const otpRecord = await PhoneOtp.findOne({ userId, phone });

    if (!otpRecord) {
      throw new AppError('INVALID_OTP', 'No active verification code found for this phone. Please request a new OTP.', 400);
    }

    if (otpRecord.expiresAt < now) {
      await PhoneOtp.deleteOne({ _id: otpRecord._id });
      throw new AppError('EXPIRED_OTP', 'The verification code has expired. Please request a new OTP.', 400);
    }

    if (otpRecord.attempts >= 5) {
      await PhoneOtp.deleteOne({ _id: otpRecord._id });
      throw new AppError('TOO_MANY_ATTEMPTS', 'Too many invalid attempts. This OTP has been invalidated for security. Please request a new code.', 429);
    }

    const isValid = await bcrypt.compare(inputOtp.trim(), otpRecord.otpHash);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remainingAttempts = 5 - otpRecord.attempts;
      throw new AppError('INVALID_OTP', `Invalid verification code. ${remainingAttempts} attempts remaining.`, 400);
    }

    // Success! Update User record
    const user = await User.findByIdAndUpdate(
      userId,
      { phone, phoneVerified: true },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Immediately invalidate and clean up all OTP records for this user
    await PhoneOtp.deleteMany({ userId });

    logger.info(`Phone verification successful for user ${userId} (${phone})`);

    return {
      success: true,
      message: 'Phone number verified successfully.',
      phone: user.phone,
      phoneVerified: true,
    };
  }

  public static async getStatus(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return {
      phone: user.phone || null,
      phoneVerified: user.phoneVerified || false,
    };
  }
}
