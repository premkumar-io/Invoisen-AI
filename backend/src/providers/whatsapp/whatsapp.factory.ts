import type { IWhatsAppProvider } from './whatsapp.interface.js';
import { MetaWhatsAppProvider } from './metaWhatsapp.provider.js';
import { TwilioWhatsAppProvider } from './twilioWhatsapp.provider.js';
import { MockWhatsAppProvider } from './mockWhatsapp.provider.js';
import { logger } from '../../utils/logger.js';

let currentProvider: IWhatsAppProvider | null = null;

export function getWhatsAppProvider(): IWhatsAppProvider {
  if (currentProvider) {
    return currentProvider;
  }

  const providerType = (process.env.WHATSAPP_PROVIDER || process.env.SMS_PROVIDER || 'mock').toLowerCase();

  switch (providerType) {
    case 'meta':
    case 'whatsapp_cloud':
      logger.info('Initializing Meta WhatsApp Cloud API Provider');
      currentProvider = new MetaWhatsAppProvider();
      break;

    case 'twilio':
      logger.info('Initializing Twilio WhatsApp Provider');
      currentProvider = new TwilioWhatsAppProvider();
      break;

    case 'mock':
    default:
      logger.info('Initializing Mock WhatsApp Provider (Development Logger)');
      currentProvider = new MockWhatsAppProvider();
      break;
  }

  return currentProvider;
}
