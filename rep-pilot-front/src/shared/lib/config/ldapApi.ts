import { apiFetch } from "../apiClient";

export interface LdapConfig {
  url: string;
  bindDn: string;
}

export function fetchLdapConfig(): Promise<LdapConfig> {
  return apiFetch<LdapConfig>("/api/config/ldap");
}

export function saveLdapConfig(config: LdapConfig): Promise<LdapConfig> {
  return apiFetch<LdapConfig>("/api/config/ldap", {
    method: "PUT",
    body: JSON.stringify(config),
  });
}
