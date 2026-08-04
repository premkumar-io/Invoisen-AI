import type { ISmsProvider } from './sms.interface.js';
import { logger } from '../../utils/logger.js';

export class MockSmsProvider implements ISmsProvider {
  public readonly name = 'mock';

  public async sendSms(to: string, message: string): Promise<boolean> {
    logger.info(`[Mock SMS Provider] Sent SMS to ${to}: "${message}"`);
    logger.info('--- Mock SMS Delivered ---');
    logger.info(`Recipient: ${to}`);
    logger.info(`Message: ${message}`);
    return true;
  }
}
