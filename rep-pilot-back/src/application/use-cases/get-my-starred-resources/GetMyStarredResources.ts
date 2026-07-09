import { GetMyStarredResourcesUseCase } from "../../ports/in/GetMyStarredResourcesUseCase";
import { ResourceDTO } from "../../dto/ResourceDTO";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { TagRepository } from "../../ports/out/TagRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { toResourceDTO } from "../../mappers/toResourceDTO";

export class GetMyStarredResources implements GetMyStarredResourcesUseCase {
  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<ResourceDTO[]> {
    const [resources, allTags, allUsers] = await Promise.all([
      this.resourceRepository.findStarredByUser(userId),
      this.tagRepository.findAll(),
      this.userRepository.findAll(),
    ]);

    const tagMap = new Map(allTags.map((t) => [t.id.toString(), t.name]));
    const userMap = new Map(
      allUsers.map((u) => [
        u.id.toString(),
        { username: u.username, name: u.name },
      ]),
    );

    return resources.map((r) => toResourceDTO(r, tagMap, userMap));
  }
}
