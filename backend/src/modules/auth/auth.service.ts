import type { Response } from 'express';
import { User, toSafeUser } from '../users/user.model.js';
import { Settings } from '../settings/settings.model.js';
import {
  comparePassword,
  compareRefreshToken,
  hashPassword,
  hashRefreshToken,
  getRefreshCookieOptions,
  REFRESH_COOKIE,
  MAX_LOGIN_ATTEMPTS,
  LOCK_TIME_MS,
} from './auth.constants.js';
import { PasswordResetToken } from './passwordReset.model.js';
import { EmailOtp } from './emailOtp.model.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js';
import { generateSecureToken, hashToken } from '../../utils/tokenCompare.js';
import { ConflictError, UnauthorizedError, NotFoundError, AppError } from '../../utils/errors.js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendEmailOtpEmail } from '../../services/email.service.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from './auth.schema.js';

export async function registerUser(input: RegisterInput, res: Response) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  let formattedPhone: string | undefined = undefined;
  if (input.phone && input.phone.trim() !== '') {
    const cleaned = input.phone.replace(/[^\d+]/g, '');
    formattedPhone = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    const existingPhoneUser = await User.findOne({ phone: formattedPhone });
    if (existingPhoneUser) {
      throw new ConflictError('This phone number is already registered to another account. Please use a different phone number.');
    }
  }

  const hashed = await hashPassword(input.password);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    password: hashed,
    ...(formattedPhone ? { phone: formattedPhone, phoneVerified: true } : { phoneVerified: false }),
  });

  await Settings.create({
    userId: user._id,
    theme: 'light',
    defaultCurrency: 'USD',
    invoicePrefix: 'INV',
    businessProfile: {
      name: input.fullName,
      logoUrl: '',
      address: '',
      email: user.email,
      phone: '',
      gstNumber: '',
    },
  });

  sendWelcomeEmail(user.email, user.fullName).catch((err) =>
    logger.error('[Email Warning] Failed to dispatch welcome email:', err?.message || err)
  );

  const tokens = await issueTokens(user._id.toString(), user.role, user.plan, user.refreshTokenVersion);
  await saveRefreshToken(user._id.toString(), tokens.refreshToken);

  res.cookie(REFRESH_COOKIE, tokens.refreshToken, getRefreshCookieOptions());

  return { user: toSafeUser(user), accessToken: tokens.accessToken };
}

