import { ResourceType } from "../../domain/enums/ResourceType";
import { ResourceDTO } from "./ResourceDTO";

export interface ResourceFilterDTO {
  type?: ResourceType;
  search?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
}

export interface PaginatedResourcesDTO {
  data: ResourceDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
