import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, mapJwtError } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import { User } from '../modules/users/user.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        fullName: string;
        role: 'user' | 'admin';
        plan: 'free' | 'pro' | 'enterprise';
      };
    }
  }
}

export type AuthRequest = Request & {
  user?: Express.Request['user'];
};

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }

    const token = header.slice(7);
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      mapJwtError(err);
    }

    const user = await User.findById(payload.sub).select('-password -refreshTokenHash');
    if (!user) {
      throw new UnauthorizedError('TOKEN_INVALID', 'Invalid token');
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      plan: user.plan,
    };

    next();
  } catch (err) {
    next(err);
  }
}
