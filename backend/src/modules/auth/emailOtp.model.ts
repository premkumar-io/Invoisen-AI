import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmailOtp extends Document {
  userId: Types.ObjectId;
  email: string;
  otp?: string;
  otpHash?: string;
  expiresAt?: Date;
  attempts?: number;
  resendCount?: number;
  createdAt: Date;
}

const emailOtpSchema = new Schema<IEmailOtp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, default: '' },
    otpHash: { type: String, default: '' },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) },
    attempts: { type: Number, default: 0 },
    resendCount: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now, expires: 600 },
  },
  { timestamps: true }
);

export const EmailOtp = mongoose.model<IEmailOtp>('EmailOtp', emailOtpSchema);
