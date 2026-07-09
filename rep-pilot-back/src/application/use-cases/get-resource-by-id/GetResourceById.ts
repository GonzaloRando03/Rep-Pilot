import { GetResourceByIdUseCase } from "../../ports/in/GetResourceByIdUseCase";
import { ResourceDetailDTO } from "../../dto/ResourceDetailDTO";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { TagRepository } from "../../ports/out/TagRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { ConfigRepository } from "../../ports/out/ConfigRepository";
import { GitProviderFactoryPort } from "../scan-repository/ScanRepository";
import { toResourceDTO } from "../../mappers/toResourceDTO";
import { ResourceType } from "../../../domain/enums/ResourceType";
import { NotFoundError } from "../../../domain/errors/NotFoundError";

const README_CANDIDATES = ["README.md", "readme.md", "Readme.md"];
const TYPES_WITH_OWN_FILE = new Set<ResourceType>([
  ResourceType.SKILL,
  ResourceType.INSTRUCTION,
]);

export class GetResourceById implements GetResourceByIdUseCase {
  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
    private readonly configRepository: ConfigRepository,
    private readonly gitProviderFactory: GitProviderFactoryPort,
  ) {}

  async execute(id: string): Promise<ResourceDetailDTO> {
    const [resource, allTags, allUsers, config] = await Promise.all([
      this.resourceRepository.findById(id),
      this.tagRepository.findAll(),
      this.userRepository.findAll(),
      this.configRepository.find(),
    ]);

    if (!resource) {
      throw new NotFoundError(`Resource with id '${id}' not found`);
    }

    const tagMap = new Map(allTags.map((t) => [t.id.toString(), t.name]));
    const userMap = new Map(
      allUsers.map((u) => [u.id.toString(), { username: u.username, name: u.name }]),
    );
    const baseDTO = toResourceDTO(resource, tagMap, userMap);

    const provider = this.gitProviderFactory.getProvider(resource.gitUrl);
    const { owner, provider: providerName } = provider.getRepoOwner(
      resource.gitUrl,
    );

    const token = this.resolveToken(
      resource.gitUrl,
      config?.gitInstances ?? [],
    );
    const docMD = await this.fetchDocMD(
      resource.gitUrl,
      resource.type,
      resource.path,
      token,
      provider,
    );

    return {
      ...baseDTO,
      docMD,
      owner,
      provider: providerName,
    };
  }

  private async fetchDocMD(
    repoUrl: string,
    type: ResourceType,
    filePath: string,
    token: string | undefined,
    provider: ReturnType<GitProviderFactoryPort["getProvider"]>,
  ): Promise<string | null> {
    if (TYPES_WITH_OWN_FILE.has(type)) {
      if (!filePath) return null;
      return provider.getFileContent(repoUrl, filePath, token);
    }

    for (const candidate of README_CANDIDATES) {
      const content = await provider.getFileContent(repoUrl, candidate, token);
      if (content !== null) return content;
    }
    return null;
  }

  private resolveToken(
    repoUrl: string,
    gitInstances: { url: string; token: string }[],
  ): string | undefined {
    const match = gitInstances.find((g) => repoUrl.startsWith(g.url));
    return match?.token;
  }
}
