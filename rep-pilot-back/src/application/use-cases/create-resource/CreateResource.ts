import { CreateResourceUseCase } from "../../ports/in/CreateResourceUseCase";
import { CreateResourceDTO, ResourceDTO } from "../../dto/ResourceDTO";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { TagRepository } from "../../ports/out/TagRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { Resource } from "../../../domain/entities/Resource";
import { toResourceDTO } from "../../mappers/toResourceDTO";

export class CreateResource implements CreateResourceUseCase {
  constructor(
    private readonly repository: ResourceRepository,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateResourceDTO): Promise<ResourceDTO> {
    const resource = Resource.create({
      name: input.name,
      type: input.type,
      description: input.description,
      gitUrl: input.gitUrl,
      path: input.path,
      tags: input.tags,
      createdBy: input.createdBy,
    });
    const [, allTags, creator] = await Promise.all([
      this.repository.save(resource),
      this.tagRepository.findAll(),
      this.userRepository.findById(input.createdBy),
    ]);
    const tagMap = new Map(allTags.map((t) => [t.id.toString(), t.name]));
    const userMap = creator
      ? new Map([[creator.id.toString(), { username: creator.username, name: creator.name }]])
      : new Map<string, { username: string; name: string }>();
    return toResourceDTO(resource, tagMap, userMap);
  }
}
