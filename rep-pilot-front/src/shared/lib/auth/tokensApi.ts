import { apiFetch } from "../apiClient";

export interface ApiTokenResponse {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreatedApiTokenResponse {
  token: ApiTokenResponse;
  plainToken: string;
}

export function fetchApiTokens(): Promise<ApiTokenResponse[]> {
  return apiFetch<ApiTokenResponse[]>("/api/users/me/tokens");
}

export function createApiToken(name: string): Promise<CreatedApiTokenResponse> {
  return apiFetch<CreatedApiTokenResponse>("/api/users/me/tokens", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function revokeApiToken(tokenId: string): Promise<void> {
  return apiFetch<void>(`/api/users/me/tokens/${tokenId}`, {
    method: "DELETE",
  });
}
