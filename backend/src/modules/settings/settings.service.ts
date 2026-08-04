import { Settings } from './settings.model.js';
import { NotFoundError } from '../../utils/errors.js';
import type { UpdateSettingsInput } from './settings.schema.js';

export async function getSettings(userId: string) {
  const settings = await Settings.findOne({ userId });
  if (!settings) throw new NotFoundError('Settings not found');
  return settings;
}

export async function updateSettings(userId: string, input: UpdateSettingsInput) {
  const update: Record<string, unknown> = {};

  if (input.theme !== undefined) update.theme = input.theme;
  if (input.defaultCurrency !== undefined) update.defaultCurrency = input.defaultCurrency;
  if (input.invoicePrefix !== undefined) update.invoicePrefix = input.invoicePrefix.toUpperCase();
  if (input.invoiceNumberFormat !== undefined) update.invoiceNumberFormat = input.invoiceNumberFormat;
  if (input.invoiceNextNumber !== undefined) update.invoiceNextNumber = input.invoiceNextNumber;
  if (input.apiKey !== undefined) update.apiKey = input.apiKey;
  if (input.webhookUrl !== undefined) update.webhookUrl = input.webhookUrl;

  if (input.businessProfile) {
    for (const [key, value] of Object.entries(input.businessProfile)) {
      if (value !== undefined) {
        update[`businessProfile.${key}`] = value;
      }
    }
  }

  if (input.bankDetails) {
    for (const [key, value] of Object.entries(input.bankDetails)) {
      if (value !== undefined) {
        update[`bankDetails.${key}`] = value;
      }
    }
  }

  if (input.taxSettings) {
    for (const [key, value] of Object.entries(input.taxSettings)) {
      if (value !== undefined) {
        update[`taxSettings.${key}`] = value;
      }
    }
  }

  if (input.aiSettings) {
    for (const [key, value] of Object.entries(input.aiSettings)) {
      if (value !== undefined) {
        update[`aiSettings.${key}`] = value;
      }
    }
  }

  if (input.notifications) {
    for (const [key, value] of Object.entries(input.notifications)) {
      if (value !== undefined) {
        update[`notifications.${key}`] = value;
      }
    }
  }

  const settings = await Settings.findOneAndUpdate(
    { userId },
    { $set: update },
    { new: true, upsert: true }
  );
  return settings;
}

export async function getOrCreateSettings(userId: string) {
  let settings = await Settings.findOne({ userId });
  if (!settings) {
    settings = await Settings.create({ userId });
  }
  return settings;
}
