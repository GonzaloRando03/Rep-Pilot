import { UserDTO } from "../../dto/UserDTO";

export interface UpdateMyLanguageUseCase {
  execute(userId: string, language: string): Promise<UserDTO>;
}
