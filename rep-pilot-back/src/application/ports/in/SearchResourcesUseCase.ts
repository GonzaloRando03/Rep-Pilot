import {
  PaginatedResourcesDTO,
  ResourceFilterDTO,
} from "../../dto/PaginatedResourcesDTO";

export interface SearchResourcesUseCase {
  execute(filter: ResourceFilterDTO): Promise<PaginatedResourcesDTO>;
}
