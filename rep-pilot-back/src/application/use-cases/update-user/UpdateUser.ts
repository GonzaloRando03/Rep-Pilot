import { DomainValidationError } from "../../../domain/errors/DomainValidationError";
import { Language } from "../../../domain/enums/Language";
import { UpdateUserDTO, UserDTO } from "../../dto/UserDTO";
import { toUserDTO } from "../../mappers/toUserDTO";
import { UpdateUserUseCase } from "../../ports/in/UpdateUserUseCase";
import { PasswordHasher } from "../../ports/out/PasswordHasher";
import { UserRepository } from "../../ports/out/UserRepository";

export class UpdateUser implements UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(id: string, input: UpdateUserDTO): Promise<UserDTO> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new DomainValidationError(`User with id '${id}' not found`);
    }

    if (input.username && input.username !== existing.username) {
      const taken = await this.userRepository.findByUsername(input.username);
      if (taken) {
        throw new DomainValidationError(
          `Username '${input.username}' is already taken`,
        );
      }
    }

    const language = input.language
      ? this.resolveLanguage(input.language)
      : undefined;
    const password = input.password
      ? await this.passwordHasher.hash(input.password)
      : undefined;

    const updated = existing.update({
      name: input.name,
      username: input.username,
      isAdmin: input.isAdmin,
      language,
      password,
    });

    await this.userRepository.save(updated);
    return toUserDTO(updated);
  }

  private resolveLanguage(value: string): Language {
    const normalized = value.toLowerCase();
    if (Object.values(Language).includes(normalized as Language)) {
      return normalized as Language;
    }
    throw new DomainValidationError(
      `Invalid language '${value}'. Allowed values: ${Object.values(Language).join(", ")}`,
    );
  }
}
