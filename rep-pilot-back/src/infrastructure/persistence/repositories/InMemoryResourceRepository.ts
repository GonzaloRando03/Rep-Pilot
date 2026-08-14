import {
  PaginatedResult,
  ResourceRepository,
  ResourceStats,
} from "../../../application/ports/out/ResourceRepository";
import { ResourceFilterDTO } from "../../../application/dto/PaginatedResourcesDTO";
import { Resource } from "../../../domain/entities/Resource";
import { ResourceType } from "../../../domain/enums/ResourceType";

export class InMemoryResourceRepository implements ResourceRepository {
  private readonly data = new Map<string, Resource>();

  async save(resource: Resource): Promise<void> {
    this.data.set(resource.id.toString(), resource);
  }

  async findAll(): Promise<Resource[]> {
    return Array.from(this.data.values());
  }

  async findById(id: string): Promise<Resource | null> {
    return this.data.get(id) ?? null;
  }

  async getStats(): Promise<ResourceStats> {
    const resources = Array.from(this.data.values());
    const countByType = {} as Record<ResourceType, number>;

    for (const type of Object.values(ResourceType)) {
      countByType[type] = resources.filter((r) => r.type === type).length;
    }

    return { total: resources.length, countByType };
  }

  async findTopByStars(limit: number): Promise<Resource[]> {
    const resources = Array.from(this.data.values());
    return resources
      .sort((a, b) => b.stars.length - a.stars.length)
      .slice(0, limit);
  }

  async findLatest(limit: number): Promise<Resource[]> {
    const resources = Array.from(this.data.values());
    return resources
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async findByGitUrl(gitUrl: string): Promise<Resource[]> {
    return Array.from(this.data.values()).filter((r) => r.gitUrl === gitUrl);
  }

  async deleteById(id: string): Promise<void> {
    this.data.delete(id);
  }

  async findStarredByUser(userId: string): Promise<Resource[]> {
    return Array.from(this.data.values()).filter((r) => r.hasStarFrom(userId));
  }

  async findByTags(tagIds: string[]): Promise<Resource[]> {
    if (tagIds.length === 0) return [];

    return Array.from(this.data.values()).filter((r) =>
      r.tags.some((t) => tagIds.includes(t)),
    );
  }

  async findByCreatedBy(userId: string): Promise<Resource[]> {
    return Array.from(this.data.values()).filter((r) => r.createdBy === userId);
  }

  async findPaginated(
    filter: ResourceFilterDTO,
  ): Promise<PaginatedResult<Resource>> {
    let resources = Array.from(this.data.values());

    if (filter.type) {
      resources = resources.filter((r) => r.type === filter.type);
    }

    if (filter.tags && filter.tags.length > 0) {
      resources = resources.filter((r) =>
        filter.tags!.some((tag) => r.tags.includes(tag)),
      );
    }

    if (filter.search) {
      const term = filter.search.toLowerCase();
      resources = resources.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term),
      );
    }

    resources.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;
    const total = resources.length;
    const items = resources.slice((page - 1) * pageSize, page * pageSize);

    return { items, total };
  }
}
