import { CreatedApiTokenDTO } from "../../dto/ApiTokenDTO";

export interface CreateApiTokenUseCase {
  execute(input: { userId: string; name: string }): Promise<CreatedApiTokenDTO>;
}
