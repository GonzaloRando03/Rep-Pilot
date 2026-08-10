export interface TokenPayload {
  sub: string;
  username: string;
  isAdmin: boolean;
  scope?: string;
}

export interface TokenService {
  sign(payload: TokenPayload, expiresIn?: string): string;
}
