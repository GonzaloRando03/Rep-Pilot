import { ResourceFileEntry } from "../../dto/ResourceDTO";

export interface ResourceFileStorage {
  saveFiles(resourceId: string, files: ResourceFileEntry[]): Promise<void>;
  getFiles(resourceId: string): Promise<ResourceFileEntry[]>;
  deleteFiles(resourceId: string): Promise<void>;
}
