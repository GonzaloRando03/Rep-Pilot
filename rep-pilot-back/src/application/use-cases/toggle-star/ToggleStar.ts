import { ToggleStarUseCase } from "../../ports/in/ToggleStarUseCase";
import { ResourceDTO } from "../../dto/ResourceDTO";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { TagRepository } from "../../ports/out/TagRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { toResourceDTO } from "../../mappers/toResourceDTO";

export class ToggleStar implements ToggleStarUseCase {
  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(resourceId: string, userId: string): Promise<ResourceDTO> {
    const [resource, allTags, allUsers] = await Promise.all([
      this.resourceRepository.findById(resourceId),
      this.tagRepository.findAll(),
      this.userRepository.findAll(),
    ]);

    if (!resource) {
      throw new NotFoundError(`Resource with id '${resourceId}' not found`);
    }

    const updated = resource.hasStarFrom(userId)
      ? resource.removeStar(userId)
      : resource.addStar(userId);

    await this.resourceRepository.save(updated);

    const tagMap = new Map(allTags.map((t) => [t.id.toString(), t.name]));
    const userMap = new Map(
      allUsers.map((u) => [
        u.id.toString(),
        { username: u.username, name: u.name },
      ]),
    );

    return toResourceDTO(updated, tagMap, userMap);
  }
}
