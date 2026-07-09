import { AuthTokenDTO, LoginDTO } from "../../dto/AuthDTO";

export interface LoginUseCase {
  execute(input: LoginDTO): Promise<AuthTokenDTO>;
}
