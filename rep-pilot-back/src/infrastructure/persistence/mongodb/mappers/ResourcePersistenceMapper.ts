import { Resource } from "../../../../domain/entities/Resource";
import { ResourceId } from "../../../../domain/value-objects/ResourceId";
import { Star } from "../../../../domain/value-objects/Star";
import { ResourceDocument } from "../schemas/ResourceSchema";

export function toResourceDocument(
  resource: Resource,
): Record<string, unknown> {
  return {
    _id: resource.id.toString(),
    name: resource.name,
    type: resource.type,
    description: resource.description,
    gitUrl: resource.gitUrl,
    path: resource.path,
    stars: resource.stars.map((s) => ({ user: s.user })),
    tags: [...resource.tags],
    createdAt: resource.createdAt,
    createdBy: resource.createdBy,
  };
}

export function toDomainResource(doc: ResourceDocument): Resource {
  return Resource.create({
    id: ResourceId.create(doc._id),
    name: doc.name,
    type: doc.type,
    description: doc.description,
    gitUrl: doc.gitUrl,
    path: doc.path,
    stars: doc.stars.map((s) => Star.create(s.user)),
    tags: doc.tags,
    createdAt: doc.createdAt,
    createdBy: doc.createdBy,
  });
}
