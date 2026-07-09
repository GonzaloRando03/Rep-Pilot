import {
  AppConfig,
  GitInstance,
  OpenAiConfig,
  LdapConfig,
} from "../../../../domain/entities/AppConfig";
import { ConfigDocument } from "../schemas/ConfigSchema";
import { TokenEncryptor } from "../../../../application/ports/out/TokenEncryptor";

export async function toConfigDocument(
  config: AppConfig,
  tokenEncryptor: TokenEncryptor,
): Promise<Record<string, unknown>> {
  return {
    gitInstances: await Promise.all(
      config.gitInstances.map(async (g) => ({
        id: g.id,
        url: g.url,
        username: g.username,
        token: await tokenEncryptor.encrypt(g.token),
      })),
    ),
    openaiConfig: {
      url: config.openaiConfig.url,
      token: await tokenEncryptor.encrypt(config.openaiConfig.token),
      model: config.openaiConfig.model,
    },
    ldapConfig: {
      url: config.ldapConfig.url,
      bindDn: config.ldapConfig.bindDn,
    },
    enableTwoFactor: config.enableTwoFactor,
  };
}

export async function toDomainConfig(
  doc: ConfigDocument,
  tokenEncryptor: TokenEncryptor,
): Promise<AppConfig> {
  return AppConfig.create({
    gitInstances: await Promise.all(
      doc.gitInstances.map<Promise<GitInstance>>(async (g) => ({
        id: g.id,
        url: g.url,
        username: g.username,
        token: await tokenEncryptor.decrypt(g.token),
      })),
    ),
    openaiConfig: {
      url: doc.openaiConfig?.url ?? "",
      token: await tokenEncryptor.decrypt(doc.openaiConfig?.token ?? ""),
      model: doc.openaiConfig?.model ?? "gpt-4o",
    } as OpenAiConfig,
    ldapConfig: {
      url: doc.ldapConfig?.url ?? "",
      bindDn: doc.ldapConfig?.bindDn ?? "",
    } as LdapConfig,
    enableTwoFactor: doc.enableTwoFactor ?? false,
  });
}
