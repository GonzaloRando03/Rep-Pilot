import { ResourceDetailDTO } from "../../dto/ResourceDetailDTO";

export interface GetResourceByIdUseCase {
  execute(id: string): Promise<ResourceDetailDTO>;
}
