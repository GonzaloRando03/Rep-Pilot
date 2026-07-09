import { Request, Response, NextFunction } from "express";
import { Language } from "../../../../domain/enums/Language";

export function validateUpdateLanguage(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { language } = req.body;

  if (typeof language !== "string" || language.trim().length === 0) {
    res
      .status(400)
      .json({
        message: "Invalid payload",
        details: ["language is required and must be a non-empty string"],
      });
    return;
  }

  const allowed = Object.values(Language);
  if (!allowed.includes(language.toLowerCase() as Language)) {
    res.status(400).json({
      message: "Invalid payload",
      details: [`language must be one of: ${allowed.join(", ")}`],
    });
    return;
  }

  next();
}
