import { SyncProjectFilesUseCase } from "../../ports/in/SyncProjectFilesUseCase";
import { ProjectRepository } from "../../ports/out/ProjectRepository";
import { ProjectFileStorage } from "../../ports/out/ProjectFileStorage";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import {
  SyncRequestDTO,
  SyncResponseDTO,
  SyncConflictDTO,
  ProjectFileWithMetaDTO,
} from "../../dto/SyncDTO";

export class SyncProjectFiles implements SyncProjectFilesUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectFileStorage: ProjectFileStorage,
  ) {}

  async execute(
    projectId: string,
    userId: string,
    request: SyncRequestDTO,
  ): Promise<SyncResponseDTO> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project with id '${projectId}' not found`);
    }

    const metadata = await this.projectFileStorage.getFileMetadata(projectId);
    const lastSyncAt = request.lastSyncAt
      ? new Date(request.lastSyncAt).getTime()
      : 0;

    const now = new Date().toISOString();
    const conflicts: SyncConflictDTO[] = [];
    const processedLocalPaths = new Set<string>();

    // ── 1. Procesar archivos entrantes del cliente ──────────
    for (const file of request.files) {
      processedLocalPaths.add(file.path);

      const serverMeta = metadata[file.path];

      if (!serverMeta) {
        // Archivo nuevo: guardar directamente
        await this.writeFile(
          projectId,
          project.rootFolderName,
          file.path,
          file.content,
        );
        await this.projectFileStorage.updateFileMetadata(projectId, file.path, {
          lastModifiedBy: userId,
          lastModifiedAt: now,
        });
      } else {
        const serverModifiedAt = new Date(serverMeta.lastModifiedAt).getTime();

        if (serverModifiedAt > lastSyncAt) {
          // El servidor tiene cambios posteriores a la última sync del cliente
          // → CONFLICTO: ambos modificaron el archivo
          const serverContent =
            (await this.projectFileStorage.getFileContent(
              projectId,
              project.rootFolderName,
              file.path,
            )) ?? "";

          // Guardamos la versión del cliente pero marcamos conflicto
          await this.writeFile(
            projectId,
            project.rootFolderName,
            file.path,
            file.content,
          );

          conflicts.push({
            path: file.path,
            localContent: file.content,
            serverContent,
            serverModifiedAt: serverMeta.lastModifiedAt,
          });

          // Actualizar metadata a la versión del cliente
          await this.projectFileStorage.updateFileMetadata(
            projectId,
            file.path,
            {
              lastModifiedBy: userId,
              lastModifiedAt: now,
            },
          );
        } else {
          // Sin conflicto: sobrescribir con versión del cliente
          await this.writeFile(
            projectId,
            project.rootFolderName,
            file.path,
            file.content,
          );
          await this.projectFileStorage.updateFileMetadata(
            projectId,
            file.path,
            {
              lastModifiedBy: userId,
              lastModifiedAt: now,
            },
          );
        }
      }
    }

    // ── 2. Recopilar archivos modificados en servidor ───────
    const changedFiles: ProjectFileWithMetaDTO[] = [];

    for (const [filePath, meta] of Object.entries(metadata)) {
      // Saltar archivos que ya fueron procesados (enviados por el cliente)
      if (processedLocalPaths.has(filePath)) {
        continue;
      }

      const modifiedAt = new Date(meta.lastModifiedAt).getTime();
      if (modifiedAt > lastSyncAt) {
        const content =
          (await this.projectFileStorage.getFileContent(
            projectId,
            project.rootFolderName,
            filePath,
          )) ?? "";

        changedFiles.push({
          path: filePath,
          content,
          serverModifiedAt: meta.lastModifiedAt,
          lastModifiedBy: meta.lastModifiedBy,
        });
      }
    }

    return {
      changedFiles,
      conflicts,
      newLastSyncAt: now,
    };
  }

  private async writeFile(
    projectId: string,
    rootFolderName: string,
    filePath: string,
    content: string,
  ): Promise<void> {
    await this.projectFileStorage.saveProjectFiles(
      projectId,
      rootFolderName,
      [{ path: filePath, content }],
      undefined,
    );
  }
}
