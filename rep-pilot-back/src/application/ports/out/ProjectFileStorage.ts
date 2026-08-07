export interface ProjectFileEntry {
  path: string;
  content: string;
}

export interface FileMetadata {
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export interface ProjectFileStorage {
  saveProjectFiles(
    projectId: string,
    rootFolderName: string,
    files: ProjectFileEntry[],
    modifiedBy?: string,
  ): Promise<void>;

  getProjectFiles(projectId: string): Promise<ProjectFileEntry[]>;

  getFileContent(
    projectId: string,
    rootFolderName: string,
    filePath: string,
  ): Promise<string | null>;

  deleteProjectFiles(projectId: string): Promise<void>;

  /**
   * Elimina archivos individuales del proyecto.
   * @param filePaths Rutas relativas a rootFolderName (ej: "SKILL.md", "src/index.ts")
   */
  deleteFiles(
    projectId: string,
    rootFolderName: string,
    filePaths: string[],
  ): Promise<void>;

  getFileMetadata(projectId: string): Promise<Record<string, FileMetadata>>;

  updateFileMetadata(
    projectId: string,
    filePath: string,
    meta: FileMetadata,
  ): Promise<void>;

  updateMetadata(
    projectId: string,
    filePaths: string[],
    meta: FileMetadata,
  ): Promise<void>;
}
