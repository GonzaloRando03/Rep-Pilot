export interface GitInstanceDTO {
  id: string;
  url: string;
  username: string;
  token: string;
}

export interface OpenAiConfigDTO {
  url: string;
  token: string;
  model: string;
}

export interface LdapConfigDTO {
  url: string;
  bindDn: string;
}

export interface ConfigDTO {
  gitInstances: GitInstanceDTO[];
  openaiConfig: OpenAiConfigDTO;
  ldapConfig: LdapConfigDTO;
  enableTwoFactor: boolean;
}

export interface UpsertConfigDTO {
  gitInstances?: GitInstanceDTO[];
  openaiConfig?: OpenAiConfigDTO;
  ldapConfig?: LdapConfigDTO;
  enableTwoFactor?: boolean;
}
