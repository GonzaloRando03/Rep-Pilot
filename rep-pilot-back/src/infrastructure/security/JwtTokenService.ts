import jwt from "jsonwebtoken";
import {
  TokenPayload,
  TokenService,
} from "../../application/ports/out/TokenService";

const TOKEN_EXPIRY = "8h";

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: string) {}

  sign(payload: TokenPayload, expiresIn?: string): string {
    const options: jwt.SignOptions = {};
    if (expiresIn) {
      options.expiresIn = expiresIn as jwt.SignOptions["expiresIn"];
    } else {
      options.expiresIn = TOKEN_EXPIRY as jwt.SignOptions["expiresIn"];
    }
    return jwt.sign(payload, this.secret, options);
  }
}
