import type { IWhatsAppProvider } from './whatsapp.interface.js';
import { logger } from '../../utils/logger.js';

export class TwilioWhatsAppProvider implements IWhatsAppProvider {
  public readonly name = 'twilio';

  public async sendWhatsAppOtp(to: string, otp: string): Promise<boolean> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromWhatsAppNumber) {
      logger.error('Twilio WhatsApp credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_NUMBER) missing in environment variables');
      return false;
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = fromWhatsAppNumber.startsWith('whatsapp:') ? fromWhatsAppNumber : `whatsapp:${fromWhatsAppNumber}`;

      const body = new URLSearchParams({
        To: formattedTo,
        From: formattedFrom,
        Body: `Your Invoisen verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
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
        logger.error(`Twilio WhatsApp API failure (${res.status}): ${errorText}`);
        return false;
      }

      logger.info(`Twilio WhatsApp OTP dispatched successfully to ${to}`);
      return true;
    } catch (err) {
      logger.error('Twilio WhatsApp dispatch exception', { err });
      return false;
    }
  }
}
