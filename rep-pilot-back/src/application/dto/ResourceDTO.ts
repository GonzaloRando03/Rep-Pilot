import { ResourceType } from "../../domain/enums/ResourceType";
import { TagDTO } from "./TagDTO";

export interface CreatorDTO {
  id: string;
  username: string;
  name: string;
}

export interface CreateResourceDTO {
  name: string;
  type: ResourceType;
  description: string;
  gitUrl?: string;
  path?: string;
  tags?: string[];
  createdBy: string;
}

export interface ResourceFileEntry {
  path: string;
  content: string;
}

export interface CreateResourceFromUploadDTO {
  name: string;
  type: ResourceType;
  description: string;
  path?: string;
  tags?: string[];
  createdBy: string;
  files: ResourceFileEntry[];
}

export interface ResourceDTO {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  gitUrl: string;
  path: string;
  stars: { user: string }[];
  tags: TagDTO[];
  createdAt: string;
  createdBy: CreatorDTO;
  hasFiles: boolean;
}
