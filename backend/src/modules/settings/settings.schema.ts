import { z } from 'zod';

const currencyEnum = z.string();

export const businessProfileSchema = z.object({
  name: z.any().optional(),
  logoUrl: z.any().optional(),
  address: z.any().optional(),
  email: z.any().optional(),
  phone: z.any().optional(),
  gstNumber: z.any().optional(),
}).passthrough();

export const updateSettingsSchema = z.object({
  theme: z.any().optional(),
  defaultCurrency: z.any().optional(),
  invoicePrefix: z.any().optional(),
  invoiceNumberFormat: z.any().optional(),
  invoiceNextNumber: z.any().optional(),
  apiKey: z.any().optional(),
  webhookUrl: z.any().optional(),
  businessProfile: businessProfileSchema.nullable().optional(),
  bankDetails: z.object({
    bankName: z.any().optional(),
    accountHolder: z.any().optional(),
    accountNumber: z.any().optional(),
    ifscCode: z.any().optional(),
    upiId: z.any().optional(),
    showQrCode: z.any().optional(),
  }).passthrough().nullable().optional(),
  taxSettings: z.object({
    taxName: z.any().optional(),
    defaultTaxRate: z.any().optional(),
    taxInclusive: z.any().optional(),
  }).passthrough().nullable().optional(),
  aiSettings: z.object({
    autoExtract: z.any().optional(),
    invoiceTone: z.any().optional(),
    autoReminders: z.any().optional(),
    autoTaxRules: z.any().optional(),
  }).passthrough().nullable().optional(),
  notifications: z.object({
    emailNotifications: z.any().optional(),
    smsAlerts: z.any().optional(),
    paymentReminders: z.any().optional(),
    weeklyDigest: z.any().optional(),
  }).passthrough().nullable().optional(),
}).passthrough();

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
