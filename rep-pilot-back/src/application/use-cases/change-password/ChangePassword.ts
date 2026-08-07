import { InvalidCredentialsError } from "../../../domain/errors/InvalidCredentialsError";
import { ChangePasswordDTO, UserDTO } from "../../dto/UserDTO";
import { toUserDTO } from "../../mappers/toUserDTO";
import { ChangePasswordUseCase } from "../../ports/in/ChangePasswordUseCase";
import { PasswordHasher } from "../../ports/out/PasswordHasher";
import { UserRepository } from "../../ports/out/UserRepository";

export class ChangePassword implements ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(userId: string, input: ChangePasswordDTO): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const valid = await this.passwordHasher.compare(
      input.currentPassword,
      user.password,
    );
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    const hashed = await this.passwordHasher.hash(input.newPassword);
    const updated = user.withPassword(hashed);
    await this.userRepository.save(updated);

    return toUserDTO(updated);
  }
}
