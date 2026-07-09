import { UserDTO } from "../../dto/UserDTO";

export interface ListUsersUseCase {
  execute(): Promise<UserDTO[]>;
}
