import type { ISmsProvider } from './sms.interface.js';
import { MockSmsProvider } from './mock.provider.js';
import { TwilioSmsProvider } from './twilio.provider.js';
import { Msg91SmsProvider } from './msg91.provider.js';
import { AwsSnsSmsProvider } from './awsSns.provider.js';
import { logger } from '../../utils/logger.js';

let currentProvider: ISmsProvider | null = null;

export function getSmsProvider(): ISmsProvider {
  if (currentProvider) {
    return currentProvider;
  }

  const providerType = (process.env.SMS_PROVIDER || 'mock').toLowerCase();

  switch (providerType) {
    case 'twilio':
      logger.info('Initializing Twilio SMS Provider');
      currentProvider = new TwilioSmsProvider();
      break;
    case 'msg91':
      logger.info('Initializing MSG91 SMS Provider');
      currentProvider = new Msg91SmsProvider();
      break;
    case 'aws_sns':
      logger.info('Initializing AWS SNS SMS Provider');
      currentProvider = new AwsSnsSmsProvider();
      break;
    case 'mock':
    default:
      logger.info('Initializing Mock SMS Provider (Development/Default)');
      currentProvider = new MockSmsProvider();
      break;
  }

  return currentProvider;
}
