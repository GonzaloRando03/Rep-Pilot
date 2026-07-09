import { ResourceDTO } from "../../dto/ResourceDTO";

export interface GetMyStarredResourcesUseCase {
  execute(userId: string): Promise<ResourceDTO[]>;
}
