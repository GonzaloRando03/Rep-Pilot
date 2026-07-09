import { AppConfig } from "../../../domain/entities/AppConfig";
import { UpsertConfigDTO, ConfigDTO } from "../../dto/ConfigDTO";
import { toConfigDTO } from "../../mappers/toConfigDTO";
import { UpsertConfigUseCase } from "../../ports/in/UpsertConfigUseCase";
import { ConfigRepository } from "../../ports/out/ConfigRepository";

export class UpsertConfig implements UpsertConfigUseCase {
  constructor(private readonly configRepository: ConfigRepository) {}

  async execute(input: UpsertConfigDTO): Promise<ConfigDTO> {
    const existing = await this.configRepository.find();

    const config = existing
      ? existing.update({
          gitInstances: input.gitInstances,
          openaiConfig: input.openaiConfig,
          ldapConfig: input.ldapConfig,
          enableTwoFactor: input.enableTwoFactor,
        })
      : AppConfig.create({
          gitInstances: input.gitInstances,
          openaiConfig: input.openaiConfig,
          ldapConfig: input.ldapConfig,
          enableTwoFactor: input.enableTwoFactor,
        });

    await this.configRepository.save(config);

    return toConfigDTO(config);
  }
}
