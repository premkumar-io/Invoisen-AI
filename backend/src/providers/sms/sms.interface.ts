export interface ISmsProvider {
  name: string;
  sendSms(to: string, message: string): Promise<boolean>;
}
