import type { IWhatsAppProvider } from './whatsapp.interface.js';
import { logger } from '../../utils/logger.js';

export class MetaWhatsAppProvider implements IWhatsAppProvider {
  public readonly name = 'meta';

  public async sendWhatsAppOtp(to: string, otp: string): Promise<boolean> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME;

    if (!accessToken || !phoneNumberId) {
      logger.error('Meta WhatsApp Cloud API credentials (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID) missing in environment variables');
      return false;
    }

    // E.164 without leading '+' for Meta API
    const cleanTo = to.replace(/[^\d]/g, '');

    try {
      const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

      let payload: Record<string, any>;

      if (templateName) {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'template',
          template: {
            name: templateName,
            language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en_US' },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: otp }],
              },
            ],
          },
        };
      } else {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'text',
          text: {
            preview_url: false,
            body: `Your Invoisen verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
          },
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        logger.error(`Meta WhatsApp Cloud API error (${res.status}): ${errorText}`);
        return false;
      }

      const data: any = await res.json();
      logger.info(`Meta WhatsApp OTP dispatched successfully to ${to}. Message ID: ${data?.messages?.[0]?.id || 'N/A'}`);
      return true;
    } catch (err) {
      logger.error('Meta WhatsApp OTP dispatch exception', { err });
      return false;
    }
  }
}
