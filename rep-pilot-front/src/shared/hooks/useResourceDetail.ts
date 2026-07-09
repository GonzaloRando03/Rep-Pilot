import { useEffect, useState, useCallback } from "react";
import {
  getResourceById,
  toggleResourceStar,
  type ResourceDetail,
} from "../lib/resources/resourcesApi";
import { userStorage } from "../lib/auth/userStorage";

interface UseResourceDetailReturn {
  resource: ResourceDetail | null;
  isLoading: boolean;
  error: "not_found" | "unauthorized" | "server_error" | null;
  isStarred: boolean;
  starCount: number;
  isTogglingstar: boolean;
  toggleStar: () => Promise<void>;
}

export function useResourceDetail(id: string): UseResourceDetailReturn {
  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<
    "not_found" | "unauthorized" | "server_error" | null
  >(null);
  const [isTogglingstar, setIsTogglingstar] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setIsLoading(true);
    setError(null);
    setResource(null);

    getResourceById(id)
      .then((data) => {
        if (!cancelled) {
          setResource(data);
          setIsLoading(false);
        }
      })
      .catch((err: { status?: number }) => {
        if (!cancelled) {
          if (err?.status === 404) setError("not_found");
          else if (err?.status === 401) setError("unauthorized");
          else setError("server_error");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const currentUserId = userStorage.get()?.id ?? null;
  const isStarred = !!currentUserId && (resource?.stars.some((s) => s.user === currentUserId) ?? false);
  const starCount = resource?.stars.length ?? 0;

  const toggleStar = useCallback(async () => {
    if (!id || isTogglingstar) return;
    setIsTogglingstar(true);
    try {
      const updated = await toggleResourceStar(id);
      // Merge only the stars field — PATCH response may not include docMD
      setResource((prev) => prev ? { ...prev, stars: updated.stars } : updated);
    } finally {
      setIsTogglingstar(false);
    }
  }, [id, isTogglingstar]);

  return { resource, isLoading, error, isStarred, starCount, isTogglingstar, toggleStar };
}
