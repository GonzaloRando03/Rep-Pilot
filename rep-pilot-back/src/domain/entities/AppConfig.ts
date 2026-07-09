import { DomainValidationError } from "../errors/DomainValidationError";

export interface GitInstance {
  id: string;
  url: string;
  username: string;
  token: string;
}

export interface OpenAiConfig {
  url: string;
  token: string;
  model: string;
}

export interface LdapConfig {
  url: string;
  bindDn: string;
}

export class AppConfig {
  private constructor(
    public readonly gitInstances: GitInstance[],
    public readonly openaiConfig: OpenAiConfig,
    public readonly ldapConfig: LdapConfig,
    public readonly enableTwoFactor: boolean,
  ) {}

  static create(params: {
    gitInstances?: GitInstance[];
    openaiConfig?: OpenAiConfig;
    ldapConfig?: LdapConfig;
    enableTwoFactor?: boolean;
  }): AppConfig {
    const gitInstances = params.gitInstances ?? [];

    for (const instance of gitInstances) {
      if (!instance.id?.trim()) {
        throw new DomainValidationError("GitInstance id is required");
      }
      if (!instance.url?.trim()) {
        throw new DomainValidationError("GitInstance url is required");
      }
      if (!instance.username?.trim()) {
        throw new DomainValidationError("GitInstance username is required");
      }
      if (!instance.token?.trim()) {
        throw new DomainValidationError("GitInstance token is required");
      }
    }

    const openaiConfig = params.openaiConfig ?? {
      url: "",
      token: "",
      model: "gpt-4o",
    };

    const ldapConfig = params.ldapConfig ?? {
      url: "",
      bindDn: "",
    };

    const enableTwoFactor = params.enableTwoFactor ?? false;

    return new AppConfig(gitInstances, openaiConfig, ldapConfig, enableTwoFactor);
  }

  update(params: {
    gitInstances?: GitInstance[];
    openaiConfig?: OpenAiConfig;
    ldapConfig?: LdapConfig;
    enableTwoFactor?: boolean;
  }): AppConfig {
    return AppConfig.create({
      gitInstances: params.gitInstances ?? this.gitInstances,
      openaiConfig: params.openaiConfig ?? this.openaiConfig,
      ldapConfig: params.ldapConfig ?? this.ldapConfig,
      enableTwoFactor: params.enableTwoFactor ?? this.enableTwoFactor,
    });
  }
}
