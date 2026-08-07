import {
  CreateResourceFromUploadDTO,
  ResourceDTO,
} from "../../dto/ResourceDTO";

export interface CreateResourceFromUploadUseCase {
  execute(input: CreateResourceFromUploadDTO): Promise<ResourceDTO>;
}
