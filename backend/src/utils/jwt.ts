import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  plan: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: { sub: string; version: number }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string; version: number } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; version: number };
}

export class TokenExpiredError extends Error {
  code = 'TOKEN_EXPIRED';
  statusCode = 401;
}

export class TokenInvalidError extends Error {
  code = 'TOKEN_INVALID';
  statusCode = 401;
}

export function mapJwtError(err: unknown): never {
  if (err instanceof jwt.TokenExpiredError) {
    const e = new TokenExpiredError('Access token expired');
    throw e;
  }
  if (err instanceof jwt.JsonWebTokenError) {
    const e = new TokenInvalidError('Invalid token');
    throw e;
  }
  throw err;
}
