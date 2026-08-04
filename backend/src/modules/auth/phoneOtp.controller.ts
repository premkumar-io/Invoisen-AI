import type { Request, Response, NextFunction } from 'express';
import { PhoneOtpService } from './phoneOtp.service.js';
import { successResponse } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';

export async function updatePhoneHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string') {
      throw new AppError('INVALID_INPUT', 'Phone number is required', 400);
    }

    const result = await PhoneOtpService.updatePhone(userId, phone);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function sendPhoneOtpHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string') {
      throw new AppError('INVALID_INPUT', 'Phone number is required', 400);
    }

    const result = await PhoneOtpService.sendOtp(userId, phone);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function resendPhoneOtpHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string') {
      throw new AppError('INVALID_INPUT', 'Phone number is required', 400);
    }

    const result = await PhoneOtpService.sendOtp(userId, phone);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function verifyPhoneOtpHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { phone, otp } = req.body;
    if (!phone || typeof phone !== 'string') {
      throw new AppError('INVALID_INPUT', 'Phone number is required', 400);
    }
    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      throw new AppError('INVALID_INPUT', 'A valid 6-digit OTP code is required', 400);
    }

    const result = await PhoneOtpService.verifyOtp(userId, phone, otp);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function getPhoneStatusHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    const result = await PhoneOtpService.getStatus(userId);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}
