import JSZip from "jszip";
import {
  DownloadResourceUseCase,
  DownloadResult,
} from "../../ports/in/DownloadResourceUseCase";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { ResourceFileStorage } from "../../ports/out/ResourceFileStorage";
import { ConfigRepository } from "../../ports/out/ConfigRepository";
import { GitProviderFactoryPort } from "../scan-repository/ScanRepository";
import { ResourceType } from "../../../domain/enums/ResourceType";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { RepositoryFile } from "../../ports/out/GitProviderPort";

export class DownloadResource implements DownloadResourceUseCase {
  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly configRepository: ConfigRepository,
    private readonly gitProviderFactory: GitProviderFactoryPort,
    private readonly fileStorage: ResourceFileStorage,
  ) {}

  async execute(resourceId: string): Promise<DownloadResult> {
    const resource = await this.resourceRepository.findById(resourceId);
    if (!resource) {
      throw new NotFoundError(`Resource with id '${resourceId}' not found`);
    }

    if (resource.hasFiles) {
      return this.downloadFromDisk(resource.name, resourceId);
    }

    return this.downloadFromGit(resource);
  }

  private async downloadFromDisk(
    resourceName: string,
    resourceId: string,
  ): Promise<DownloadResult> {
    const files = await this.fileStorage.getFiles(resourceId);

    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.path, file.content);
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    if (zipBuffer.length <= 22) {
      throw new Error(
        `No downloadable files found for resource '${resourceName}'`,
      );
    }

    const filename = `${resourceName}.zip`;
    return { buffer: zipBuffer, filename };
  }

  private async downloadFromGit(resource: {
    name: string;
    type: ResourceType;
    path: string;
    gitUrl: string;
  }): Promise<DownloadResult> {
    const token = await this.resolveToken(resource.gitUrl);
    const provider = this.gitProviderFactory.getProvider(resource.gitUrl);

    const allFiles = await provider.listFiles(resource.gitUrl, token);
    const scope = resolveDownloadScope(resource.type, resource.path);
    const targetFiles = filterFilesByScope(allFiles, scope);

    const zipRoot = scope ? (scope.split("/").pop() ?? "download") : null;

    const zip = new JSZip();

    await Promise.all(
      targetFiles.map(async (file) => {
        const buffer = await provider.getFileContentBuffer(
          resource.gitUrl,
          file.path,
          token,
        );
        if (buffer !== null) {
          const relativePath = scope
            ? file.path.substring(scope.length + 1)
            : file.path;
          const entryPath = zipRoot
            ? `${zipRoot}/${relativePath}`
            : relativePath;
          zip.file(entryPath, buffer);
        }
      }),
    );

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    if (zipBuffer.length <= 22) {
      throw new Error(
        `No downloadable files found for resource '${resource.name}' (type: ${resource.type}, path: '${resource.path}')`,
      );
    }

    const filename = buildFilename(resource.type, resource.name, scope);
    return { buffer: zipBuffer, filename };
  }

  private async resolveToken(repoUrl: string): Promise<string | undefined> {
    const config = await this.configRepository.find();
    if (!config) return undefined;
    return config.gitInstances.find((g) => repoUrl.startsWith(g.url))?.token;
  }
}

function resolveDownloadScope(type: ResourceType, path: string): string | null {
  switch (type) {
    case ResourceType.MCP:
    case ResourceType.KIT:
      return null;

    case ResourceType.SKILL:
    case ResourceType.INSTRUCTION:
      return getParentFolder(path);

    case ResourceType.AGENT:
      return resolveAgentScope(path);
  }
}

function getParentFolder(filePath: string): string | null {
  const lastSlash = filePath.lastIndexOf("/");
  return lastSlash > 0 ? filePath.substring(0, lastSlash) : null;
}

function resolveAgentScope(filePath: string): string | null {
  // "parentfolder/agents/agent.md" → "parentfolder"
  // "agents/agent.md"              → null (download whole repo)
  const idx = filePath.indexOf("/agents/");
  if (idx <= 0) return null;
  return filePath.substring(0, idx);
}

function filterFilesByScope(
  files: RepositoryFile[],
  scope: string | null,
): RepositoryFile[] {
  const onlyFiles = files.filter((f) => f.type === "file");
  if (!scope) return onlyFiles;
  return onlyFiles.filter(
    (f) => f.path === scope || f.path.startsWith(`${scope}/`),
  );
}

function buildFilename(
  type: ResourceType,
  resourceName: string,
  scope: string | null,
): string {
  const safe = resourceName.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (scope) {
    const folderName = scope.split("/").pop() ?? safe;
    return folderName;
  }
  return safe;
}
