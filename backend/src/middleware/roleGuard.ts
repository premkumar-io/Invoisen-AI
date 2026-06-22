import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.js';

type Role = 'user' | 'admin';

export function roleGuard(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError());
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError());
      return;
    }
    next();
  };
}
