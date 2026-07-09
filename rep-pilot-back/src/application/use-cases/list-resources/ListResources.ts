import { ListResourcesUseCase } from "../../ports/in/ListResourcesUseCase";
import { ResourceDTO } from "../../dto/ResourceDTO";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { TagRepository } from "../../ports/out/TagRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { toResourceDTO } from "../../mappers/toResourceDTO";

export class ListResources implements ListResourcesUseCase {
  constructor(
    private readonly repository: ResourceRepository,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<ResourceDTO[]> {
    const [resources, allTags, allUsers] = await Promise.all([
      this.repository.findAll(),
      this.tagRepository.findAll(),
      this.userRepository.findAll(),
    ]);
    const tagMap = new Map(allTags.map((t) => [t.id.toString(), t.name]));
    const userMap = new Map(
      allUsers.map((u) => [u.id.toString(), { username: u.username, name: u.name }]),
    );
    return resources.map((r) => toResourceDTO(r, tagMap, userMap));
  }
}
