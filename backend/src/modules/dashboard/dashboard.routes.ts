import { Router } from 'express';
import { getStats } from './dashboard.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get('/stats', getStats);
