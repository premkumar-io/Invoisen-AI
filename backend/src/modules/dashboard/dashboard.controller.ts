import type { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service.js';
import { successResponse } from '../../utils/response.js';

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await dashboardService.getDashboardStats(req.user!._id);
    res.json(successResponse(data));
  } catch (err) {
    next(err);
  }
}
