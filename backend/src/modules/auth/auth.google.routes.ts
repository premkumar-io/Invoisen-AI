import { Router } from 'express';
import { randomBytes, createHash } from 'node:crypto';
import { createTokens } from './auth.service.js';
import { env, isGoogleAuthEnabled } from '../../config/env.js';
import type { IUser } from '../users/user.model.js';
import { getRefreshCookieOptions, REFRESH_COOKIE } from './auth.constants.js';
import { verifyGoogleIdToken } from './googleToken.service.js';
import { findOrCreateUserFromGoogle } from './google.service.js';

const router = Router();
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_OAUTH_STATE_COOKIE = 'googleOAuthState';
const GOOGLE_OAUTH_NONCE_COOKIE = 'googleOAuthNonce';
const GOOGLE_OAUTH_VERIFIER_COOKIE = 'googleOAuthVerifier';

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

function getGoogleCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 10 * 60 * 1000,
    path: '/api/v1/auth/google',
  };
}

function clearGoogleCookies(res: import('express').Response) {
  res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, { path: '/api/v1/auth/google' });
  res.clearCookie(GOOGLE_OAUTH_NONCE_COOKIE, { path: '/api/v1/auth/google' });
  res.clearCookie(GOOGLE_OAUTH_VERIFIER_COOKIE, { path: '/api/v1/auth/google' });
}

function redirectToGoogleUnavailable(res: import('express').Response) {
  res.redirect(`${env.CLIENT_URL}/login?error=google-auth-unavailable`);
}

function redirectToGoogleFailure(res: import('express').Response, reason = 'google-auth-failed') {
  res.redirect(`${env.CLIENT_URL}/login?error=${encodeURIComponent(reason)}`);
}

// 1. Redirects user to Google's consent screen in the SAME window
router.get('/google', (_req, res) => {
  if (!isGoogleAuthEnabled) {
    redirectToGoogleUnavailable(res);
    return;
  }

  const state = randomBytes(24).toString('base64url');
  const nonce = randomBytes(24).toString('base64url');
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

  res.cookie(GOOGLE_OAUTH_STATE_COOKIE, state, getGoogleCookieOptions());
  res.cookie(GOOGLE_OAUTH_NONCE_COOKIE, nonce, getGoogleCookieOptions());
  res.cookie(GOOGLE_OAUTH_VERIFIER_COOKIE, codeVerifier, getGoogleCookieOptions());

  const callbackUrl = env.GOOGLE_CALLBACK_URL || `http://localhost:${env.PORT}/api/v1/auth/google/callback`;

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonce);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('prompt', 'select_account');

  res.redirect(authUrl.toString());
});

// 2. Google redirects back to this endpoint after user authenticates in the SAME window
router.get('/google/callback', async (req, res, next) => {
  try {
    if (!isGoogleAuthEnabled) {
      redirectToGoogleUnavailable(res);
      return;
    }

    const returnedState = typeof req.query.state === 'string' ? req.query.state : undefined;
    const storedState = req.cookies?.[GOOGLE_OAUTH_STATE_COOKIE] as string | undefined;
    const storedNonce = req.cookies?.[GOOGLE_OAUTH_NONCE_COOKIE] as string | undefined;
    const storedVerifier = req.cookies?.[GOOGLE_OAUTH_VERIFIER_COOKIE] as string | undefined;
    clearGoogleCookies(res);

    if (!returnedState || !storedState || returnedState !== storedState || !storedNonce) {
      redirectToGoogleFailure(res, 'google-auth-invalid-state');
      return;
    }

    if (typeof req.query.error === 'string') {
      redirectToGoogleFailure(res, req.query.error);
      return;
    }

    const code = typeof req.query.code === 'string' ? req.query.code : undefined;
    if (!code) {
      redirectToGoogleFailure(res, 'google-auth-missing-code');
      return;
    }

    const callbackUrl = env.GOOGLE_CALLBACK_URL || `http://localhost:${env.PORT}/api/v1/auth/google/callback`;

    const tokenParams = new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    });

    if (!env.GOOGLE_CLIENT_SECRET) {
      redirectToGoogleFailure(res, 'google-client-secret-missing-in-backend-env');
      return;
    }

    tokenParams.set('client_secret', env.GOOGLE_CLIENT_SECRET);
    if (storedVerifier) {
      tokenParams.set('code_verifier', storedVerifier);
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams,
    });

    const tokenPayload = (await tokenResponse.json().catch(() => null)) as GoogleTokenResponse | null;
    if (!tokenResponse.ok || !tokenPayload?.id_token) {
      redirectToGoogleFailure(res, tokenPayload?.error ?? 'google-token-exchange-failed');
      return;
    }

    const googleUser = await verifyGoogleIdToken(tokenPayload.id_token, env.GOOGLE_CLIENT_ID!, storedNonce);
    const user = (await findOrCreateUserFromGoogle({
      id: googleUser.sub,
      email: googleUser.email!,
      displayName: googleUser.name || googleUser.email!,
      picture: googleUser.picture,
    })) as IUser;
    const { accessToken, refreshToken } = await createTokens(
      user._id.toString(),
      user.role,
      user.plan,
      user.refreshTokenVersion
    );

    res.cookie(REFRESH_COOKIE, refreshToken, getRefreshCookieOptions());

    // 3. Redirect to frontend with access token in the SAME window
    const redirectUrl = `${env.CLIENT_URL}/auth/callback?accessToken=${accessToken}`;
    res.redirect(redirectUrl);
  } catch (err) {
    if (!res.headersSent) {
      redirectToGoogleFailure(res);
      return;
    }
    next(err);
  }
});

export const googleAuthRoutes = router;
