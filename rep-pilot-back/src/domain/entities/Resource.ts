import { ResourceType } from "../enums/ResourceType";
import { DomainValidationError } from "../errors/DomainValidationError";
import { ResourceId } from "../value-objects/ResourceId";
import { Star } from "../value-objects/Star";

export class Resource {
  private constructor(
    public readonly id: ResourceId,
    public readonly name: string,
    public readonly type: ResourceType,
    public readonly description: string,
    public readonly gitUrl: string,
    public readonly path: string,
    public readonly stars: ReadonlyArray<Star>,
    public readonly tags: ReadonlyArray<string>,
    public readonly createdAt: Date,
    public readonly createdBy: string,
    public readonly hasFiles: boolean,
  ) {}

  static create(params: {
    id?: ResourceId;
    name: string;
    type: ResourceType;
    description: string;
    gitUrl?: string;
    path?: string;
    stars?: Star[];
    tags?: string[];
    createdAt?: Date;
    createdBy: string;
    hasFiles?: boolean;
  }): Resource {
    const normalizedName = params.name?.trim();
    if (!normalizedName) {
      throw new DomainValidationError("Resource name is required");
    }

    if (!params.type) {
      throw new DomainValidationError("Resource type is required");
    }

    if (!params.description || params.description.trim().length === 0) {
      throw new DomainValidationError("Resource description is required");
    }

    const hasFiles = params.hasFiles ?? false;

    if (!hasFiles && (!params.gitUrl || params.gitUrl.trim().length === 0)) {
      throw new DomainValidationError(
        "Resource gitUrl is required when hasFiles is false",
      );
    }

    if (!params.createdBy || params.createdBy.trim().length === 0) {
      throw new DomainValidationError("Resource createdBy is required");
    }

    return new Resource(
      params.id ?? ResourceId.create(),
      normalizedName,
      params.type,
      params.description.trim(),
      params.gitUrl?.trim() ?? "",
      params.path?.trim() ?? "",
      params.stars ?? [],
      params.tags ?? [],
      params.createdAt ?? new Date(),
      params.createdBy.trim(),
      hasFiles,
    );
  }

  addStar(userId: string): Resource {
    if (this.hasStarFrom(userId)) {
      throw new DomainValidationError(
        `User ${userId} has already starred this resource`,
      );
    }
    return new Resource(
      this.id,
      this.name,
      this.type,
      this.description,
      this.gitUrl,
      this.path,
      [...this.stars, Star.create(userId)],
      [...this.tags],
      this.createdAt,
      this.createdBy,
      this.hasFiles,
    );
  }

  removeStar(userId: string): Resource {
    if (!this.hasStarFrom(userId)) {
      throw new DomainValidationError(
        `User ${userId} has not starred this resource`,
      );
    }
    return new Resource(
      this.id,
      this.name,
      this.type,
      this.description,
      this.gitUrl,
      this.path,
      this.stars.filter((s) => s.user !== userId),
      [...this.tags],
      this.createdAt,
      this.createdBy,
      this.hasFiles,
    );
  }

  hasStarFrom(userId: string): boolean {
    return this.stars.some((s) => s.user === userId);
  }

  addTag(tagId: string): Resource {
    if (this.tags.includes(tagId)) {
      throw new DomainValidationError(
        `Tag ${tagId} is already assigned to this resource`,
      );
    }
    return new Resource(
      this.id,
      this.name,
      this.type,
      this.description,
      this.gitUrl,
      this.path,
      [...this.stars],
      [...this.tags, tagId],
      this.createdAt,
      this.createdBy,
      this.hasFiles,
    );
  }

  removeTag(tagId: string): Resource {
    if (!this.tags.includes(tagId)) {
      throw new DomainValidationError(
        `Tag ${tagId} is not assigned to this resource`,
      );
    }
    return new Resource(
      this.id,
      this.name,
      this.type,
      this.description,
      this.gitUrl,
      this.path,
      [...this.stars],
      this.tags.filter((t) => t !== tagId),
      this.createdAt,
      this.createdBy,
      this.hasFiles,
    );
  }

  update(params: {
    name?: string;
    description?: string;
    tags?: string[];
  }): Resource {
    const normalizedName =
      params.name !== undefined ? params.name.trim() : this.name;
    if (params.name !== undefined && !normalizedName) {
      throw new DomainValidationError("Resource name is required");
    }

    const normalizedDescription =
      params.description !== undefined
        ? params.description.trim()
        : this.description;
    if (
      params.description !== undefined &&
      normalizedDescription.length === 0
    ) {
      throw new DomainValidationError("Resource description is required");
    }

    return new Resource(
      this.id,
      normalizedName,
      this.type,
      normalizedDescription,
      this.gitUrl,
      this.path,
      [...this.stars],
      params.tags ?? [...this.tags],
      this.createdAt,
      this.createdBy,
      this.hasFiles,
    );
  }

  withCreatedBy(newCreatedBy: string): Resource {
    if (!newCreatedBy || newCreatedBy.trim().length === 0) {
      throw new DomainValidationError("Resource createdBy is required");
    }
    return new Resource(
      this.id,
      this.name,
      this.type,
      this.description,
      this.gitUrl,
      this.path,
      [...this.stars],
      [...this.tags],
      this.createdAt,
      newCreatedBy.trim(),
      this.hasFiles,
    );
  }
}
