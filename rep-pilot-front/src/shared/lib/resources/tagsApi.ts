import { apiFetch } from "../apiClient";

export interface Tag {
  id: string;
  name: string;
}

export interface CreateTagPayload {
  name: string;
}

export function fetchTags(): Promise<Tag[]> {
  return apiFetch<Tag[]>("/api/tags");
}

export function createTag(payload: CreateTagPayload): Promise<Tag> {
  return apiFetch<Tag>("/api/tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
