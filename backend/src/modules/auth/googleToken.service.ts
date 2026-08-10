import { OAuth2Client } from 'google-auth-library';

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

const client = new OAuth2Client();

export async function verifyGoogleIdToken(
  idToken: string | undefined,
  expectedAudience: string,
  expectedNonce?: string,
): Promise<VerifiedGoogleIdToken> {
  if (!idToken) {
    throw new Error('Google ID token is missing.');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: expectedAudience,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google ID token payload.');
  }

  if (expectedNonce && payload.nonce && payload.nonce !== expectedNonce) {
    console.warn('[Google OAuth] Nonce mismatch warning:', { expectedNonce, tokenNonce: payload.nonce });
  }

  if (!payload.email) {
    throw new Error('Google account email is missing.');
  }

  return {
    iss: payload.iss,
    aud: payload.aud,
    sub: payload.sub,
    exp: payload.exp,
    iat: payload.iat,
    nonce: payload.nonce,
    email: payload.email,
    email_verified: payload.email_verified ?? true,
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture,
  };
}
