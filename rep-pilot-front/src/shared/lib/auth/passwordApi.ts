import { apiFetch } from "../apiClient";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export function changePassword(payload: ChangePasswordPayload): Promise<void> {
  return apiFetch<void>("/api/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
