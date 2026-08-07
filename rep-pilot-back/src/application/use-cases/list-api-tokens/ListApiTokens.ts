import { ListApiTokensUseCase } from "../../ports/in/ListApiTokensUseCase";
import { ApiTokenRepository } from "../../ports/out/ApiTokenRepository";
import { ApiTokenDTO } from "../../dto/ApiTokenDTO";

export class ListApiTokens implements ListApiTokensUseCase {
  constructor(private readonly apiTokenRepository: ApiTokenRepository) {}

  async execute(userId: string): Promise<ApiTokenDTO[]> {
    const tokens = await this.apiTokenRepository.findByUserId(userId);
    return tokens.map((t) => ({
      id: t.id,
      name: t.name,
      prefix: t.prefix,
      lastUsedAt: t.lastUsedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
    }));
  }
}
