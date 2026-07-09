import { DomainValidationError } from "../../../domain/errors/DomainValidationError";
import { UserDTO } from "../../dto/UserDTO";
import { toUserDTO } from "../../mappers/toUserDTO";
import { GetMeUseCase } from "../../ports/in/GetMeUseCase";
import { UserRepository } from "../../ports/out/UserRepository";

export class GetMe implements GetMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainValidationError("User not found");
    }
    return toUserDTO(user);
  }
}
