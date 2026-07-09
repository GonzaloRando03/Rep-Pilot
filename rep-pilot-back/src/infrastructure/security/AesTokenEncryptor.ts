import crypto from "crypto";
import { TokenEncryptor } from "../../application/ports/out/TokenEncryptor";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const PREFIX = "aes256gcm:";

export class AesTokenEncryptor implements TokenEncryptor {
  private readonly key: Buffer;

  constructor(encryptionKeyHex: string) {
    if (!encryptionKeyHex || encryptionKeyHex.length !== 64) {
      throw new Error(
        "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)",
      );
    }
    this.key = Buffer.from(encryptionKeyHex, "hex");
  }

  async encrypt(plaintext: string): Promise<string> {
    if (!plaintext) return plaintext;

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
  }

  async decrypt(ciphertext: string): Promise<string> {
    if (!ciphertext) return ciphertext;

    // Legacy plaintext data (no prefix) — return as-is
    if (!ciphertext.startsWith(PREFIX)) {
      return ciphertext;
    }

    const payload = ciphertext.slice(PREFIX.length);
    const parts = payload.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted token format");
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }
}
