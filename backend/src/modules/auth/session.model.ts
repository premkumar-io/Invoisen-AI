import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    device: { type: String, default: 'MacBook (Apple M2 Silicon)' },
    browser: { type: String, default: 'Safari (macOS)' },
    ip: { type: String, default: '127.0.0.1' },
    location: { type: String, default: 'India' },
    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Session = mongoose.model<ISession>('Session', sessionSchema);
