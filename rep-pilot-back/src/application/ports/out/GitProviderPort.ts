export interface RepositoryFile {
  path: string;
  name: string;
  type: "file" | "dir";
  gitUrl: string;
}

export interface RepoOwnerInfo {
  owner: string;
  provider: "github" | "gitlab";
}

export interface GitProviderPort {
  supports(repoUrl: string): boolean;
  listFiles(repoUrl: string, token?: string): Promise<RepositoryFile[]>;
  getRepoOwner(repoUrl: string): RepoOwnerInfo;
  getFileContent(
    repoUrl: string,
    filePath: string,
    token?: string,
  ): Promise<string | null>;
  getFileContentBuffer(
    repoUrl: string,
    filePath: string,
    token?: string,
  ): Promise<Buffer | null>;
}
