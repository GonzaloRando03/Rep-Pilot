import { ChangePasswordDTO, UserDTO } from "../../dto/UserDTO";

export interface ChangePasswordUseCase {
  execute(userId: string, input: ChangePasswordDTO): Promise<UserDTO>;
}
