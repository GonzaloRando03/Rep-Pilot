import {
  PaginatedResult,
  ResourceRepository,
  ResourceStats,
} from "../../../application/ports/out/ResourceRepository";
import { ResourceFilterDTO } from "../../../application/dto/PaginatedResourcesDTO";
import { Resource } from "../../../domain/entities/Resource";
import { ResourceType } from "../../../domain/enums/ResourceType";
import { ResourceModel } from "../mongodb/schemas/ResourceSchema";
import {
  toDomainResource,
  toResourceDocument,
} from "../mongodb/mappers/ResourcePersistenceMapper";

export class MongoResourceRepository implements ResourceRepository {
  async save(resource: Resource): Promise<void> {
    await ResourceModel.findByIdAndUpdate(
      resource.id.toString(),
      toResourceDocument(resource),
      { upsert: true, new: true },
    );
  }

  async findAll(): Promise<Resource[]> {
    const docs = await ResourceModel.find();
    return docs.map(toDomainResource);
  }

  async findById(id: string): Promise<Resource | null> {
    const doc = await ResourceModel.findById(id);
    if (!doc) return null;
    return toDomainResource(doc);
  }

  async getStats(): Promise<ResourceStats> {
    const results = await ResourceModel.aggregate<{
      _id: ResourceType;
      count: number;
    }>([{ $group: { _id: "$type", count: { $sum: 1 } } }]);

    const countByType = {} as Record<ResourceType, number>;
    for (const type of Object.values(ResourceType)) {
      countByType[type] = 0;
    }
    for (const { _id, count } of results) {
      countByType[_id] = count;
    }
    const total = Object.values(countByType).reduce((sum, n) => sum + n, 0);
    return { total, countByType };
  }

  async findTopByStars(limit: number): Promise<Resource[]> {
    const docs = await ResourceModel.aggregate([
      { $addFields: { starsCount: { $size: "$stars" } } },
      { $sort: { starsCount: -1 } },
      { $limit: limit },
    ]);
    return docs.map(toDomainResource);
  }

  async findLatest(limit: number): Promise<Resource[]> {
    const docs = await ResourceModel.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    return docs.map(toDomainResource);
  }

  async findByGitUrl(gitUrl: string): Promise<Resource[]> {
    const docs = await ResourceModel.find({ gitUrl });
    return docs.map(toDomainResource);
  }

  async findStarredByUser(userId: string): Promise<Resource[]> {
    const docs = await ResourceModel.find({ "stars.user": userId });
    return docs.map(toDomainResource);
  }

  async findByTags(tagIds: string[]): Promise<Resource[]> {
    if (tagIds.length === 0) return [];

    const docs = await ResourceModel.find({ tags: { $in: tagIds } });
    return docs.map(toDomainResource);
  }

  async findPaginated(
    filter: ResourceFilterDTO,
  ): Promise<PaginatedResult<Resource>> {
    const query: Record<string, unknown> = {};

    if (filter.type) {
      query.type = filter.type;
    }

    if (filter.tags && filter.tags.length > 0) {
      query.tags = { $in: filter.tags };
    }

    if (filter.search) {
      const regex = new RegExp(filter.search, "i");
      query.$or = [{ name: regex }, { description: regex }];
    }

    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [docs, total] = await Promise.all([
      ResourceModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      ResourceModel.countDocuments(query),
    ]);

    return { items: docs.map(toDomainResource), total };
  }

  async deleteById(id: string): Promise<void> {
    await ResourceModel.findByIdAndDelete(id);
  }
}
