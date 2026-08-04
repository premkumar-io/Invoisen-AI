import mongoose, { Schema, Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface IUser extends Document {
  fullName: string;
  displayName?: string;
  username?: string;
  email: string;
  emailVerified: boolean;
  password?: string;
  avatar?: string | null;
  phone?: string;
  phoneVerified: boolean;
  timeZone?: string;
  language?: string;
  google?: {
    id?: string;
  };
  role: UserRole;
  plan: UserPlan;
  refreshTokenHash: string | null;
  refreshTokenVersion: number;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    displayName: { type: String, default: '', trim: true },
    username: { type: String, default: null, trim: true, lowercase: true, index: { unique: true, sparse: true } },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    password: { type: String, default: '', select: false },
    avatar: { type: String, default: null },
    phone: { type: String, default: null, trim: true },
    phoneVerified: { type: Boolean, default: false },
    timeZone: { type: String, default: 'Asia/Kolkata' },
    language: { type: String, default: 'en' },
    google: {
      id: { type: String, default: null },
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    refreshTokenHash: { type: String, default: null, select: false },
    refreshTokenVersion: { type: Number, default: 0 },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.isLocked = function (this: IUser): boolean {
  return Boolean(this.lockUntil && this.lockUntil > new Date());
};

export const User = mongoose.model<IUser>('User', userSchema);

export type SafeUser = {
  _id: Types.ObjectId;
  fullName: string;
  displayName?: string;
  username?: string | null;
  email: string;
  emailVerified: boolean;
  hasPassword: boolean;
  avatar?: string | null;
  phone?: string;
  phoneVerified: boolean;
  timeZone?: string;
  language?: string;
  role: UserRole;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
};

export function toSafeUser(user: IUser): SafeUser {
  let cleanAvatar = user.avatar ?? null;
  if (cleanAvatar && (cleanAvatar.startsWith('data:') || cleanAvatar.length > 120)) {
    const cleanName = (user.fullName || 'User').replace(/[^a-zA-Z0-9 ]/g, '');
    cleanAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=6366f1&color=fff&size=128`;
  }
  return {
    _id: user._id,
    fullName: user.fullName,
    displayName: user.displayName || (user.fullName ? user.fullName.split(' ')[0] : ''),
    username: user.username || user.displayName || null,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    hasPassword: Boolean(user.password && user.password.trim() !== ''),
    avatar: cleanAvatar,
    phone: user.phone,
    phoneVerified: user.phoneVerified ?? false,
    timeZone: user.timeZone || 'Asia/Kolkata',
    language: user.language || 'en',
    role: user.role,
    plan: user.plan,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
