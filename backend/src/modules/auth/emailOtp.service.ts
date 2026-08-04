import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { EmailOtp } from './emailOtp.model.js';
import { User, toSafeUser } from '../users/user.model.js';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import { sendEmailOtpEmail } from '../../services/email.service.js';

export class EmailOtpService {
  public static async sendOtp(userId: string, rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new AppError('INVALID_EMAIL', 'Please enter a valid email address.', 400);
    }

    // Check if email is already used by another account
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new AppError('EMAIL_IN_USE', 'This email address is already registered with another account.', 400);
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Rate Limit: Max 5 OTP requests per hour
    const hourlyCount = await EmailOtp.countDocuments({
      email,
      createdAt: { $gte: oneHourAgo },
    });

    if (hourlyCount >= 5) {
      throw new AppError('RATE_LIMIT_EXCEEDED', 'Maximum 5 email OTP requests allowed per hour. Please try again later.', 429);
    }

    // Delete existing active OTPs for this user
    await EmailOtp.deleteMany({ userId });

    // Generate random 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes TTL

    await EmailOtp.create({
      userId,
      email,
      otpHash,
      expiresAt,
      attempts: 0,
      resendCount: 1,
    });

    logger.info(`Email OTP generated for user ${userId} (${email}): ${rawOtp}`);

    try {
      await sendEmailOtpEmail(email, rawOtp);
    } catch (err: any) {
      logger.error('Failed to send email OTP via email service:', err);
    }

    return {
      success: true,
      message: `Verification code sent to ${email}.`,
      cooldownSeconds: 60,
      expiresAt,
    };
  }

  public static async verifyOtp(userId: string, rawEmail: string, inputOtp: string) {
    const email = rawEmail.trim().toLowerCase();
    const now = new Date();

    const otpRecord = await EmailOtp.findOne({ userId, email });

    if (!otpRecord) {
      throw new AppError('INVALID_OTP', 'No active verification code found for this email. Please request a new OTP.', 400);
    }

    if (otpRecord.expiresAt && otpRecord.expiresAt < now) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      throw new AppError('EXPIRED_OTP', 'The verification code has expired. Please request a new OTP.', 400);
    }

    const currentAttempts = otpRecord.attempts ?? 0;
    if (currentAttempts >= 5) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      throw new AppError('TOO_MANY_ATTEMPTS', 'Too many invalid attempts. This code has been invalidated for security.', 429);
    }

    const isValid = await bcrypt.compare(inputOtp.trim(), otpRecord.otpHash || '');

    if (!isValid) {
      otpRecord.attempts = currentAttempts + 1;
      await otpRecord.save();
      const remainingAttempts = 5 - otpRecord.attempts;
      throw new AppError('INVALID_OTP', `Invalid verification code. ${remainingAttempts} attempts remaining.`, 400);
    }

    // Success! Update User record in MongoDB
    const user = await User.findByIdAndUpdate(
      userId,
      { email, emailVerified: true },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Clean up OTP records
    await EmailOtp.deleteMany({ userId });

    logger.info(`Email verification successful for user ${userId} (${email})`);

    return {
      success: true,
      message: 'Email address updated successfully.',
      user: toSafeUser(user),
    };
  }
}
