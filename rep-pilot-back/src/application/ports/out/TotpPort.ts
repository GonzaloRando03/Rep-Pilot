export interface TotpPort {
  generateSecret(): string;
  generateQrUri(secret: string, username: string, appName: string): string;
  verify(token: string, secret: string): Promise<boolean>;
}
