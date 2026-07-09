import { ResourceDTO } from "../../dto/ResourceDTO";

export interface ToggleStarUseCase {
  execute(resourceId: string, userId: string): Promise<ResourceDTO>;
}
