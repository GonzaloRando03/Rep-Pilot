import { CreateUserDTO, UserDTO } from "../../dto/UserDTO";

export interface CreateUserUseCase {
  execute(input: CreateUserDTO): Promise<UserDTO>;
}
