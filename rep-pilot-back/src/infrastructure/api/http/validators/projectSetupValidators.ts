import { Request, Response, NextFunction } from "express";

export function validateProjectSetup(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: string[] = [];

  if (!req.body?.specs || typeof req.body.specs !== "string") {
    errors.push("specs is required and must be a non-empty string");
  } else if (req.body.specs.trim().length === 0) {
    errors.push("specs must not be empty");
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}
