import { Resource } from "../../../domain/entities/Resource";
import { ResourceType } from "../../../domain/enums/ResourceType";
import { ResourceFilterDTO } from "../../dto/PaginatedResourcesDTO";

export interface ResourceStats {
  total: number;
  countByType: Record<ResourceType, number>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface ResourceRepository {
  save(resource: Resource): Promise<void>;
  findAll(): Promise<Resource[]>;
  findById(id: string): Promise<Resource | null>;
  getStats(): Promise<ResourceStats>;
  findTopByStars(limit: number): Promise<Resource[]>;
  findLatest(limit: number): Promise<Resource[]>;
  findPaginated(filter: ResourceFilterDTO): Promise<PaginatedResult<Resource>>;
  findByGitUrl(gitUrl: string): Promise<Resource[]>;
  findStarredByUser(userId: string): Promise<Resource[]>;
  findByTags(tagIds: string[]): Promise<Resource[]>;
  deleteById(id: string): Promise<void>;
}
