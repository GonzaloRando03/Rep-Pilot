export const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export interface ApiError {
  status: number;
  message: string;
  requiresTwoFactor?: boolean;
  requiresTwoFactorSetup?: boolean;
  /** Temporary token included by the backend when 2FA setup is required but the user hasn't configured it yet. */
  token?: string;
  sessionExpired?: boolean;
}

let onUnauthorized: (() => void) | null = null;
let sessionExpired = false;

export function setOnUnauthorized(callback: () => void): void {
  onUnauthorized = callback;
}

export function clearOnUnauthorized(): void {
  onUnauthorized = null;
}

export function resetSessionExpired(): void {
  sessionExpired = false;
}

export function isSessionExpiredError(error: unknown): boolean {
  return (error as ApiError)?.sessionExpired === true;
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
    let parsedBody: {
      message?: string;
      requiresTwoFactor?: boolean;
      requiresTwoFactorSetup?: boolean;
      token?: string;
    } = {};
    try {
      parsedBody = JSON.parse(bodyText);
    } catch {
      /* not JSON */
    }

    // Debug: log 401 responses to diagnose 2FA flow issues
    if (response.status === 401) {
      console.error(
        "[apiFetch] 401 response for",
        path,
        "| raw body:",
        bodyText.substring(0, 200),
        "| parsed:",
        JSON.stringify({
          message: parsedBody.message,
          requiresTwoFactor: parsedBody.requiresTwoFactor,
          requiresTwoFactorSetup: parsedBody.requiresTwoFactorSetup,
          hasToken:
            typeof parsedBody.token === "string" && parsedBody.token.length > 0,
        }),
      );
    }

    const apiError: ApiError = {
      status: response.status,
      message: (parsedBody.message ?? bodyText) || response.statusText,
      requiresTwoFactor: parsedBody.requiresTwoFactor,
      requiresTwoFactorSetup: parsedBody.requiresTwoFactorSetup,
      token: parsedBody.token,
    };

    if (response.status === 401 && !skipUnauthorizedRedirect) {
      if (!sessionExpired && onUnauthorized) {
        sessionExpired = true;
        onUnauthorized();
      }
      apiError.sessionExpired = true;
    }

    throw apiError;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
