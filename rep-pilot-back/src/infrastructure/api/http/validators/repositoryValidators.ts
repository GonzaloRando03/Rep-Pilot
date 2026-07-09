import { Request, Response, NextFunction } from "express";

const URL_PATTERN = /^https?:\/\/.+\/.+\/.+/;

export function validateScanRepository(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const url = req.body?.url;

  if (typeof url !== "string" || url.trim().length === 0) {
    res.status(400).json({
      message: "Invalid payload",
      details: ["url is required and must be a non-empty string"],
    });
    return;
  }

  if (!URL_PATTERN.test(url.trim())) {
    res.status(400).json({
      message: "Invalid payload",
      details: [
        "url must be a valid repository URL (e.g. https://github.com/owner/repo or https://gitlab.com/owner/repo)",
      ],
    });
    return;
  }

  next();
}
