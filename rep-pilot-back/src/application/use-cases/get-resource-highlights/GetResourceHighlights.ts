import { GetResourceHighlightsUseCase } from "../../ports/in/GetResourceHighlightsUseCase";
import { ResourceHighlightsDTO } from "../../dto/ResourceHighlightsDTO";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { TagRepository } from "../../ports/out/TagRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { toResourceDTO } from "../../mappers/toResourceDTO";

const HIGHLIGHTS_LIMIT = 10;

export class GetResourceHighlights implements GetResourceHighlightsUseCase {
  constructor(
    private readonly repository: ResourceRepository,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<ResourceHighlightsDTO> {
    const [bestResources, lastResources, allTags, allUsers] = await Promise.all([
      this.repository.findTopByStars(HIGHLIGHTS_LIMIT),
      this.repository.findLatest(HIGHLIGHTS_LIMIT),
      this.tagRepository.findAll(),
      this.userRepository.findAll(),
    ]);

    const tagMap = new Map(allTags.map((t) => [t.id.toString(), t.name]));
    const userMap = new Map(
      allUsers.map((u) => [u.id.toString(), { username: u.username, name: u.name }]),
    );

    return {
      bestResources: bestResources.map((r) => toResourceDTO(r, tagMap, userMap)),
      lastResources: lastResources.map((r) => toResourceDTO(r, tagMap, userMap)),
    };
  }
}
