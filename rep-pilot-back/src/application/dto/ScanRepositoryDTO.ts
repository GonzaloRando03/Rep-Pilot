import { ResourceType } from "../../domain/enums/ResourceType";

export interface ScanRepositoryInputDTO {
  url: string;
}

export interface ScannedResourceDTO {
  name: string;
  type: ResourceType;
  gitUrl: string;
  path: string;
}

export interface ScanRepositoryResponseDTO {
  skills: ScannedResourceDTO[];
  instructions: ScannedResourceDTO[];
  agents: ScannedResourceDTO[];
}
