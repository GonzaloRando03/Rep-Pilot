import { GetAllProjectFilesUseCase } from "../../ports/in/GetAllProjectFilesUseCase";
import { ProjectRepository } from "../../ports/out/ProjectRepository";
import { ProjectFileStorage } from "../../ports/out/ProjectFileStorage";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { ProjectFileWithMetaDTO } from "../../dto/SyncDTO";

export class GetAllProjectFiles implements GetAllProjectFilesUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectFileStorage: ProjectFileStorage,
  ) {}

  async execute(projectId: string): Promise<ProjectFileWithMetaDTO[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project with id '${projectId}' not found`);
    }

    const files = await this.projectFileStorage.getProjectFiles(projectId);
    const metadata = await this.projectFileStorage.getFileMetadata(projectId);

    return files.map((f) => {
      const meta = metadata[f.path];
      return {
        path: f.path,
        content: f.content,
        serverModifiedAt:
          meta?.lastModifiedAt ?? project.createdAt.toISOString(),
        lastModifiedBy: meta?.lastModifiedBy,
      };
    });
  }
}
