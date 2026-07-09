import { apiFetch } from "../apiClient";

export interface SetupTwoFactorResponse {
  qrUri: string;
}

export function setup2FA(): Promise<SetupTwoFactorResponse> {
  return apiFetch<SetupTwoFactorResponse>(
    "/api/me/2fa/setup",
    { method: "POST" },
    true,
  );
}

export function confirm2FA(totpCode: string): Promise<void> {
  return apiFetch<void>(
    "/api/me/2fa/confirm",
    { method: "POST", body: JSON.stringify({ totpCode }) },
    true,
  );
}

export function disable2FA(totpCode: string): Promise<void> {
  return apiFetch<void>(
    "/api/me/2fa",
    { method: "DELETE", body: JSON.stringify({ totpCode }) },
    true,
  );
}
