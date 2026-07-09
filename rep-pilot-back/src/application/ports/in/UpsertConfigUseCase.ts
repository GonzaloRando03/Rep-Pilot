import { ConfigDTO, UpsertConfigDTO } from "../../dto/ConfigDTO";

export interface UpsertConfigUseCase {
  execute(input: UpsertConfigDTO): Promise<ConfigDTO>;
}
