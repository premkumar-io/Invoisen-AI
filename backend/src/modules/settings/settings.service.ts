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

  if (input.businessProfile) {
    for (const [key, value] of Object.entries(input.businessProfile)) {
      if (value !== undefined) {
        update[`businessProfile.${key}`] = value;
      }
    }
  }

  const settings = await Settings.findOneAndUpdate({ userId }, { $set: update }, { new: true });
  if (!settings) throw new NotFoundError('Settings not found');
  return settings;
}

export async function getOrCreateSettings(userId: string) {
  let settings = await Settings.findOne({ userId });
  if (!settings) {
    settings = await Settings.create({ userId });
  }
  return settings;
}
