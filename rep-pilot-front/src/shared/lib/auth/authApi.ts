import { apiFetch } from "../apiClient";

export interface LoginCredentials {
  username: string;
  password: string;
  totpCode?: string;
}

export interface LoginResponse {
  token: string;
}

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    },
    true,
  );
}
