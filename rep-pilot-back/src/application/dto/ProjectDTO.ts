export interface ProjectFileEntry {
  path: string;
  content: string;
}

export interface CreateProjectDTO {
  name: string;
  members: string[];
  rootFolderName: string;
  files: ProjectFileEntry[];
  group?: string;
}

export interface ProjectMemberDTO {
  id: string;
  username: string;
  name: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  members: ProjectMemberDTO[];
  rootFolderName: string;
  directoryTree: Record<string, unknown>;
  createdAt: string;
  createdBy: ProjectMemberDTO;
  group?: string;
}
