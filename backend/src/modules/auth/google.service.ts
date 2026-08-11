import { User, type IUser } from '../users/user.model.js';
import { getOrCreateSettings } from '../settings/settings.service.js';

export type GoogleProfile = {
  id: string;
  displayName: string;
  emails?: Array<{ value: string; verified: boolean }>;
  photos?: Array<{ value: string }>;
};

export type GoogleIdentity = {
  id: string;
  email: string;
  displayName: string;
  picture?: string;
};

/**
 * Finds an existing user or creates a new one based on a Google profile.
 * Handles existing email accounts, username generation, and MongoDB duplicate key retries.
 * @param profile - The user profile returned from Google.
 * @returns The user document.
 */
export async function findOrCreateUserFromGoogle(profile: GoogleProfile | GoogleIdentity): Promise<IUser> {
  const rawEmail =
    'email' in profile ? profile.email : profile.emails?.find((entry) => entry.verified)?.value ?? profile.emails?.[0]?.value;

  if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.trim()) {
    throw new Error('Google profile is missing an email address.');
  }

  const normalizedEmail = rawEmail.toLowerCase().trim();
  const rawDisplayName = profile.displayName || ('name' in profile ? (profile as any).name : undefined);
  const displayName = (rawDisplayName && String(rawDisplayName).trim()) || normalizedEmail.split('@')[0] || 'User';

  const googleId = profile.id && typeof profile.id === 'string' && profile.id.trim() !== '' ? profile.id.trim() : null;

  const picture =
    'picture' in profile
      ? profile.picture
      : ('photos' in profile ? (profile as any).photos?.[0]?.value : undefined);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&bold=true`;
  const avatarUrl = picture || defaultAvatar;

  // 1. Search for existing user safely.
  // ONLY search by google.id if googleId is a non-empty string to avoid matching null google.id documents!
  let user: IUser | null = null;
  if (googleId) {
    const userByGoogle = await User.findOne({ 'google.id': googleId });
    if (userByGoogle) {
      user = userByGoogle;
    }
  }

  // Fallback to email lookup if not found by Google ID
  if (!user) {
    user = await User.findOne({ email: normalizedEmail });
  }

  // If existing user is found, update missing Google ID, verified flag, and avatar
  if (user) {
    let updated = false;
    if (googleId && (!user.google || !user.google.id || user.google.id !== googleId)) {
      user.google = { id: googleId };
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
      try {
        await user.save();
      } catch (saveErr) {
        console.warn('[Google Auth] Warning: user save failed during Google login update:', saveErr);
      }
    }
    await getOrCreateSettings(user._id.toString()).catch(() => null);
    return user;
  }

  // 2. Create a brand new user
  const emailPrefix = (normalizedEmail.split('@')[0] || 'user');
  const baseUsername = emailPrefix.replace(/[^a-z0-9_]/gi, '').toLowerCase() || 'user';
  let safeUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const count = await User.countDocuments({ username: safeUsername });
    if (count > 0) {
      safeUsername = `${baseUsername}_${Date.now()}`;
    }
  } catch {
    // ignore lookup error
  }

  const newUser = new User({
    email: normalizedEmail,
    fullName: displayName,
    displayName: displayName.split(' ')[0] || displayName,
    username: safeUsername,
    avatar: avatarUrl,
    emailVerified: true,
    google: googleId ? { id: googleId } : undefined,
  });

  try {
    await newUser.save();
  } catch (createErr: any) {
    console.error('[Google Auth] New user creation failed, trying fallback lookup:', createErr);

    // Check if user was created concurrently in another request
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (googleId && (!existingUser.google || !existingUser.google.id)) {
        existingUser.google = { id: googleId };
        await existingUser.save().catch(() => null);
      }
      await getOrCreateSettings(existingUser._id.toString()).catch(() => null);
      return existingUser;
    }

    // Handle Mongo duplicate key errors (E11000) on username/index constraints by creating fallback username
    if (createErr.code === 11000 || createErr.name === 'MongoServerError') {
      console.warn('[Google Auth] E11000 duplicate key encountered, creating user with timestamped fallback username');
      const fallbackUser = new User({
        email: normalizedEmail,
        fullName: displayName,
        displayName: displayName.split(' ')[0] || displayName,
        username: `${baseUsername}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        avatar: avatarUrl,
        emailVerified: true,
        google: googleId ? { id: googleId } : undefined,
      });
      await fallbackUser.save();
      await getOrCreateSettings(fallbackUser._id.toString()).catch(() => null);
      return fallbackUser;
    }

    throw createErr;
  }

  await getOrCreateSettings(newUser._id.toString()).catch(() => null);
  return newUser;
}
