import { AppConfig } from "../../domain/entities/AppConfig";
import { ConfigDTO } from "../dto/ConfigDTO";

export function toConfigDTO(config: AppConfig): ConfigDTO {
  return {
    gitInstances: config.gitInstances.map((g) => ({
      id: g.id,
      url: g.url,
      username: g.username,
      token: g.token,
    })),
    openaiConfig: {
      url: config.openaiConfig.url,
      token: config.openaiConfig.token,
      model: config.openaiConfig.model,
    },
    ldapConfig: {
      url: config.ldapConfig.url,
      bindDn: config.ldapConfig.bindDn,
    },
    enableTwoFactor: config.enableTwoFactor,
  };
}