export async function loginUser(input: LoginInput, res: Response) {
  const identifier = input.email.trim();
  const identifierLower = identifier.toLowerCase();
  const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const user = await User.findOne({
    $or: [
      { email: identifierLower },
      { username: identifierLower },
      { displayName: { $regex: new RegExp(`^${escaped}$`, 'i') } },
    ],
  }).select('+password +refreshTokenHash');

  if (!user) {
    throw new UnauthorizedError('UNAUTHORIZED', 'Invalid email/username or password');
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError('ACCOUNT_LOCKED', 'Account temporarily locked. Try again later.', 423);
  }

  const valid = await comparePassword(input.password, user.password || '');
  if (!valid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw new UnauthorizedError('UNAUTHORIZED', 'Invalid email or password');
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  const tokens = await issueTokens(user._id.toString(), user.role, user.plan, user.refreshTokenVersion);
  await saveRefreshToken(user._id.toString(), tokens.refreshToken);

  res.cookie(REFRESH_COOKIE, tokens.refreshToken, getRefreshCookieOptions());

  return { user: toSafeUser(user), accessToken: tokens.accessToken };
}

export async function logoutUser(userId: string, res: Response) {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
}

export async function refreshTokens(refreshToken: string | undefined, res: Response) {
  if (!refreshToken) {
    throw new UnauthorizedError('REFRESH_TOKEN_INVALID', 'Refresh token missing');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('REFRESH_TOKEN_INVALID', 'Refresh token invalid');
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) {
    throw new UnauthorizedError('REFRESH_TOKEN_INVALID', 'Refresh token invalid');
  }

  if (payload.version !== user.refreshTokenVersion) {
    user.refreshTokenHash = null;
    user.refreshTokenVersion += 1;
    await user.save();
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    throw new UnauthorizedError('REFRESH_TOKEN_INVALID', 'Refresh token reuse detected');
  }

  const valid = await compareRefreshToken(refreshToken, user.refreshTokenHash);
  if (!valid) {
    user.refreshTokenHash = null;
    user.refreshTokenVersion += 1;
    await user.save();
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    throw new UnauthorizedError('REFRESH_TOKEN_INVALID', 'Refresh token invalid');
  }

  user.refreshTokenVersion += 1;
  await user.save();

  const tokens = await issueTokens(user._id.toString(), user.role, user.plan, user.refreshTokenVersion);
  await saveRefreshToken(user._id.toString(), tokens.refreshToken);

  res.cookie(REFRESH_COOKIE, tokens.refreshToken, getRefreshCookieOptions());

  return { accessToken: tokens.accessToken };
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (user) {
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }
  return { message: 'If an account exists, a reset link has been sent.' };
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token);
  const resetDoc = await PasswordResetToken.findOne({ tokenHash });
  if (!resetDoc) {
    throw new UnauthorizedError('TOKEN_INVALID', 'Invalid or expired reset token');
  }

  const user = await User.findById(resetDoc.userId).select('+password');
  if (!user) {
    throw new UnauthorizedError('TOKEN_INVALID', 'Invalid or expired reset token');
  }

  user.password = await hashPassword(input.password);
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.refreshTokenHash = null;
  user.refreshTokenVersion += 1;
  await user.save();
  await PasswordResetToken.deleteMany({ userId: user._id });

  return { message: 'Password reset successful' };
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await User.findById(userId).select('+password +refreshTokenHash');
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.password) {
    if (!input.currentPassword) {
      throw new UnauthorizedError('INVALID_PASSWORD', 'Current password is required');
    }
    const isValid = await comparePassword(input.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedError('INVALID_PASSWORD', 'Current password is incorrect');
    }
  }

  user.password = await hashPassword(input.newPassword);
  user.refreshTokenVersion += 1;
  await user.save();

  return { message: 'Password changed successfully' };
}

export async function sendEmailOtp(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  if (user.emailVerified) {
    return { message: 'Email is already verified', emailVerified: true };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await EmailOtp.deleteMany({ userId: user._id });
  await EmailOtp.create({
    userId: user._id,
    email: user.email,
    otp,
  });

  await sendEmailOtpEmail(user.email, otp);
  logger.info(`[Email OTP] Sent verification code ${otp} to ${user.email}`);

  return { message: 'Verification OTP sent to your email address' };
}

export async function verifyEmailOtp(userId: string, otp: string) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const otpDoc = await EmailOtp.findOne({ userId: user._id, otp });
  if (!otpDoc) {
    throw new UnauthorizedError('INVALID_OTP', 'Invalid or expired email OTP');
  }

  user.emailVerified = true;
  await user.save();
  await EmailOtp.deleteMany({ userId: user._id });

  return { message: 'Email verified successfully', user: toSafeUser(user) };
}

export async function createTokens(
  userId: string,
  role: string,
  plan: string,
  version: number
) {
  return issueTokens(userId, role, plan, version);
}

async function issueTokens(
  userId: string,
  role: string,
  plan: string,
  version: number
) {
  const accessToken = signAccessToken({ sub: userId, role, plan });
  const refreshToken = signRefreshToken({ sub: userId, version });
  return { accessToken, refreshToken };
}

async function saveRefreshToken(userId: string, refreshToken: string) {
  const hash = await hashRefreshToken(refreshToken);
  await User.findByIdAndUpdate(userId, { refreshTokenHash: hash });
}
