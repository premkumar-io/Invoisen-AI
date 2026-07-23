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
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js';
import { generateSecureToken, hashToken } from '../../utils/tokenCompare.js';
import { ConflictError, UnauthorizedError, AppError } from '../../utils/errors.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../services/email.service.js';
import { env } from '../../config/env.js';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.schema.js';

export async function registerUser(input: RegisterInput, res: Response) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const hashed = await hashPassword(input.password);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    password: hashed,
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

  await sendWelcomeEmail(user.email, user.fullName);

  const tokens = await issueTokens(user._id.toString(), user.role, user.plan, user.refreshTokenVersion);
  await saveRefreshToken(user._id.toString(), tokens.refreshToken);

  res.cookie(REFRESH_COOKIE, tokens.refreshToken, getRefreshCookieOptions());

  return { user: toSafeUser(user), accessToken: tokens.accessToken };
}

export async function loginUser(input: LoginInput, res: Response) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select(
    '+password +refreshTokenHash'
  );
  if (!user) {
    throw new UnauthorizedError('UNAUTHORIZED', 'Invalid email or password');
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

  const user = await User.findById(resetDoc.userId);
  if (!user) {
    throw new UnauthorizedError('TOKEN_INVALID', 'Invalid or expired reset token');
  }

  user.password = await hashPassword(input.password);
  user.refreshTokenHash = null;
  user.refreshTokenVersion += 1;
  await user.save();
  await PasswordResetToken.deleteMany({ userId: user._id });

  return { message: 'Password reset successful' };
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
