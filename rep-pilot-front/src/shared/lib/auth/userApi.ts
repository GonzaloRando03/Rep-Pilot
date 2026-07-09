import { apiFetch } from "../apiClient";
import type { User } from "./userStorage";
import type { Language } from "../language/Language";

export async function fetchCurrentUser(): Promise<User> {
  return apiFetch<User>("/api/users/me");
}

export async function updateUserLanguage(language: Language): Promise<void> {
  await apiFetch<void>("/api/users/me/language", {
    method: "PATCH",
    body: JSON.stringify({ language }),
  });
}
