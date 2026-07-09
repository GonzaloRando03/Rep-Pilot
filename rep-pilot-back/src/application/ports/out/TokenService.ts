export interface TokenPayload {
  sub: string;
  username: string;
  isAdmin: boolean;
}

export interface TokenService {
  sign(payload: TokenPayload): string;
}
