import type { Request, Response, NextFunction } from 'express';
import * as userService from './user.service.js';
import { successResponse } from '../../utils/response.js';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await userService.getProfile(req.user!._id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await userService.updateProfile(req.user!._id, req.body);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function exportMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await userService.exportUserData(req.user!._id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}
