import { ApiTokenDTO } from "../../dto/ApiTokenDTO";

export interface ListApiTokensUseCase {
  execute(userId: string): Promise<ApiTokenDTO[]>;
}
