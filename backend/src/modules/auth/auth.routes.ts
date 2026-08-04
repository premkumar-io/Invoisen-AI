import { Router, type Request, type Response } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  changePassword,
  authStatus,
} from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailOtpSchema,
} from './auth.schema.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { isGoogleAuthEnabled, env } from '../../config/env.js';
import { verifyGoogleIdToken } from './googleToken.service.js';
import { findOrCreateUserFromGoogle } from './google.service.js';
import { createTokens } from './auth.service.js';
import { getRefreshCookieOptions, REFRESH_COOKIE } from './auth.constants.js';

export const authRouter = Router();

// ── Public: feature flags ────────────────────────────────────────────────────
authRouter.get('/config', (_req, res) => {
  res.status(200).json({ success: true, data: { isGoogleAuthEnabled } });
});

// ── Google Identity Services (GIS) id-token endpoint ────────────────────────
// The frontend loads Google's JS SDK, the user clicks "Sign in with Google",
// Google returns a credential (JWT). We verify + exchange it for our tokens.
// Only GOOGLE_CLIENT_ID is required — no secret or callback URL needed.
authRouter.post('/google/id-token', async (req: Request, res: Response) => {
  try {
    if (!env.GOOGLE_CLIENT_ID) {
      res.status(503).json({
        success: false,
        error: {
          code: 'GOOGLE_AUTH_DISABLED',
          message: 'Google authentication is not configured on the server.',
        },
      });
      return;
    }

    const { credential } = req.body as { credential?: string };
    if (!credential || typeof credential !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIAL', message: 'Google credential token is required.' },
      });
      return;
    }

    const googleUser = await verifyGoogleIdToken(credential, env.GOOGLE_CLIENT_ID);

    if (!googleUser.email || !googleUser.email_verified) {
      res.status(400).json({
        success: false,
        error: { code: 'UNVERIFIED_EMAIL', message: 'Google account email must be verified.' },
      });
      return;
    }

    const user = await findOrCreateUserFromGoogle({
      id: googleUser.sub,
      email: googleUser.email,
      displayName: googleUser.name || googleUser.email,
      picture: googleUser.picture,
    });

    const { accessToken, refreshToken } = await createTokens(
      user._id.toString(),
      user.role,
      user.plan,
      user.refreshTokenVersion
    );

    res.cookie(REFRESH_COOKIE, refreshToken, getRefreshCookieOptions());

    const isFormSubmit =
      req.headers['content-type']?.includes('application/x-www-form-urlencoded') ||
      req.headers['accept']?.includes('text/html');

    if (isFormSubmit) {
      res.redirect(`${env.CLIENT_URL}/auth/callback?accessToken=${accessToken}`);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          plan: user.plan,
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Google sign-in failed.';
    const isFormSubmit =
      req.headers['content-type']?.includes('application/x-www-form-urlencoded') ||
      req.headers['accept']?.includes('text/html');

    if (isFormSubmit) {
      res.redirect(`${env.CLIENT_URL}/login?error=${encodeURIComponent(message)}`);
      return;
    }

    res.status(401).json({
      success: false,
      error: { code: 'GOOGLE_AUTH_FAILED', message },
    });
  }
});

import {
  getSessionsHandler,
  revokeSessionHandler,
} from './auth.controller.js';
import {
  updatePhoneHandler,
  sendPhoneOtpHandler,
  resendPhoneOtpHandler,
  verifyPhoneOtpHandler,
  getPhoneStatusHandler,
} from './phoneOtp.controller.js';
import {
  sendEmailOtpHandler,
  verifyEmailOtpHandler,
} from './emailOtp.controller.js';

// ── Phone OTP & Database Storage Routes ──────────────────────────────────────────────
authRouter.put('/phone-number', requireAuth, updatePhoneHandler);
authRouter.patch('/phone-number', requireAuth, updatePhoneHandler);
authRouter.post('/send-phone-otp', requireAuth, sendPhoneOtpHandler);
authRouter.post('/resend-phone-otp', requireAuth, resendPhoneOtpHandler);
authRouter.post('/verify-phone-otp', requireAuth, verifyPhoneOtpHandler);
authRouter.get('/phone-status', requireAuth, getPhoneStatusHandler);

// ── Active Sessions Routes ──────────────────────────────────────────────────────────
authRouter.get('/sessions', requireAuth, getSessionsHandler);
authRouter.delete('/sessions/:sessionId', requireAuth, revokeSessionHandler);

// ── Email OTP Verification Routes ────────────────────────────────────────────────────
authRouter.post('/send-email-otp', requireAuth, sendEmailOtpHandler);
authRouter.post('/resend-email-otp', requireAuth, sendEmailOtpHandler);
authRouter.post('/verify-email-otp', requireAuth, validate(verifyEmailOtpSchema), verifyEmailOtpHandler);

// ── Standard auth routes ─────────────────────────────────────────────────────
authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/logout', requireAuth, logout);
authRouter.post('/refresh', refresh);
authRouter.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), resetPassword);
authRouter.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword);
authRouter.get('/status', requireAuth, authStatus);
