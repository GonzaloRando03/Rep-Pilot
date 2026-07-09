import { apiFetch } from "../apiClient";

export type ResourceType = "MCP" | "AGENT" | "SKILL" | "INSTRUCTION" | "KIT";

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  MCP: "MCP",
  AGENT: "AGENT",
  SKILL: "SKILL",
  INSTRUCTION: "RULES / INSTRUCTIONS",
  KIT: "KIT",
};

export function getResourceTypeLabel(type: string): string {
  return RESOURCE_TYPE_LABELS[type as ResourceType] ?? type;
}

export interface CatalogResource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  gitUrl: string;
  stars: { user: string }[];
  tags: (string | { id: string; name: string })[];
  createdAt: string;
}

export interface ResourceSearchParams {
  type?: ResourceType;
  search?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
}

export interface ResourceSearchResponse {
  data: CatalogResource[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function searchResources(
  params: ResourceSearchParams,
): Promise<ResourceSearchResponse> {
  const qs = new URLSearchParams();
  if (params.type) qs.set("type", params.type);
  if (params.search) qs.set("search", params.search);
  params.tags?.forEach((tag) => qs.append("tag", tag));
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  const query = qs.toString();
  return apiFetch<ResourceSearchResponse>(
    `/api/resources/search${query ? `?${query}` : ""}`,
  );
}

export interface ResourceSummary {
  totalRecord: number;
  totalMcp: number;
  totalAgents: number;
  totalSkills: number;
}

export function fetchResourceSummary(): Promise<ResourceSummary> {
  return apiFetch<ResourceSummary>("/api/resources/summary");
}

export interface HighlightResource {
  id: string;
  name: string;
  type: string;
  description: string;
  gitUrl: string;
  stars: { user: string }[];
  tags: (string | { id: string; name: string })[];
  createdAt: string;
}

export interface ResourceHighlights {
  bestResources: HighlightResource[];
  lastResources: HighlightResource[];
}

export function fetchResourceHighlights(): Promise<ResourceHighlights> {
  return apiFetch<ResourceHighlights>("/api/resources/highlights");
}

export interface CreateResourcePayload {
  name: string;
  type: ResourceType;
  description: string;
  gitUrl: string;
  path: string;
  tags: string[];
}

export function createResource(
  payload: CreateResourcePayload,
): Promise<CatalogResource> {
  return apiFetch<CatalogResource>("/api/resources", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface ResourceDetail {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  gitUrl: string;
  path: string;
  stars: { user: string }[];
  tags: { id: string; name: string }[];
  createdAt: string;
  createdBy: { id: string; username: string; name: string } | string;
  docMD: string | null;
  owner: string;
  provider: string;
}

export function getResourceById(id: string): Promise<ResourceDetail> {
  return apiFetch<ResourceDetail>(`/api/resources/${id}`);
}

export function toggleResourceStar(id: string): Promise<ResourceDetail> {
  return apiFetch<ResourceDetail>(`/api/resources/${id}/star`, {
    method: "PATCH",
  });
}

export interface StarredResource {
  id: string;
  name: string;
  type: string;
  description: string;
  gitUrl: string;
  path: string;
  stars: { user: string }[];
  tags: { id: string; name: string }[];
  createdAt: string;
  createdBy: { id: string; username: string; name: string };
}

export function fetchStarredResources(): Promise<StarredResource[]> {
  return apiFetch<StarredResource[]>("/api/resources/starred");
}

export interface UpdateResourcePayload {
  name: string;
  description: string;
  tags: string[];
}

export function updateResource(
  id: string,
  payload: UpdateResourcePayload,
): Promise<ResourceDetail> {
  return apiFetch<ResourceDetail>(`/api/resources/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteResource(id: string): Promise<void> {
  return apiFetch<void>(`/api/resources/${id}`, {
    method: "DELETE",
  });
}
