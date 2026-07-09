export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: unknown): void;
}
