import { Logger } from "../../application/ports/out/Logger";

export class ConsoleLogger implements Logger {
  info(message: string): void {
    console.log(`[INFO]  ${new Date().toISOString()} ${message}`);
  }

  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    } else if (error !== undefined) {
      console.error(error);
    }
  }
}
