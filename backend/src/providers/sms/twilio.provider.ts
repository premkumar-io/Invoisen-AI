import type { ISmsProvider } from './sms.interface.js';
import { logger } from '../../utils/logger.js';

export class TwilioSmsProvider implements ISmsProvider {
  public readonly name = 'twilio';

  public async sendSms(to: string, message: string): Promise<boolean> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      logger.error('Twilio credentials missing in environment variables');
      return false;
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const body = new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: message,
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        logger.error(`Twilio SMS API failure (${res.status}): ${errorText}`);
        return false;
      }

      logger.info(`Twilio SMS dispatched successfully to ${to}`);
      return true;
    } catch (err) {
      logger.error('Twilio SMS dispatch exception', { err });
      return false;
    }
  }
}
