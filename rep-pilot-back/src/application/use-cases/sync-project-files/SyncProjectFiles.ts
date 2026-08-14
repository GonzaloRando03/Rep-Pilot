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

    const rootFolderName = project.rootFolderName;
    // Los clientes pueden enviar rutas con o sin el prefijo rootFolderName.
    // Internamente trabajamos con rutas relativas a rootFolderName, que es lo
    // que espera ProjectFileStorage.saveProjectFiles (evita el prefijo duplicado).
    const rootPrefix =
      rootFolderName.replace(/\\/g, "/").replace(/\/+$/, "") + "/";

    const metadata = await this.projectFileStorage.getFileMetadata(projectId);
    const lastSyncAt = request.lastSyncAt
      ? new Date(request.lastSyncAt).getTime()
      : 0;

    const now = new Date().toISOString();
    const conflicts: SyncConflictDTO[] = [];
    const processedLocalPaths = new Set<string>();

    // ── 1. Procesar archivos entrantes del cliente ──────────
    for (const file of request.files) {
      const relPath = this.normalizePath(file.path, rootPrefix);
      processedLocalPaths.add(relPath);

      // Compatibilidad con metadatos antiguos que guardaban el prefijo.
      const serverMeta = metadata[relPath] ?? metadata[file.path];

      if (!serverMeta) {
        // Archivo nuevo: guardar directamente
        await this.writeFile(projectId, rootFolderName, relPath, file.content);
        await this.projectFileStorage.updateFileMetadata(projectId, relPath, {
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
              rootFolderName,
              relPath,
            )) ?? "";

          // Guardamos la versión del cliente pero marcamos conflicto
          await this.writeFile(
            projectId,
            rootFolderName,
            relPath,
            file.content,
          );

          conflicts.push({
            path: relPath,
            localContent: file.content,
            serverContent,
            serverModifiedAt: serverMeta.lastModifiedAt,
          });

          // Actualizar metadata a la versión del cliente
          await this.projectFileStorage.updateFileMetadata(projectId, relPath, {
            lastModifiedBy: userId,
            lastModifiedAt: now,
          });
        } else {
          // Sin conflicto: sobrescribir con versión del cliente
          await this.writeFile(
            projectId,
            rootFolderName,
            relPath,
            file.content,
          );
          await this.projectFileStorage.updateFileMetadata(projectId, relPath, {
            lastModifiedBy: userId,
            lastModifiedAt: now,
          });
        }
      }
    }

    // ── 2. Recopilar archivos modificados en servidor ───────
    const changedFiles: ProjectFileWithMetaDTO[] = [];

    for (const [filePath, meta] of Object.entries(metadata)) {
      const relPath = this.normalizePath(filePath, rootPrefix);
      // Saltar archivos que ya fueron procesados (enviados por el cliente)
      if (processedLocalPaths.has(relPath)) {
        continue;
      }

      const modifiedAt = new Date(meta.lastModifiedAt).getTime();
      if (modifiedAt > lastSyncAt) {
        const content =
          (await this.projectFileStorage.getFileContent(
            projectId,
            rootFolderName,
            relPath,
          )) ?? "";

        changedFiles.push({
          path: relPath,
          content,
          serverModifiedAt: meta.lastModifiedAt,
          lastModifiedBy: meta.lastModifiedBy,
        });
      }
    }

    // ── 3. Reconstruir el árbol de directorios ──────────────
    // Los archivos nuevos deben reflejarse en project.directoryTree, que es
    // lo que la UI usa para mostrarlos.
    await this.refreshDirectoryTree(projectId);

    return {
      changedFiles,
      conflicts,
      newLastSyncAt: now,
    };
  }

  /**
   * Normaliza una ruta a relativa a rootFolderName (sin el prefijo),
   * eliminando además prefijos duplicados dejados por versiones anteriores.
   */
  private normalizePath(filePath: string, rootPrefix: string): string {
    let normalized = filePath.replace(/\\/g, "/");
    while (normalized.startsWith(rootPrefix)) {
      normalized = normalized.slice(rootPrefix.length);
    }
    return normalized;
  }

  /**
   * Recalcula project.directoryTree a partir de los archivos en disco.
   */
  private async refreshDirectoryTree(projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return;
    }

    const rootPrefix =
      project.rootFolderName.replace(/\\/g, "/").replace(/\/+$/, "") + "/";
    const allFiles = await this.projectFileStorage.getProjectFiles(projectId);

    const tree: Record<string, unknown> = {};
    for (const file of allFiles) {
      const relPath = this.normalizePath(file.path, rootPrefix);
      const segments = relPath.split("/").filter(Boolean);
      let current = tree;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (i === segments.length - 1) {
          current[segment] = true;
        } else {
          if (!current[segment] || typeof current[segment] === "boolean") {
            current[segment] = {};
          }
          current = current[segment] as Record<string, unknown>;
        }
      }
    }

    await this.projectRepository.save(project.withDirectoryTree(tree));
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
