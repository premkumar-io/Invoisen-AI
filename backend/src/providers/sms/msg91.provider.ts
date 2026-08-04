import type { ISmsProvider } from './sms.interface.js';
import { logger } from '../../utils/logger.js';

export class Msg91SmsProvider implements ISmsProvider {
  public readonly name = 'msg91';

  public async sendSms(to: string, message: string): Promise<boolean> {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      logger.error('MSG91 credentials missing in environment variables');
      return false;
    }

    try {
      const cleanPhone = to.replace(/\+/g, '');
      const res = await fetch('https://api.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          authkey: authKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          recipients: [
            {
              mobiles: cleanPhone,
              message,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        logger.error(`MSG91 SMS API failure (${res.status}): ${errText}`);
        return false;
      }

      logger.info(`MSG91 SMS dispatched successfully to ${to}`);
      return true;
    } catch (err) {
      logger.error('MSG91 SMS dispatch exception', { err });
      return false;
    }
  }
}
