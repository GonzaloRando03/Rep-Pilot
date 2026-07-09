import { Request, Response, NextFunction } from "express";

export function validateChat(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: string[] = [];

  if (!Array.isArray(req.body?.messages) || req.body.messages.length === 0) {
    errors.push("messages is required and must be a non-empty array");
  } else {
    for (let i = 0; i < req.body.messages.length; i++) {
      const msg = req.body.messages[i];
      if (!msg || typeof msg !== "object") {
        errors.push(`messages[${i}] must be an object`);
        continue;
      }
      if (!["user", "assistant", "system"].includes(msg.role)) {
        errors.push(
          `messages[${i}].role must be one of: user, assistant, system`,
        );
      }
      if (typeof msg.content !== "string" || msg.content.trim().length === 0) {
        errors.push(
          `messages[${i}].content is required and must be a non-empty string`,
        );
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}
