import { UpdateResourceUseCase } from "../../ports/in/UpdateResourceUseCase";
import { UpdateResourceDTO } from "../../dto/UpdateResourceDTO";
import { ResourceDTO } from "../../dto/ResourceDTO";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { TagRepository } from "../../ports/out/TagRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";
import { toResourceDTO } from "../../mappers/toResourceDTO";

export class UpdateResource implements UpdateResourceUseCase {
  constructor(
    private readonly repository: ResourceRepository,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    isAdmin: boolean,
    input: UpdateResourceDTO,
  ): Promise<ResourceDTO> {
    const resource = await this.repository.findById(id);
    if (!resource) {
      throw new NotFoundError(`Resource with id '${id}' not found`);
    }

    const isOwner = resource.createdBy === userId;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError(
        "You are not allowed to update this resource. Only the owner or an admin can update it.",
      );
    }

    const updated = resource.update({
      name: input.name,
      description: input.description,
      tags: input.tags,
    });

    await this.repository.save(updated);

    const [allTags, creator] = await Promise.all([
      this.tagRepository.findAll(),
      this.userRepository.findById(updated.createdBy),
    ]);

    const tagMap = new Map(allTags.map((t) => [t.id.toString(), t.name]));
    const userMap = creator
      ? new Map([
          [
            creator.id.toString(),
            { username: creator.username, name: creator.name },
          ],
        ])
      : new Map<string, { username: string; name: string }>();

    return toResourceDTO(updated, tagMap, userMap);
  }
}
