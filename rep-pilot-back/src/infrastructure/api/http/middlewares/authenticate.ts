import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../shared/config/env";
import { AuthenticatedUser } from "../types/express.d";
import { ApiTokenRepository } from "../../../../application/ports/out/ApiTokenRepository";
import { UserRepository } from "../../../../application/ports/out/UserRepository";
import { createHash } from "crypto";

let _apiTokenRepo: ApiTokenRepository | null = null;
let _userRepo: UserRepository | null = null;

/**
 * Inyecta los repositorios necesarios para validar API tokens.
 * Debe llamarse una vez durante el bootstrap.
 */
export function setAuthRepositories(
  apiTokenRepo: ApiTokenRepository,
  userRepo: UserRepository,
): void {
  _apiTokenRepo = apiTokenRepo;
  _userRepo = userRepo;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authorization token required" });
    return;
  }

  const token = authHeader.slice(7);

  // Intentar primero como JWT (sesión web)
  try {
    const payload = jwt.verify(token, getJwtSecret()) as Omit<
      AuthenticatedUser,
      "authMethod"
    >;
    req.user = { ...payload, authMethod: "jwt" };
    next();
    return;
  } catch {
    // No es un JWT válido, intentar como API token
  }

  // Intentar como API token
  if (_apiTokenRepo && _userRepo) {
    authenticateApiToken(req, res, next, token).catch(() => {
      res.status(401).json({ message: "Invalid or expired token" });
    });
  } else {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function authenticateApiToken(
  req: Request,
  res: Response,
  next: NextFunction,
  rawToken: string,
): Promise<void> {
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const apiToken = await _apiTokenRepo!.findByTokenHash(tokenHash);
  if (!apiToken) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  // Actualizar lastUsedAt
  const updated = apiToken.markUsed();
  await _apiTokenRepo!.save(updated);

  // Obtener datos del usuario
  const user = await _userRepo!.findById(apiToken.userId.toString());
  if (!user) {
    res.status(401).json({ message: "User not found" });
    return;
  }

  req.user = {
    sub: user.id.toString(),
    username: user.username,
    isAdmin: user.isAdmin,
    authMethod: "api-token",
  };
  next();
}
