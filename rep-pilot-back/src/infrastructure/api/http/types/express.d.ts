import { Request } from "express";

export type AuthMethod = "jwt" | "api-token";

export interface AuthenticatedUser {
  sub: string;
  username: string;
  isAdmin: boolean;
  authMethod: AuthMethod;
  scope?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
