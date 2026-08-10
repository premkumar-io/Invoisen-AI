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
    path: '/',
  };
}

const GOOGLE_OAUTH_CLIENT_URL_COOKIE = 'googleOAuthClientUrl';

function clearGoogleCookies(res: import('express').Response) {
  res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, { path: '/' });
  res.clearCookie(GOOGLE_OAUTH_NONCE_COOKIE, { path: '/' });
  res.clearCookie(GOOGLE_OAUTH_VERIFIER_COOKIE, { path: '/' });
  res.clearCookie(GOOGLE_OAUTH_CLIENT_URL_COOKIE, { path: '/' });
}

function getCallbackUrl(req: import('express').Request): string {
  const host = req.get('host') || `localhost:${env.PORT || 5050}`;
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  if (isLocalhost) {
    const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    return `${protocol}://${host}/api/v1/auth/google/callback`;
  }

  if (env.GOOGLE_CALLBACK_URL && env.GOOGLE_CALLBACK_URL.trim() !== '') {
    return env.GOOGLE_CALLBACK_URL;
  }

  const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  return `${protocol}://${host}/api/v1/auth/google/callback`;
}

function getClientUrl(req: import('express').Request): string {
  const fallbackUrl = (env.CLIENT_URL || 'https://invoisen.vercel.app').replace(/\/$/, '');
  const storedClientUrl = req.cookies?.[GOOGLE_OAUTH_CLIENT_URL_COOKIE] as string | undefined;

  if (storedClientUrl && (storedClientUrl.startsWith('http://') || storedClientUrl.startsWith('https://'))) {
    if (env.NODE_ENV === 'production' && (storedClientUrl.includes('localhost') || storedClientUrl.includes('127.0.0.1'))) {
      return fallbackUrl;
    }
    return storedClientUrl.replace(/\/$/, '');
  }

  const referer = req.headers.referer || req.headers.origin;
  if (referer) {
    try {
      const url = new URL(referer);
      if (env.NODE_ENV === 'production' && (url.host.includes('localhost') || url.host.includes('127.0.0.1'))) {
        return fallbackUrl;
      }
      return `${url.protocol}//${url.host}`;
    } catch {}
  }

  return fallbackUrl;
}

function redirectToGoogleUnavailable(res: import('express').Response, clientUrl: string) {
  res.redirect(`${clientUrl}/login?error=google-auth-unavailable`);
}

function redirectToGoogleFailure(res: import('express').Response, clientUrl: string, reason = 'google-auth-failed') {
  res.redirect(`${clientUrl}/login?error=${encodeURIComponent(reason)}`);
}

// 1. Redirects user to Google's consent screen in the SAME window
router.get('/google', (req, res) => {
  if (!isGoogleAuthEnabled) {
    const clientUrl = getClientUrl(req);
    redirectToGoogleUnavailable(res, clientUrl);
    return;
  }

  const state = randomBytes(24).toString('base64url');
  const nonce = randomBytes(24).toString('base64url');
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

  const clientUrl = getClientUrl(req);

  res.cookie(GOOGLE_OAUTH_STATE_COOKIE, state, getGoogleCookieOptions());
  res.cookie(GOOGLE_OAUTH_NONCE_COOKIE, nonce, getGoogleCookieOptions());
  res.cookie(GOOGLE_OAUTH_VERIFIER_COOKIE, codeVerifier, getGoogleCookieOptions());
  res.cookie(GOOGLE_OAUTH_CLIENT_URL_COOKIE, clientUrl, getGoogleCookieOptions());

  const callbackUrl = getCallbackUrl(req);

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
  const clientUrl = getClientUrl(req);
  try {
    if (!isGoogleAuthEnabled) {
      redirectToGoogleUnavailable(res, clientUrl);
      return;
    }

    const returnedState = typeof req.query.state === 'string' ? req.query.state : undefined;
    const storedState = req.cookies?.[GOOGLE_OAUTH_STATE_COOKIE] as string | undefined;
    const storedNonce = req.cookies?.[GOOGLE_OAUTH_NONCE_COOKIE] as string | undefined;
    const storedVerifier = req.cookies?.[GOOGLE_OAUTH_VERIFIER_COOKIE] as string | undefined;
    clearGoogleCookies(res);

    if (storedState && returnedState !== storedState) {
      console.error('[Google OAuth] Mismatched state token.');
      redirectToGoogleFailure(res, clientUrl, 'google-auth-invalid-state');
      return;
    }

    if (typeof req.query.error === 'string') {
      console.error('[Google OAuth] Error returned from Google:', req.query.error);
      redirectToGoogleFailure(res, clientUrl, req.query.error);
      return;
    }

    const code = typeof req.query.code === 'string' ? req.query.code : undefined;
    if (!code) {
      redirectToGoogleFailure(res, clientUrl, 'google-auth-missing-code');
      return;
    }

    const callbackUrl = getCallbackUrl(req);

    const tokenParams = new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    });

    if (!env.GOOGLE_CLIENT_SECRET) {
      redirectToGoogleFailure(res, clientUrl, 'google-client-secret-missing-in-backend-env');
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
      console.error('[Google OAuth] Token exchange failed:', tokenPayload || tokenResponse.statusText);
      redirectToGoogleFailure(res, clientUrl, tokenPayload?.error ?? 'google-token-exchange-failed');
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
    const redirectUrl = `${clientUrl}/auth/callback?accessToken=${accessToken}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('[Google OAuth] Callback handler exception:', err);
    if (!res.headersSent) {
      redirectToGoogleFailure(res, clientUrl);
      return;
    }
    next(err);
  }
});

export const googleAuthRoutes = router;
