import { SyncRequestDTO, SyncResponseDTO } from "../../dto/SyncDTO";

export interface SyncProjectFilesUseCase {
  execute(
    projectId: string,
    userId: string,
    request: SyncRequestDTO,
  ): Promise<SyncResponseDTO>;
}
