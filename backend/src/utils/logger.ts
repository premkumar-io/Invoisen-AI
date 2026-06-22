import winston from 'winston';
import { env } from '../config/env.js';

const redactFormat = winston.format((info) => {
  const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken', 'authorization'];
  for (const key of sensitiveKeys) {
    if (key in info) {
      info[key] = '[REDACTED]';
    }
  }
  return info;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    redactFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});
