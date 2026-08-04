import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPhoneOtp extends Document {
  userId: Types.ObjectId;
  phone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  resendCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const phoneOtpSchema = new Schema<IPhoneOtp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    resendCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Automatic TTL cleanup of expired OTP records
phoneOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PhoneOtp = mongoose.model<IPhoneOtp>('PhoneOtp', phoneOtpSchema);
