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

  if (expectedNonce && payload.nonce !== expectedNonce) {
    throw new Error('Google ID token nonce is invalid.');
  }

  if (!payload.email || payload.email_verified !== true) {
    throw new Error('Google account email is not verified.');
  }

  return {
    iss: payload.iss,
    aud: payload.aud,
    sub: payload.sub,
    exp: payload.exp,
    iat: payload.iat,
    nonce: payload.nonce,
    email: payload.email,
    email_verified: payload.email_verified,
    name: payload.name,
    picture: payload.picture,
  };
}
