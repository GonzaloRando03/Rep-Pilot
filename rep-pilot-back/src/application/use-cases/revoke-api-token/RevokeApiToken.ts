import { RevokeApiTokenUseCase } from "../../ports/in/RevokeApiTokenUseCase";
import { ApiTokenRepository } from "../../ports/out/ApiTokenRepository";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class RevokeApiToken implements RevokeApiTokenUseCase {
  constructor(private readonly apiTokenRepository: ApiTokenRepository) {}

  async execute(input: { userId: string; tokenId: string }): Promise<void> {
    const token = await this.apiTokenRepository.findById(input.tokenId);
    if (!token) {
      throw new NotFoundError(`ApiToken with id '${input.tokenId}' not found`);
    }

    if (token.userId.toString() !== input.userId) {
      throw new ForbiddenError("You can only revoke your own API tokens");
    }

    await this.apiTokenRepository.deleteById(input.tokenId);
  }
}
