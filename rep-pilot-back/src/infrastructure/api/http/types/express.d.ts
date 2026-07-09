import { Request } from "express";

export interface AuthenticatedUser {
  sub: string;
  username: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
