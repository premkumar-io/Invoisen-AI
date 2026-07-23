import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  authStatus,
} from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { isGoogleAuthEnabled } from '../../config/env.js';

export const authRouter = Router();

// Public config endpoint — returns which OAuth providers are enabled
authRouter.get('/config', (_req, res) => {
  res.status(200).json({ success: true, data: { isGoogleAuthEnabled } });
});

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/logout', requireAuth, logout);
authRouter.post('/refresh', refresh);
authRouter.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), resetPassword);
authRouter.get('/status', requireAuth, authStatus);

