import { ResourceDTO } from "../../dto/ResourceDTO";

export interface ListResourcesUseCase {
  execute(): Promise<ResourceDTO[]>;
}
