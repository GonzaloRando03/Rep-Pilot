import { ResourceType } from "../../../domain/enums/ResourceType";
import {
  GitProviderPort,
  RepositoryFile,
} from "../../ports/out/GitProviderPort";
import { ScanRepositoryUseCase } from "../../ports/in/ScanRepositoryUseCase";
import { ConfigRepository } from "../../ports/out/ConfigRepository";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import {
  ScanRepositoryInputDTO,
  ScanRepositoryResponseDTO,
  ScannedResourceDTO,
} from "../../dto/ScanRepositoryDTO";

const DIRECTORY_TYPE_MAP: Record<string, ResourceType> = {
  skills: ResourceType.SKILL,
  instructions: ResourceType.INSTRUCTION,
  agents: ResourceType.AGENT,
  rules: ResourceType.INSTRUCTION,
};

const SCANNED_DIRECTORIES = Object.keys(DIRECTORY_TYPE_MAP);

function toScannedResourceDTO(
  file: RepositoryFile,
  type: ResourceType,
  repoUrl: string,
): ScannedResourceDTO {
  return {
    name: resolveResourceName(file, type),
    type,
    gitUrl: repoUrl,
    path: file.path,
  };
}

function resolveResourceName(file: RepositoryFile, type: ResourceType): string {
  if (type === ResourceType.SKILL) {
    const segments = file.path.split("/");
    return segments[segments.length - 2] ?? file.name;
  }
  if (type === ResourceType.AGENT) {
    return file.name.replace(/\.agent\.md$/i, "");
  }
  if (type === ResourceType.INSTRUCTION) {
    const instrMatch = file.name.match(/^(.+)\.instructions?\.md$/i);
    if (instrMatch) return instrMatch[1];
    return file.name.replace(/\.md$/i, "");
  }
  return file.name;
}

function matchesDirectory(
  filePath: string,
  fileName: string,
): ResourceType | null {
  for (const dir of SCANNED_DIRECTORIES) {
    if (filePath.startsWith(`${dir}/`) || filePath.includes(`/${dir}/`)) {
      // rules/ only matches .md files
      if (dir === "rules" && !fileName.endsWith(".md")) return null;
      // agents/ does not capture SKILL.md (let matchesFile handle it)
      if (dir === "agents" && fileName === "SKILL.md") return null;
      return DIRECTORY_TYPE_MAP[dir];
    }
  }
  return null;
}

function matchesFile(file: RepositoryFile): ResourceType | null {
  if (file.name === "SKILL.md") return ResourceType.SKILL;
  if (/\.instructions?\.md$/i.test(file.name)) return ResourceType.INSTRUCTION;
  if (/\.agent\.md$/i.test(file.name)) return ResourceType.AGENT;
  return null;
}

export class ScanRepository implements ScanRepositoryUseCase {
  constructor(
    private readonly gitProviderFactory: GitProviderFactoryPort,
    private readonly configRepository: ConfigRepository,
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async execute(
    input: ScanRepositoryInputDTO,
  ): Promise<ScanRepositoryResponseDTO> {
    const provider = this.gitProviderFactory.getProvider(input.url);
    const token = await this.resolveToken(input.url);
    const files = await provider.listFiles(input.url, token);

    const existingResources = await this.resourceRepository.findByGitUrl(
      input.url,
    );
    const existingPaths = new Set(
      existingResources.map((r) => r.path).filter(Boolean),
    );

    const result: ScanRepositoryResponseDTO = {
      skills: [],
      instructions: [],
      agents: [],
    };

    for (const file of files) {
      if (file.type !== "file") continue;

      const resourceType =
        matchesDirectory(file.path, file.name) ?? matchesFile(file);
      if (!resourceType) continue;

      if (existingPaths.has(file.path)) continue;

      const dto = toScannedResourceDTO(file, resourceType, input.url);

      if (resourceType === ResourceType.SKILL) result.skills.push(dto);
      else if (resourceType === ResourceType.INSTRUCTION)
        result.instructions.push(dto);
      else if (resourceType === ResourceType.AGENT) result.agents.push(dto);
    }

    return result;
  }

  private async resolveToken(repoUrl: string): Promise<string | undefined> {
    const config = await this.configRepository.find();
    if (!config) return undefined;

    const match = config.gitInstances.find((instance) =>
      repoUrl.startsWith(instance.url),
    );
    return match?.token;
  }
}

export interface GitProviderFactoryPort {
  getProvider(repoUrl: string): GitProviderPort;
}
