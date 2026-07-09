import { apiFetch } from "../apiClient";

export interface GitInstance {
  id: string;
  url: string;
  username: string;
  token: string;
}

export interface AppConfig {
  gitInstances: GitInstance[];
  openaiConfig?: {
    url: string;
    token: string;
    model: string;
  };
  enableTwoFactor?: boolean;
}

export function fetchConfig(): Promise<AppConfig> {
  return apiFetch<AppConfig>("/api/config");
}

export function saveConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  return apiFetch<AppConfig>("/api/config", {
    method: "PUT",
    body: JSON.stringify(config),
  });
}
