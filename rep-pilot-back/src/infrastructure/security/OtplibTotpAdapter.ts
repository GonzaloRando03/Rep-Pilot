import { generateSecret, verify, generateURI } from "otplib";
import { TotpPort } from "../../application/ports/out/TotpPort";

export class OtplibTotpAdapter implements TotpPort {
  generateSecret(): string {
    return generateSecret();
  }

  generateQrUri(secret: string, username: string, appName: string): string {
    return generateURI({ issuer: appName, label: username, secret });
  }

  async verify(token: string, secret: string): Promise<boolean> {
    const result = await verify({ secret, token });
    return result.valid;
  }
}
