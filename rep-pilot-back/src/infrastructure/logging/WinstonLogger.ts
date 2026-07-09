import winston from "winston";
import { Logger } from "../../application/ports/out/Logger";

const winstonLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      const stackStr = stack ? `\n${stack}` : "";
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}${stackStr}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

export class WinstonLogger implements Logger {
  info(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.info(message, meta);
  }

  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      winstonLogger.error(message, { stack: error.stack, cause: error.message });
    } else {
      winstonLogger.error(message, { error });
    }
  }
}
