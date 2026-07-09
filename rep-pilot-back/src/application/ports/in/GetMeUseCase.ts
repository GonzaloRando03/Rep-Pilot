import { UserDTO } from "../../dto/UserDTO";

export interface GetMeUseCase {
  execute(userId: string): Promise<UserDTO>;
}
