import { ConfigDTO } from "../../dto/ConfigDTO";
import { toConfigDTO } from "../../mappers/toConfigDTO";
import { GetConfigUseCase } from "../../ports/in/GetConfigUseCase";
import { ConfigRepository } from "../../ports/out/ConfigRepository";

export class GetConfig implements GetConfigUseCase {
  constructor(private readonly configRepository: ConfigRepository) {}

  async execute(): Promise<ConfigDTO | null> {
    const config = await this.configRepository.find();
    return config ? toConfigDTO(config) : null;
  }
}
