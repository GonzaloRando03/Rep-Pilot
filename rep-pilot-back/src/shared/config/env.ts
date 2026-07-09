export function getPort(): number {
  return Number(process.env.PORT) || 3001;
}

export function getMongoUri(): string {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI environment variable is required");
  }
  return uri;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export function getCorsOrigin(): string {
  return process.env.CORS_ORIGIN ?? "*";
}

export function getDefaultLanguage(): string {
  return process.env.DEFAULT_LANGUAGE ?? "en";
}

export function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }
  return key;
}
