import { Router } from 'express';
import { isDbReady } from '../config/db.js';
import { successResponse } from '../utils/response.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json(
    successResponse({
      name: 'Invoisen API',
      status: 'ok',
      endpoints: {
        health: '/health',
        readiness: '/ready',
        api: '/api/v1',
      },
    })
  );
});

healthRouter.get('/health', (_req, res) => {
  res.status(200).json(successResponse({ status: 'ok' }));
});

healthRouter.get('/ready', (_req, res) => {
  if (isDbReady()) {
    res.status(200).json(successResponse({ status: 'ready', database: 'connected' }));
  } else {
    res.status(503).json({
      success: false,
      error: { code: 'NOT_READY', message: 'Database not connected' },
    });
  }
});
