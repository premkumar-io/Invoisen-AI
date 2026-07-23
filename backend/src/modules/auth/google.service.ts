import { User, type IUser } from '../users/user.model.js';
import { getOrCreateSettings } from '../settings/settings.service.js';

export type GoogleProfile = {
  id: string;
  displayName: string;
  emails?: Array<{ value: string; verified: boolean }>;
  photos?: Array<{ value:string }>;
};

export type GoogleIdentity = {
  id: string;
  email: string;
  displayName: string;
  picture?: string;
};

/**
 * Finds an existing user or creates a new one based on a Google profile.
 * @param profile - The user profile returned from Google.
 * @returns The user document.
 */
export async function findOrCreateUserFromGoogle(profile: GoogleProfile | GoogleIdentity): Promise<IUser> {
  const email =
    'email' in profile ? profile.email : profile.emails?.find((entry) => entry.verified)?.value ?? profile.emails?.[0]?.value;

  if (!email) {
    throw new Error('Google profile is missing an email address.');
  }

  // Find user by Google ID first, then by email as a fallback
  let user = await User.findOne({ 'google.id': profile.id });
  if (!user) {
    user = await User.findOne({ email });
  }

  if (user) {
    // If user exists, link their Google account if not already linked
    if (!user.google?.id) {
      user.google = { id: profile.id };
      await user.save();
    }
    await getOrCreateSettings(user._id.toString());
    return user;
  }

  // Create a new user if they don't exist
  const newUser = new User({
    email: email.toLowerCase(),
    fullName: profile.displayName,
    google: { id: profile.id },
  });

  await newUser.save();
  await getOrCreateSettings(newUser._id.toString());
  return newUser;
}
