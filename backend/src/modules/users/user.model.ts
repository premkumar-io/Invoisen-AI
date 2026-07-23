import mongoose, { Schema, Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
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
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: '', select: false },
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
  email: string;
  role: UserRole;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
};

export function toSafeUser(user: IUser): SafeUser {
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    plan: user.plan,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
