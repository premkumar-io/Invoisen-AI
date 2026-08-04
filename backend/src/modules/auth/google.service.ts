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

  const picture =
    'picture' in profile
      ? profile.picture
      : ('photos' in profile ? (profile as any).photos?.[0]?.value : undefined);

  const displayName = profile.displayName || ('name' in profile ? (profile as any).name : email.split('@')[0]);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&bold=true`;
  const avatarUrl = picture || defaultAvatar;

  // Find user by Google ID first, then by email as a fallback
  let user = await User.findOne({ 'google.id': profile.id });
  if (!user) {
    user = await User.findOne({ email: email.toLowerCase() });
  }

  if (user) {
    // If user exists, link their Google account if not already linked
    let updated = false;
    if (!user.google?.id) {
      user.google = { id: profile.id };
      updated = true;
    }
    if (!user.avatar || (picture && user.avatar !== picture)) {
      user.avatar = avatarUrl;
      updated = true;
    }
    if (!user.emailVerified) {
      user.emailVerified = true;
      updated = true;
    }
    if (updated) {
      await user.save();
    }
    await getOrCreateSettings(user._id.toString());
    return user;
  }

  // Create a new user if they don't exist
  const newUser = new User({
    email: email.toLowerCase(),
    fullName: displayName,
    avatar: avatarUrl,
    emailVerified: true,
    google: { id: profile.id },
  });

  await newUser.save();
  await getOrCreateSettings(newUser._id.toString());
  return newUser;
}
