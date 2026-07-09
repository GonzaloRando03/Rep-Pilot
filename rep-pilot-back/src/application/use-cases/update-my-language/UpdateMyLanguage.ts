import { Language } from "../../../domain/enums/Language";
import { DomainValidationError } from "../../../domain/errors/DomainValidationError";
import { UserDTO } from "../../dto/UserDTO";
import { toUserDTO } from "../../mappers/toUserDTO";
import { UpdateMyLanguageUseCase } from "../../ports/in/UpdateMyLanguageUseCase";
import { UserRepository } from "../../ports/out/UserRepository";

export class UpdateMyLanguage implements UpdateMyLanguageUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, language: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainValidationError("User not found");
    }

    const normalized = language.toLowerCase();
    if (!Object.values(Language).includes(normalized as Language)) {
      throw new DomainValidationError(
        `Invalid language '${language}'. Allowed values: ${Object.values(Language).join(", ")}`,
      );
    }

    const updated = user.withLanguage(normalized as Language);
    await this.userRepository.save(updated);

    return toUserDTO(updated);
  }
}
