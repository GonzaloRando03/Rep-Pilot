import { UpdateResourceDTO } from "../../dto/UpdateResourceDTO";
import { ResourceDTO } from "../../dto/ResourceDTO";

export interface UpdateResourceUseCase {
  execute(
    id: string,
    userId: string,
    isAdmin: boolean,
    input: UpdateResourceDTO,
  ): Promise<ResourceDTO>;
}
