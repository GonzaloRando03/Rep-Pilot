import { Request, Response, NextFunction } from "express";

export function validateTotpCode(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { totpCode } = req.body ?? {};

  if (typeof totpCode !== "string" || !/^\d{6}$/.test(totpCode)) {
    res.status(400).json({
      message: "Invalid payload",
      details: ["totpCode is required and must be a 6-digit numeric string"],
    });
    return;
  }

  next();
}
