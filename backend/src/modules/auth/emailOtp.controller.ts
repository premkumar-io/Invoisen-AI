import type { Request, Response, NextFunction } from 'express';
import { EmailOtpService } from './emailOtp.service.js';
import { successResponse } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';

export async function sendEmailOtpHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      throw new AppError('INVALID_INPUT', 'Email address is required', 400);
    }

    const result = await EmailOtpService.sendOtp(userId, email);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailOtpHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { email, otp } = req.body;
    if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string') {
      throw new AppError('INVALID_INPUT', 'Email address and verification OTP are required', 400);
    }

    const result = await EmailOtpService.verifyOtp(userId, email, otp);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}
