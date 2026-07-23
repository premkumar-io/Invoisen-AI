import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  type GoogleCallbackParameters,
  type Profile,
  type VerifyCallback,
} from 'passport-google-oauth20';
import { env, isGoogleAuthEnabled } from './env.js';
import { findOrCreateUserFromGoogle, type GoogleProfile } from '../modules/auth/google.service.js';
import { verifyGoogleIdToken } from '../modules/auth/googleToken.service.js';
import { logger } from '../utils/logger.js';

export function configurePassport() {
  if (!isGoogleAuthEnabled) {
    logger.warn('Google OAuth credentials are not configured. Google login will be disabled.');
    return;
  }

  const clientID = env.GOOGLE_CLIENT_ID!;
  const clientSecret = env.GOOGLE_CLIENT_SECRET!;
  const callbackURL = env.GOOGLE_CALLBACK_URL!;

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        params: GoogleCallbackParameters,
        profile: Profile,
        done: VerifyCallback,
      ) => {
        try {
          const verifiedToken = await verifyGoogleIdToken(params.id_token, clientID);
          if (verifiedToken.sub !== profile.id) {
            throw new Error('Google ID token subject does not match profile.');
          }

          const user = await findOrCreateUserFromGoogle(profile as GoogleProfile);
          done(null, user);
        } catch (error) {
          logger.error('Error in Google OAuth strategy', { error });
          done(error as Error, undefined);
        }
      },
    ),
  );
}
