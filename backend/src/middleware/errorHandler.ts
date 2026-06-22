import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { TokenExpiredError, TokenInvalidError } from '../utils/jwt.js';
import { NotFoundError } from '../utils/errors.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof TokenExpiredError) {
    res.status(401).json(errorResponse('TOKEN_EXPIRED', err.message));
    return;
  }

  if (err instanceof TokenInvalidError) {
    res.status(401).json(errorResponse('TOKEN_INVALID', err.message));
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json(errorResponse('NOT_FOUND', err.message));
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.code, err.message, err.fields));
    return;
  }

  logger.error('Unhandled error', { err });
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : String(err);
  res.status(500).json(errorResponse('INTERNAL_ERROR', message));
}
