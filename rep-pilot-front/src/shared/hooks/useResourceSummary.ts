import { useEffect, useState } from "react";
import { fetchResourceSummary } from "../lib/resources/resourcesApi";
import type { ResourceSummary } from "../lib/resources/resourcesApi";
import { toast } from "../lib/toast/toastBus";

interface UseResourceSummaryReturn {
  data: ResourceSummary | null;
  isLoading: boolean;
}

export function useResourceSummary(): UseResourceSummaryReturn {
  const [data, setData] = useState<ResourceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchResourceSummary()
      .then((summary) => {
        if (!cancelled) setData(summary);
      })
      .catch(() => {
        if (!cancelled)
          toast.error("No se pudo cargar el resumen de recursos.");
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
