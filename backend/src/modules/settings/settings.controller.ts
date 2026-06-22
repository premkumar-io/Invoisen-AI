import type { Request, Response, NextFunction } from 'express';
import * as settingsService from './settings.service.js';
import { successResponse } from '../../utils/response.js';

export async function getSettingsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await settingsService.getSettings(req.user!._id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}

export async function updateSettingsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await settingsService.updateSettings(req.user!._id, req.body);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}
