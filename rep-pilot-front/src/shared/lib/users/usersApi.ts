import { apiFetch } from "../apiClient";
import type { Language } from "../language/Language";

export interface UserDTO {
  id: string;
  username: string;
  name: string;
  email: string;
  isAdmin: boolean;
  language: Language;
}

export interface CreateUserPayload {
  username: string;
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  language?: Language;
}

export interface UpdateUserPayload {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
  language?: Language;
}

export function fetchUsers(): Promise<UserDTO[]> {
  return apiFetch<UserDTO[]>("/api/users");
}

export function createUser(payload: CreateUserPayload): Promise<UserDTO> {
  return apiFetch<UserDTO>("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<UserDTO> {
  return apiFetch<UserDTO>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
