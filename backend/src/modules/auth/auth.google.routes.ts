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
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

  if (isLocal) {
    const localUrl = `http://${host}/api/v1/auth/google/callback`;
    console.log('[Google OAuth] Using local redirect_uri:', localUrl);
    return localUrl;
  }

  let urlStr = '';
  if (env.GOOGLE_CALLBACK_URL && env.GOOGLE_CALLBACK_URL.trim() !== '') {
    const configured = env.GOOGLE_CALLBACK_URL.trim().replace(/\/$/, '');
    if (!configured.includes('localhost') && !configured.includes('127.0.0.1')) {
      urlStr = configured;
    }
  }

  if (!urlStr) {
    urlStr = `https://${host}/api/v1/auth/google/callback`;
  }

  if (urlStr.startsWith('http://')) {
    urlStr = urlStr.replace('http://', 'https://');
  }

  console.log('[Google OAuth] Using production redirect_uri:', urlStr);
  return urlStr;
}

function getClientUrl(req: import('express').Request): string {
  const host = req.get('host') || '';
  const isBackendLocal = host.includes('localhost') || host.includes('127.0.0.1');

  // 1. Check query parameter redirect_to (e.g. /api/v1/auth/google?redirect_to=https://invoisen.vercel.app)
  const queryRedirect = typeof req.query.redirect_to === 'string' ? req.query.redirect_to.trim() : undefined;
  if (queryRedirect && (queryRedirect.startsWith('http://') || queryRedirect.startsWith('https://'))) {
    const clean = queryRedirect.replace(/\/$/, '');
    if (isBackendLocal || (!clean.includes('localhost') && !clean.includes('127.0.0.1'))) {
      return clean;
    }
  }

  // 2. Check cookie if stored previously
  const storedClientUrl = req.cookies?.[GOOGLE_OAUTH_CLIENT_URL_COOKIE] as string | undefined;
  if (storedClientUrl && (storedClientUrl.startsWith('http://') || storedClientUrl.startsWith('https://'))) {
    const clean = storedClientUrl.replace(/\/$/, '');
    if (isBackendLocal || (!clean.includes('localhost') && !clean.includes('127.0.0.1'))) {
      return clean;
    }
  }

  // 3. Check Referer or Origin header
  const referer = req.headers.referer || req.headers.origin;
  if (referer) {
    try {
      const url = new URL(referer);
      const clean = `${url.protocol}//${url.host}`.replace(/\/$/, '');
      if (isBackendLocal || (!clean.includes('localhost') && !clean.includes('127.0.0.1'))) {
        return clean;
      }
    } catch {}
  }

  // 4. Check env.CLIENT_URL if non-localhost in production
  if (env.CLIENT_URL && env.CLIENT_URL.trim() !== '') {
    const configured = env.CLIENT_URL.trim().replace(/\/$/, '');
    if (isBackendLocal || (!configured.includes('localhost') && !configured.includes('127.0.0.1'))) {
      return configured;
    }
  }

  // 5. Default production frontend fallback
  return 'https://invoisen.vercel.app';
}

function redirectToGoogleUnavailable(res: import('express').Response, clientUrl: string) {
  res.redirect(`${clientUrl}/login?error=google-auth-unavailable`);
}

function redirectToGoogleFailure(res: import('express').Response, clientUrl: string, reason = 'google-auth-failed') {
  res.redirect(`${clientUrl}/login?error=${encodeURIComponent(reason)}`);
}

router.get('/google/debug', (req, res) => {
  const callbackUrl = getCallbackUrl(req);
  res.json({
    status: 'ok',
    isGoogleAuthEnabled,
    googleClientId: env.GOOGLE_CLIENT_ID || 'NOT_SET',
    computedRedirectUri: callbackUrl,
    envGoogleCallbackUrl: env.GOOGLE_CALLBACK_URL || 'NOT_SET',
    instruction: 'Copy computedRedirectUri into Google Cloud Console -> Authorized redirect URIs',
  });
});

interface OAuthStatePayload {
  stateToken: string;
  clientUrl: string;
}

function encodeState(payload: OAuthStatePayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeState(rawState?: string): OAuthStatePayload | null {
  if (!rawState) return null;
  try {
    const jsonStr = Buffer.from(rawState, 'base64url').toString('utf8');
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object' && typeof parsed.clientUrl === 'string') {
      return parsed as OAuthStatePayload;
    }
  } catch {
    // fallback
  }
  return null;
}

// 1. Redirects user to Google's consent screen in the SAME window
router.get('/google', (req, res) => {
  const clientUrl = getClientUrl(req);
  if (!isGoogleAuthEnabled) {
    redirectToGoogleUnavailable(res, clientUrl);
    return;
  }

  const stateToken = randomBytes(24).toString('base64url');
  const statePayload: OAuthStatePayload = {
    stateToken,
    clientUrl,
  };
  const encodedState = encodeState(statePayload);

  res.cookie(GOOGLE_OAUTH_STATE_COOKIE, stateToken, getGoogleCookieOptions());
  res.cookie(GOOGLE_OAUTH_CLIENT_URL_COOKIE, clientUrl, getGoogleCookieOptions());

  const callbackUrl = getCallbackUrl(req);

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', encodedState);
  authUrl.searchParams.set('prompt', 'select_account');

  res.redirect(authUrl.toString());
});

// 2. Google redirects back to this endpoint after user authenticates in the SAME window
router.get('/google/callback', async (req, res, next) => {
  const rawState = typeof req.query.state === 'string' ? req.query.state : undefined;
  const decodedStatePayload = decodeState(rawState);

  const clientUrl = decodedStatePayload?.clientUrl || (req.cookies?.[GOOGLE_OAUTH_CLIENT_URL_COOKIE] as string | undefined) || getClientUrl(req);
  clearGoogleCookies(res);

  try {
    if (!isGoogleAuthEnabled) {
      redirectToGoogleUnavailable(res, clientUrl);
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
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    });

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

    const googleUser = await verifyGoogleIdToken(tokenPayload.id_token, env.GOOGLE_CLIENT_ID!);
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

    // Redirect to frontend with access token in the SAME window
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

// 3. Optional direct verification endpoint for client-side Google tokens
router.post('/google/verify', async (req, res) => {
  const clientUrl = getClientUrl(req);
  try {
    const { credential, idToken } = req.body || {};
    const tokenToVerify = credential || idToken;

    if (!tokenToVerify) {
      res.status(400).json({ success: false, error: { code: 'MISSING_TOKEN', message: 'Google ID token is required' } });
      return;
    }

    const googleUser = await verifyGoogleIdToken(tokenToVerify, env.GOOGLE_CLIENT_ID!);
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

    res.json({
      success: true,
      data: {
        accessToken,
        user,
      },
    });
  } catch (err) {
    console.error('[Google OAuth] Verify endpoint error:', err);
    res.status(401).json({
      success: false,
      error: {
        code: 'GOOGLE_VERIFY_FAILED',
        message: err instanceof Error ? err.message : 'Google authentication verification failed',
      },
    });
  }
});

export const googleAuthRoutes = router;
