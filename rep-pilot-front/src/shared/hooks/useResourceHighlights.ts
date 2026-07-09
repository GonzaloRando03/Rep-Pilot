import { useEffect, useState } from "react";
import {
  fetchResourceHighlights,
  type ResourceHighlights,
} from "../lib/resources/resourcesApi";
import { toast } from "../lib/toast/toastBus";

interface UseResourceHighlightsReturn {
  data: ResourceHighlights | null;
  isLoading: boolean;
}

export function useResourceHighlights(): UseResourceHighlightsReturn {
  const [data, setData] = useState<ResourceHighlights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchResourceHighlights()
      .then((highlights) => {
        if (!cancelled) setData(highlights);
      })
      .catch(() => {
        if (!cancelled)
          toast.error("No se pudieron cargar los recursos destacados.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading };
}
