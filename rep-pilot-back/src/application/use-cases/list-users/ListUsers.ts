import { UserDTO } from "../../dto/UserDTO";
import { toUserDTO } from "../../mappers/toUserDTO";
import { ListUsersUseCase } from "../../ports/in/ListUsersUseCase";
import { UserRepository } from "../../ports/out/UserRepository";

export class ListUsers implements ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map(toUserDTO);
  }
}
