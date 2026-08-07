import { apiFetch } from "../apiClient";

export interface ProjectFileEntry {
  path: string;
  content: string;
}

export interface CreateProjectPayload {
  name: string;
  members: string[];
  rootFolderName: string;
  files: ProjectFileEntry[];
  group?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  members?: string[];
  files?: ProjectFileEntry[];
  removedFiles?: string[];
  group?: string;
}

export interface ProjectMember {
  id: string;
  username: string;
  name: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  members: ProjectMember[];
  rootFolderName: string;
  directoryTree: Record<string, unknown>;
  createdAt: string;
  createdBy: ProjectMember;
  group?: string;
}

export interface FileContentResponse {
  path: string;
  content: string;
}

export function fetchProjects(group?: string): Promise<ProjectResponse[]> {
  const query = group ? `?group=${encodeURIComponent(group)}` : "";
  return apiFetch<ProjectResponse[]>(`/api/projects${query}`);
}

export function fetchProjectGroups(): Promise<string[]> {
  return apiFetch<string[]>("/api/projects/groups");
}

export function fetchProject(id: string): Promise<ProjectResponse> {
  return apiFetch<ProjectResponse>(`/api/projects/${id}`);
}

export function createProject(
  payload: CreateProjectPayload,
): Promise<ProjectResponse> {
  return apiFetch<ProjectResponse>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchFileContent(
  projectId: string,
  filePath: string,
): Promise<FileContentResponse> {
  return apiFetch<FileContentResponse>(
    `/api/projects/${projectId}/files?path=${encodeURIComponent(filePath)}`,
  );
}

export function updateProject(
  id: string,
  payload: UpdateProjectPayload,
): Promise<ProjectResponse> {
  return apiFetch<ProjectResponse>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/api/projects/${id}`, {
    method: "DELETE",
  });
}
