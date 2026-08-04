import type { IWhatsAppProvider } from './whatsapp.interface.js';
import { logger } from '../../utils/logger.js';

export class MockWhatsAppProvider implements IWhatsAppProvider {
  public readonly name = 'mock';

  public async sendWhatsAppOtp(to: string, otp: string): Promise<boolean> {
    logger.warn(`⚠️ [MOCK WHATSAPP PROVIDER] Real WhatsApp API credentials (WHATSAPP_ACCESS_TOKEN or TWILIO_ACCOUNT_SID) are missing in backend/.env.`);
    logger.info(`📱 [MOCK WHATSAPP DISPATCH] Simulating WhatsApp delivery to ${to}. OTP Code: ${otp}`);
    return true;
  }
}
