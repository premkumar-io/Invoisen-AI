export interface IWhatsAppProvider {
  readonly name: string;
  sendWhatsAppOtp(to: string, otp: string): Promise<boolean>;
}
