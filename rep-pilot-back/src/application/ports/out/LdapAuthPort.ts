export interface LdapAuthResult {
  success: boolean;
  displayName?: string;
}

export interface LdapAuthPort {
  authenticate(
    url: string,
    bindDnTemplate: string,
    username: string,
    password: string,
  ): Promise<LdapAuthResult>;
}
