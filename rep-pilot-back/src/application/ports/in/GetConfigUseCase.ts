import { ConfigDTO } from "../../dto/ConfigDTO";

export interface GetConfigUseCase {
  execute(): Promise<ConfigDTO | null>;
}
