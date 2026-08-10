import { NextFunction, Request, Response } from "express";
import { ConflictError } from "../../../../domain/errors/ConflictError";
import { DomainValidationError } from "../../../../domain/errors/DomainValidationError";
import { ForbiddenError } from "../../../../domain/errors/ForbiddenError";
import { InvalidCredentialsError } from "../../../../domain/errors/InvalidCredentialsError";
import { InvalidTwoFactorCodeError } from "../../../../domain/errors/InvalidTwoFactorCodeError";
import { LlmProviderError } from "../../../../domain/errors/LlmProviderError";
import { NotFoundError } from "../../../../domain/errors/NotFoundError";
import { TwoFactorRequiredError } from "../../../../domain/errors/TwoFactorRequiredError";
import { TwoFactorSetupRequiredError } from "../../../../domain/errors/TwoFactorSetupRequiredError";
import { Logger } from "../../../../application/ports/out/Logger";

export function buildErrorHandler(logger: Logger) {
  return function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    if (err instanceof ConflictError) {
      logger.error(`[HTTP] 409 ${err.message}`, err);
      res.status(409).json({ message: err.message });
      return;
    }

    if (err instanceof DomainValidationError) {
      logger.error(`[HTTP] 400 ${err.message}`, err);
      res.status(400).json({ message: err.message });
      return;
    }

    if (err instanceof ForbiddenError) {
      logger.error(`[HTTP] 403 ${err.message}`, err);
      res.status(403).json({ message: err.message });
      return;
    }

    if (err instanceof TwoFactorRequiredError) {
      res.status(401).json({ message: err.message, requiresTwoFactor: true });
      return;
    }

    if (err instanceof TwoFactorSetupRequiredError) {
      res.status(401).json({ requiresTwoFactorSetup: true, token: err.token });
      return;
    }

    if (err instanceof InvalidTwoFactorCodeError) {
      logger.error(`[HTTP] 401 ${err.message}`, err);
      res.status(401).json({ message: err.message });
      return;
    }

    if (err instanceof InvalidCredentialsError) {
      logger.error(`[HTTP] 401 ${err.message}`, err);
      res.status(401).json({ message: err.message });
      return;
    }

    if (err instanceof LlmProviderError) {
      logger.error(`[HTTP] 502 ${err.message}`, err);
      res.status(502).json({ message: err.message });
      return;
    }

    if (err instanceof NotFoundError) {
      logger.error(`[HTTP] 404 ${err.message}`, err);
      res.status(404).json({ message: err.message });
      return;
    }

    logger.error("[HTTP] 500 Internal server error", err);
    res.status(500).json({ message: "Internal server error" });
  };
}
