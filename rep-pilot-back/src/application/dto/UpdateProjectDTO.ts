import { ProjectFileEntry } from "./ProjectDTO";

export interface UpdateProjectDTO {
  name?: string;
  group?: string | null;
  members?: string[];
  files?: ProjectFileEntry[];
  removedFiles?: string[];
}
