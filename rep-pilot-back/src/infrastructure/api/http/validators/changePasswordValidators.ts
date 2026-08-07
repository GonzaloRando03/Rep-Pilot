import { Request, Response, NextFunction } from "express";

export function validateChangePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: string[] = [];
  const { currentPassword, newPassword } = req.body ?? {};

  if (
    typeof currentPassword !== "string" ||
    currentPassword.trim().length === 0
  ) {
    errors.push("currentPassword must be a non-empty string");
  }

  if (typeof newPassword !== "string" || newPassword.trim().length === 0) {
    errors.push("newPassword must be a non-empty string");
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}
