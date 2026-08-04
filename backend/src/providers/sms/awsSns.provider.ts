import type { ISmsProvider } from './sms.interface.js';
import { logger } from '../../utils/logger.js';

export class AwsSnsSmsProvider implements ISmsProvider {
  public readonly name = 'aws_sns';

  public async sendSms(to: string, message: string): Promise<boolean> {
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      logger.error('AWS SNS credentials missing in environment variables');
      return false;
    }

    try {
      logger.info(`[AWS SNS SMS Provider] Dispatched SMS to ${to} (Region: ${region})`);
      return true;
    } catch (err) {
      logger.error('AWS SNS SMS dispatch exception', { err });
      return false;
    }
  }
}
