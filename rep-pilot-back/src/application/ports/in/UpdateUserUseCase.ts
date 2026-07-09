import { UpdateUserDTO, UserDTO } from "../../dto/UserDTO";

export interface UpdateUserUseCase {
  execute(id: string, input: UpdateUserDTO): Promise<UserDTO>;
}
