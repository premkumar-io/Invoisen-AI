import type { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';

type SanitizableRequestKey = 'body' | 'params' | 'headers' | 'query';

function isSanitizable(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === 'object' && value !== null;
}

export function mongoSanitizeRequest(req: Request, _res: Response, next: NextFunction): void {
  const keys: SanitizableRequestKey[] = ['body', 'params', 'headers', 'query'];

  for (const key of keys) {
    const value = req[key];
    if (isSanitizable(value)) {
      mongoSanitize.sanitize(value);
    }
  }

  next();
}
