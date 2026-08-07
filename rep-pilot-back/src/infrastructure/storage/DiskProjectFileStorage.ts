import * as fs from "fs/promises";
import * as path from "path";
import {
  ProjectFileEntry,
  ProjectFileStorage,
} from "../../application/ports/out/ProjectFileStorage";

const DATA_DIR = process.env.DATA_DIR ?? path.resolve("data");
const PROJECTS_BASE_DIR = path.join(DATA_DIR, "projects");

/** Metadata por archivo para sincronización */
interface FileMetadata {
  lastModifiedBy: string;
  lastModifiedAt: string;
}

type MetadataMap = Record<string, FileMetadata>;

export class DiskProjectFileStorage implements ProjectFileStorage {
  async saveProjectFiles(
    projectId: string,
    rootFolderName: string,
    files: ProjectFileEntry[],
    modifiedBy?: string,
  ): Promise<void> {
    const projectDir = path.join(PROJECTS_BASE_DIR, projectId, rootFolderName);

    for (const file of files) {
      const fullPath = path.join(projectDir, file.path);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, file.content, "utf-8");
    }

    // Actualizar metadata si se proporciona el usuario
    if (modifiedBy) {
      await this.updateMetadata(
        projectId,
        files.map((f) => f.path),
        {
          lastModifiedBy: modifiedBy,
          lastModifiedAt: new Date().toISOString(),
        },
      );
    }
  }

  async getProjectFiles(projectId: string): Promise<ProjectFileEntry[]> {
    const projectDir = path.join(PROJECTS_BASE_DIR, projectId);
    return this.readDirRecursive(projectDir, projectDir);
  }

  async getFileContent(
    projectId: string,
    rootFolderName: string,
    filePath: string,
  ): Promise<string | null> {
    const projectDir = path.join(PROJECTS_BASE_DIR, projectId, rootFolderName);
    const resolvedBase = path.resolve(projectDir);

    // Try the stripped path first, then with rootFolderName prefix (handles both
    // frontend conventions: paths with or without the folder name prefix)
    const candidates = [filePath, rootFolderName + "/" + filePath];

    for (const candidate of candidates) {
      const fullPath = path.join(projectDir, candidate);
      const resolved = path.resolve(fullPath);

      // Prevent path traversal outside project directory
      if (!resolved.startsWith(resolvedBase)) {
        continue;
      }

      try {
        return await fs.readFile(resolved, "utf-8");
      } catch {
        // try next candidate
      }
    }

    return null;
  }

  async deleteProjectFiles(projectId: string): Promise<void> {
    const projectDir = path.join(PROJECTS_BASE_DIR, projectId);
    try {
      await fs.rm(projectDir, { recursive: true, force: true });
    } catch {
      // directory may not exist, ignore
    }
  }

  async deleteFiles(
    projectId: string,
    rootFolderName: string,
    filePaths: string[],
  ): Promise<void> {
    const projectDir = path.join(PROJECTS_BASE_DIR, projectId, rootFolderName);
    const resolvedBase = path.resolve(projectDir);

    for (const filePath of filePaths) {
      const fullPath = path.join(projectDir, filePath);
      const resolved = path.resolve(fullPath);

      // Prevent path traversal
      if (!resolved.startsWith(resolvedBase)) continue;

      try {
        await fs.unlink(resolved);
      } catch {
        // file may not exist, ignore
      }
    }
  }

  // ─── Metadata methods ─────────────────────────────────────

  private metaFilePath(projectId: string): string {
    return path.join(PROJECTS_BASE_DIR, projectId, ".reppilot-meta.json");
  }

  /**
   * Lee el mapa de metadatos de un proyecto.
   */
  async getFileMetadata(projectId: string): Promise<MetadataMap> {
    try {
      const raw = await fs.readFile(this.metaFilePath(projectId), "utf-8");
      return JSON.parse(raw) as MetadataMap;
    } catch {
      return {};
    }
  }

  /**
   * Actualiza la metadata de archivos específicos.
   */
  async updateMetadata(
    projectId: string,
    filePaths: string[],
    meta: FileMetadata,
  ): Promise<void> {
    const current = await this.getFileMetadata(projectId);
    for (const fp of filePaths) {
      current[fp] = meta;
    }
    await fs.mkdir(path.dirname(this.metaFilePath(projectId)), {
      recursive: true,
    });
    await fs.writeFile(
      this.metaFilePath(projectId),
      JSON.stringify(current, null, 2),
      "utf-8",
    );
  }

  /**
   * Actualiza la metadata de un solo archivo.
   */
  async updateFileMetadata(
    projectId: string,
    filePath: string,
    meta: FileMetadata,
  ): Promise<void> {
    await this.updateMetadata(projectId, [filePath], meta);
  }

  private async readDirRecursive(
    baseDir: string,
    currentDir: string,
  ): Promise<ProjectFileEntry[]> {
    const entries: ProjectFileEntry[] = [];

    let items;
    try {
      items = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return entries;
    }

    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      if (item.isFile()) {
        const relativePath = path
          .relative(baseDir, fullPath)
          .replace(/\\/g, "/");
        const content = await fs.readFile(fullPath, "utf-8");
        entries.push({ path: relativePath, content });
      } else if (item.isDirectory()) {
        const nested = await this.readDirRecursive(baseDir, fullPath);
        entries.push(...nested);
      }
    }

    return entries;
  }
}
