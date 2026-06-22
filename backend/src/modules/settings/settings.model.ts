import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBusinessProfile {
  name: string;
  logoUrl: string;
  address: string;
  email: string;
  phone: string;
  gstNumber: string;
}

export interface ISettings extends Document {
  userId: Types.ObjectId;
  theme: string;
  defaultCurrency: string;
  invoicePrefix: string;
  businessProfile: IBusinessProfile;
  createdAt: Date;
  updatedAt: Date;
}

const businessProfileSchema = new Schema<IBusinessProfile>(
  {
    name: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    address: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
  },
  { _id: false }
);

const settingsSchema = new Schema<ISettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    theme: { type: String, default: 'light' },
    defaultCurrency: {
      type: String,
      enum: ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD'],
      default: 'USD',
    },
    invoicePrefix: { type: String, default: 'INV', uppercase: true, trim: true },
    businessProfile: { type: businessProfileSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
