import { useState } from "react";
import { scanRepository } from "../lib/resources/repositoryApi";
import type { RepositoryScanResponse } from "../lib/resources/repositoryApi";
import type { ApiError } from "../lib/apiClient";

interface UseRepositoryScanResult {
  scan: (url: string) => Promise<RepositoryScanResponse | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useRepositoryScan(): UseRepositoryScanResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scan(url: string): Promise<RepositoryScanResponse | null> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await scanRepository({ url });
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { scan, isLoading, error, clearError: () => setError(null) };
}
