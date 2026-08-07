import { CreateApiTokenUseCase } from "../../ports/in/CreateApiTokenUseCase";
import { ApiTokenRepository } from "../../ports/out/ApiTokenRepository";
import { CreatedApiTokenDTO } from "../../dto/ApiTokenDTO";
import { ApiToken } from "../../../domain/entities/ApiToken";
import { UserId } from "../../../domain/value-objects/UserId";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { UserRepository } from "../../ports/out/UserRepository";

export class CreateApiToken implements CreateApiTokenUseCase {
  constructor(
    private readonly apiTokenRepository: ApiTokenRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: {
    userId: string;
    name: string;
  }): Promise<CreatedApiTokenDTO> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError(`User with id '${input.userId}' not found`);
    }

    const token = ApiToken.create({
      name: input.name,
      userId: UserId.create(input.userId),
    });

    await this.apiTokenRepository.save(token);

    // El token plano solo está disponible aquí; no se persiste
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const plainToken = token.plainToken!;

    return {
      token: {
        id: token.id,
        name: token.name,
        prefix: token.prefix,
        lastUsedAt: token.lastUsedAt?.toISOString() ?? null,
        createdAt: token.createdAt.toISOString(),
      },
      plainToken,
    };
  }
}
