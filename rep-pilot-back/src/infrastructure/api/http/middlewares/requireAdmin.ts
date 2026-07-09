import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/express.d";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = (req as AuthenticatedRequest).user;

  if (!user?.isAdmin) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  next();
}
