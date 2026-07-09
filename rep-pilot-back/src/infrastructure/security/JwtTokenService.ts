import jwt from "jsonwebtoken";
import {
  TokenPayload,
  TokenService,
} from "../../application/ports/out/TokenService";

const TOKEN_EXPIRY = "8h";

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: string) {}

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: TOKEN_EXPIRY });
  }
}
