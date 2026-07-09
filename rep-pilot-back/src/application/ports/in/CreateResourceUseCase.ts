import { CreateResourceDTO, ResourceDTO } from "../../dto/ResourceDTO";

export interface CreateResourceUseCase {
  execute(input: CreateResourceDTO): Promise<ResourceDTO>;
}
