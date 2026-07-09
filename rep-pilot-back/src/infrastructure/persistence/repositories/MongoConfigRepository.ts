import { AppConfig } from "../../../domain/entities/AppConfig";
import { ConfigRepository } from "../../../application/ports/out/ConfigRepository";
import { TokenEncryptor } from "../../../application/ports/out/TokenEncryptor";
import {
  CONFIG_DOCUMENT_ID,
  ConfigModel,
} from "../mongodb/schemas/ConfigSchema";
import {
  toDomainConfig,
  toConfigDocument,
} from "../mongodb/mappers/ConfigPersistenceMapper";

export class MongoConfigRepository implements ConfigRepository {
  constructor(private readonly tokenEncryptor: TokenEncryptor) {}

  async save(config: AppConfig): Promise<void> {
    await ConfigModel.findByIdAndUpdate(
      CONFIG_DOCUMENT_ID,
      await toConfigDocument(config, this.tokenEncryptor),
      { upsert: true, new: true },
    );
  }

  async find(): Promise<AppConfig | null> {
    const doc = await ConfigModel.findById(CONFIG_DOCUMENT_ID);
    return doc ? toDomainConfig(doc, this.tokenEncryptor) : null;
  }
}
