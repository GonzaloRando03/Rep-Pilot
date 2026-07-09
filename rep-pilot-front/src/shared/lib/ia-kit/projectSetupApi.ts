import { apiFetch, BASE_URL } from "../apiClient";

export interface ProjectSetupRequest {
  specs: string;
}

export interface ProjectSetupResponse {
  mdToRender: string;
  questions: string[];
}

export interface GenerateKitRequest {
  specs: string;
  questionsAndAnswers: { question: string; answer: string }[];
}

export async function postProjectSetup(
  body: ProjectSetupRequest,
): Promise<ProjectSetupResponse> {
  return apiFetch<ProjectSetupResponse>("/api/project-setup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function postGenerateKit(body: GenerateKitRequest): Promise<Blob> {
  const token = localStorage.getItem("auth_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}/api/generate-kit`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || "Kit generation failed");
  }

  return response.blob();
}
