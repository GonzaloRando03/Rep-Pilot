import { Request, Response, NextFunction } from "express";

export function validateLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: string[] = [];

  if (
    typeof req.body?.username !== "string" ||
    req.body.username.trim().length === 0
  ) {
    errors.push("username is required and must be a non-empty string");
  }

  if (
    typeof req.body?.password !== "string" ||
    req.body.password.trim().length === 0
  ) {
    errors.push("password is required and must be a non-empty string");
  }

  if (req.body?.totpCode !== undefined && req.body.totpCode !== null) {
    if (
      typeof req.body.totpCode !== "string" ||
      req.body.totpCode.trim().length === 0
    ) {
      errors.push("totpCode must be a non-empty string if provided");
    } else if (!/^\d{6}$/.test(req.body.totpCode.trim())) {
      errors.push("totpCode must be exactly 6 digits");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}
