import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBusinessProfile {
  name: string;
  logoUrl: string;
  address: string;
  email: string;
  phone: string;
  gstNumber: string;
}

export interface IBankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  showQrCode: boolean;
}

export interface IAiSettings {
  autoExtract: boolean;
  invoiceTone: string;
  autoReminders: boolean;
  autoTaxRules: boolean;
}

export interface ITaxSettings {
  taxName: string;
  defaultTaxRate: number;
  taxInclusive: boolean;
}

export interface INotificationSettings {
  emailNotifications: boolean;
  smsAlerts: boolean;
  paymentReminders: boolean;
  weeklyDigest: boolean;
}

export interface ISettings extends Document {
  userId: Types.ObjectId;
  theme: string;
  defaultCurrency: string;
  invoicePrefix: string;
  invoiceNumberFormat: string;
  invoiceNextNumber: number;
  apiKey: string;
  webhookUrl: string;
  businessProfile: IBusinessProfile;
  bankDetails: IBankDetails;
  aiSettings: IAiSettings;
  taxSettings: ITaxSettings;
  notifications: INotificationSettings;
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

const bankDetailsSchema = new Schema<IBankDetails>(
  {
    bankName: { type: String, default: 'HDFC Bank' },
    accountHolder: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    upiId: { type: String, default: '' },
    showQrCode: { type: Boolean, default: true },
  },
  { _id: false }
);

const aiSettingsSchema = new Schema<IAiSettings>(
  {
    autoExtract: { type: Boolean, default: true },
    invoiceTone: { type: String, default: 'professional' },
    autoReminders: { type: Boolean, default: true },
    autoTaxRules: { type: Boolean, default: true },
  },
  { _id: false }
);

const taxSettingsSchema = new Schema<ITaxSettings>(
  {
    taxName: { type: String, default: 'GST' },
    defaultTaxRate: { type: Number, default: 18 },
    taxInclusive: { type: Boolean, default: false },
  },
  { _id: false }
);

const notificationSettingsSchema = new Schema<INotificationSettings>(
  {
    emailNotifications: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    paymentReminders: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
  },
  { _id: false }
);

const settingsSchema = new Schema<ISettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    theme: { type: String, default: 'light' },
    defaultCurrency: {
      type: String,
      default: 'USD',
    },
    invoicePrefix: { type: String, default: 'INV', uppercase: true, trim: true },
    invoiceNumberFormat: { type: String, default: '{prefix}-{YYYY}-{NNNN}' },
    invoiceNextNumber: { type: Number, default: 1001 },
    apiKey: { type: String, default: 'sk_live_inv_98421038590123' },
    webhookUrl: { type: String, default: 'https://yourdomain.com/webhooks/invoisen' },
    businessProfile: { type: businessProfileSchema, default: () => ({}) },
    bankDetails: { type: bankDetailsSchema, default: () => ({}) },
    aiSettings: { type: aiSettingsSchema, default: () => ({}) },
    taxSettings: { type: taxSettingsSchema, default: () => ({}) },
    notifications: { type: notificationSettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
