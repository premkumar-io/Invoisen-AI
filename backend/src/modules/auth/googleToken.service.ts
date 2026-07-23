import { createPublicKey, createVerify } from 'node:crypto';
import type { webcrypto } from 'node:crypto';

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com']);
const CLOCK_SKEW_SECONDS = 300;

type GoogleJwk = webcrypto.JsonWebKey & {
  kid?: string;
  alg?: string;
  use?: string;
};

type GoogleJwksResponse = {
  keys?: GoogleJwk[];
};

export type VerifiedGoogleIdToken = {
  iss: string;
  aud: string;
  sub: string;
  exp: number;
  iat: number;
  nonce?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

let cachedKeys: GoogleJwk[] | null = null;
let cachedKeysExpiresAt = 0;

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function parseJwtSegment<T>(segment: string): T {
  return JSON.parse(base64UrlDecode(segment)) as T;
}

async function getGoogleSigningKeys() {
  if (cachedKeys && cachedKeysExpiresAt > Date.now()) {
    return cachedKeys;
  }

  const response = await fetch(GOOGLE_JWKS_URL);
  if (!response.ok) {
    throw new Error('Unable to fetch Google signing keys.');
  }

  const maxAgeMatch = response.headers.get('cache-control')?.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch?.[1] ? Number(maxAgeMatch[1]) : 3600;
  const payload = (await response.json()) as GoogleJwksResponse;

  cachedKeys = payload.keys ?? [];
  cachedKeysExpiresAt = Date.now() + maxAgeSeconds * 1000;
  return cachedKeys;
}

export async function verifyGoogleIdToken(
  idToken: string | undefined,
  expectedAudience: string,
  expectedNonce?: string,
): Promise<VerifiedGoogleIdToken> {
  if (!idToken) {
    throw new Error('Google ID token is missing.');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = idToken.split('.');
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Google ID token is malformed.');
  }

  const header = parseJwtSegment<{ alg?: string; kid?: string }>(encodedHeader);
  const payload = parseJwtSegment<VerifiedGoogleIdToken>(encodedPayload);

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Google ID token uses an unsupported signature algorithm.');
  }

  const key = (await getGoogleSigningKeys()).find((candidate) => candidate.kid === header.kid);
  if (!key) {
    throw new Error('Google ID token signing key was not found.');
  }

  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const publicKey = createPublicKey({ key, format: 'jwk' });
  const isValidSignature = verifier.verify(publicKey, Buffer.from(encodedSignature, 'base64url'));
  if (!isValidSignature) {
    throw new Error('Google ID token signature is invalid.');
  }

  const now = Math.floor(Date.now() / 1000);
  if (!GOOGLE_ISSUERS.has(payload.iss)) {
    throw new Error('Google ID token issuer is invalid.');
  }
  if (payload.aud !== expectedAudience) {
    throw new Error('Google ID token audience is invalid.');
  }
  if (!payload.sub) {
    throw new Error('Google ID token subject is missing.');
  }
  if (payload.exp + CLOCK_SKEW_SECONDS < now) {
    throw new Error('Google ID token has expired.');
  }
  if (payload.iat - CLOCK_SKEW_SECONDS > now) {
    throw new Error('Google ID token was issued in the future.');
  }
  if (expectedNonce && payload.nonce !== expectedNonce) {
    throw new Error('Google ID token nonce is invalid.');
  }
  if (!payload.email || payload.email_verified !== true) {
    throw new Error('Google account email is not verified.');
  }

  return payload;
}
