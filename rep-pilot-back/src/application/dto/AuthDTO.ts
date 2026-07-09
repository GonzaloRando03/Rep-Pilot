export interface LoginDTO {
  username: string;
  password: string;
  totpCode?: string;
}

export interface AuthTokenDTO {
  token: string;
}
