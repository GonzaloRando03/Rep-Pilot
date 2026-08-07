import { DomainValidationError } from "../../../domain/errors/DomainValidationError";
import { Language } from "../../../domain/enums/Language";
import { CreateUserDTO, UserDTO } from "../../dto/UserDTO";
import { toUserDTO } from "../../mappers/toUserDTO";
import { CreateUserUseCase } from "../../ports/in/CreateUserUseCase";
import { PasswordHasher } from "../../ports/out/PasswordHasher";
import { UserRepository } from "../../ports/out/UserRepository";
import { User } from "../../../domain/entities/User";

export class CreateUser implements CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly defaultLanguage: Language,
  ) {}

  async execute(input: CreateUserDTO): Promise<UserDTO> {
    const existing = await this.userRepository.findByUsername(input.username);
    if (existing) {
      throw new DomainValidationError(
        `Username '${input.username}' is already taken`,
      );
    }

    const language = this.resolveLanguage(input.language);
    const hashedPassword = await this.passwordHasher.hash(input.password);

    const user = User.create({
      username: input.username,
      name: input.name,
      password: hashedPassword,
      isAdmin: input.isAdmin ?? false,
      language,
      email: input.email,
    });

    await this.userRepository.save(user);

    return toUserDTO(user);
  }

  private resolveLanguage(value?: string): Language {
    if (!value) return this.defaultLanguage;
    const normalized = value.toLowerCase();
    if (Object.values(Language).includes(normalized as Language)) {
      return normalized as Language;
    }
    throw new DomainValidationError(
      `Invalid language '${value}'. Allowed values: ${Object.values(Language).join(", ")}`,
    );
  }
}
