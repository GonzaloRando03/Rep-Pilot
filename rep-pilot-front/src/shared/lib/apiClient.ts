export const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export interface ApiError {
  status: number;
  message: string;
  requiresTwoFactor?: boolean;
}

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void): void {
  onUnauthorized = callback;
}

export function clearOnUnauthorized(): void {
  onUnauthorized = null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  skipUnauthorizedRedirect = false,
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    let parsedBody: { message?: string; requiresTwoFactor?: boolean } = {};
    try {
      parsedBody = JSON.parse(bodyText);
    } catch { /* not JSON */ }

    const apiError: ApiError = {
      status: response.status,
      message: (parsedBody.message ?? bodyText) || response.statusText,
      requiresTwoFactor: parsedBody.requiresTwoFactor,
    };

    if (
      response.status === 401 &&
      onUnauthorized &&
      !skipUnauthorizedRedirect
    ) {
      onUnauthorized();
    }

    throw apiError;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
