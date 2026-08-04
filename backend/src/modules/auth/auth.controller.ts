import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import { successResponse } from '../../utils/response.js';
import { REFRESH_COOKIE } from './auth.constants.js';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.registerUser(req.body, res);
    res.status(201).json(successResponse({ user: result.user, accessToken: result.accessToken }));
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.loginUser(req.body, res);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.logoutUser(req.user!._id, res);
    res.status(200).json(successResponse({ message: 'Logged out' }));
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const result = await authService.refreshTokens(token, res);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.forgotPassword(req.body);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.changePassword(req.user!._id, req.body);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function sendEmailOtpHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.sendEmailOtp(req.user!._id);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailOtpHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.verifyEmailOtp(req.user!._id, req.body.otp);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function authStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    res.status(200).json(successResponse({ authenticated: Boolean(user), user: user ?? null }));
  } catch (err) {
    next(err);
  }
}

import * as sessionService from './session.service.js';

export async function getSessionsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessions = await sessionService.getUserSessions(req.user!._id, req);
    res.status(200).json(successResponse(sessions));
  } catch (err) {
    next(err);
  }
}

export async function revokeSessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = req.params.sessionId as string;
    await sessionService.revokeSession(req.user!._id, sessionId);
    res.status(200).json(successResponse({ message: 'Session revoked successfully' }));
  } catch (err) {
    next(err);
  }
}
