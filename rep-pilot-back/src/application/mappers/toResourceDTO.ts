import { ResourceDTO } from "../dto/ResourceDTO";
import { TagDTO } from "../dto/TagDTO";
import { Resource } from "../../domain/entities/Resource";

export function toResourceDTO(
  resource: Resource,
  tagMap: Map<string, string> = new Map(),
  userMap: Map<string, { username: string; name: string }> = new Map(),
): ResourceDTO {
  const creatorInfo = userMap.get(resource.createdBy);
  return {
    id: resource.id.toString(),
    name: resource.name,
    type: resource.type,
    description: resource.description,
    gitUrl: resource.gitUrl,
    path: resource.path,
    stars: resource.stars.map((s) => ({ user: s.user })),
    tags: resource.tags.map(
      (id): TagDTO => ({ id, name: tagMap.get(id) ?? id }),
    ),
    createdAt: resource.createdAt.toISOString(),
    createdBy: {
      id: resource.createdBy,
      username: creatorInfo?.username ?? resource.createdBy,
      name: creatorInfo?.name ?? resource.createdBy,
    },
  };
}
