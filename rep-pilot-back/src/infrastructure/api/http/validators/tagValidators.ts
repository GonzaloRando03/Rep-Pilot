import { Request, Response, NextFunction } from "express";

export function validateCreateTag(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const name = req.body?.name;
  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({
      message: "Invalid payload",
      details: ["name is required and must be a non-empty string"],
    });
    return;
  }

  next();
}
