import { apiFetch } from "../apiClient";

export interface ScannedItem {
  name: string;
  path: string;
  description: string;
  gitUrl: string;
}

export interface RepositoryScanRequest {
  url: string;
}

export interface RepositoryScanResponse {
  agents: ScannedItem[];
  skills: ScannedItem[];
  instructions: ScannedItem[];
}

export function scanRepository(
  payload: RepositoryScanRequest,
): Promise<RepositoryScanResponse> {
  return apiFetch<RepositoryScanResponse>("/api/repository/scan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
