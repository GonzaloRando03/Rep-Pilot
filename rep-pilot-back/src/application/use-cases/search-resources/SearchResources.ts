import { SearchResourcesUseCase } from "../../ports/in/SearchResourcesUseCase";
import {
  PaginatedResourcesDTO,
  ResourceFilterDTO,
} from "../../dto/PaginatedResourcesDTO";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { TagRepository } from "../../ports/out/TagRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { toResourceDTO } from "../../mappers/toResourceDTO";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export class SearchResources implements SearchResourcesUseCase {
  constructor(
    private readonly repository: ResourceRepository,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(filter: ResourceFilterDTO): Promise<PaginatedResourcesDTO> {
    const page = Math.max(1, filter.page ?? DEFAULT_PAGE);
    const pageSize = Math.min(
      100,
      Math.max(1, filter.pageSize ?? DEFAULT_PAGE_SIZE),
    );

    const [{ items, total }, allTags, allUsers] = await Promise.all([
      this.repository.findPaginated({ ...filter, page, pageSize }),
      this.tagRepository.findAll(),
      this.userRepository.findAll(),
    ]);

    const tagMap = new Map(allTags.map((t) => [t.id.toString(), t.name]));
    const userMap = new Map(
      allUsers.map((u) => [u.id.toString(), { username: u.username, name: u.name }]),
    );

    return {
      data: items.map((r) => toResourceDTO(r, tagMap, userMap)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
