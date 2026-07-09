import { AppConfig } from "../../../domain/entities/AppConfig";

export interface ConfigRepository {
  save(config: AppConfig): Promise<void>;
  find(): Promise<AppConfig | null>;
}
