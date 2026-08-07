import { Request, Response, NextFunction } from "express";
import { Language } from "../../../../domain/enums/Language";

export function validateUpdateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: string[] = [];
  const { name, username, isAdmin, language, password } = req.body ?? {};

  if (
    name !== undefined &&
    (typeof name !== "string" || name.trim().length === 0)
  ) {
    errors.push("name must be a non-empty string");
  }

  if (
    username !== undefined &&
    (typeof username !== "string" || username.trim().length === 0)
  ) {
    errors.push("username must be a non-empty string");
  }

  if (isAdmin !== undefined && typeof isAdmin !== "boolean") {
    errors.push("isAdmin must be a boolean");
  }

  if (language !== undefined) {
    const allowed = Object.values(Language);
    if (
      typeof language !== "string" ||
      !allowed.includes(language.toLowerCase() as Language)
    ) {
      errors.push(`language must be one of: ${allowed.join(", ")}`);
    }
  }

  if (
    password !== undefined &&
    (typeof password !== "string" || password.trim().length === 0)
  ) {
    errors.push("password must be a non-empty string");
  }

  const email = req.body?.email;
  if (
    email !== undefined &&
    (typeof email !== "string" || email.trim().length === 0)
  ) {
    errors.push("email must be a non-empty string if provided");
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}
