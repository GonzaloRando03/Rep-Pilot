import { Request, Response, NextFunction } from "express";

export function validateCreateUser(
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

  if (typeof req.body?.name !== "string" || req.body.name.trim().length === 0) {
    errors.push("name is required and must be a non-empty string");
  }

  if (
    typeof req.body?.password !== "string" ||
    req.body.password.trim().length === 0
  ) {
    errors.push("password is required and must be a non-empty string");
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}
