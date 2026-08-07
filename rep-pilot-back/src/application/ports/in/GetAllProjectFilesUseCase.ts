import { ProjectFileWithMetaDTO } from "../../dto/SyncDTO";

export interface GetAllProjectFilesUseCase {
  execute(projectId: string): Promise<ProjectFileWithMetaDTO[]>;
}
