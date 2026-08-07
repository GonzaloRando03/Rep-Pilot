import { GetProjectFileUseCase } from "../../ports/in/GetProjectFileUseCase";
import { ProjectRepository } from "../../ports/out/ProjectRepository";
import { ProjectFileStorage } from "../../ports/out/ProjectFileStorage";
import { NotFoundError } from "../../../domain/errors/NotFoundError";

export class GetProjectFile implements GetProjectFileUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectFileStorage: ProjectFileStorage,
  ) {}

  async execute(
    projectId: string,
    filePath: string,
  ): Promise<{ path: string; content: string }> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project with id '${projectId}' not found`);
    }

    // Strip rootFolderName prefix if the caller included it
    const rootPrefix = project.rootFolderName + "/";
    let relativePath = filePath;
    if (relativePath.startsWith(rootPrefix)) {
      relativePath = relativePath.slice(rootPrefix.length);
    }

    const content = await this.projectFileStorage.getFileContent(
      projectId,
      project.rootFolderName,
      relativePath,
    );
    if (content === null) {
      throw new NotFoundError(
        `File '${filePath}' not found in project '${projectId}'`,
      );
    }

    return { path: filePath, content };
  }
}
