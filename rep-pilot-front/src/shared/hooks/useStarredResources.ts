import { useEffect, useState } from "react";
import {
  fetchStarredResources,
  type StarredResource,
} from "../lib/resources/resourcesApi";

interface UseStarredResourcesResult {
  resources: StarredResource[];
  isLoading: boolean;
  error: boolean;
}

export function useStarredResources(): UseStarredResourcesResult {
  const [resources, setResources] = useState<StarredResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchStarredResources()
      .then((data) => {
        if (!cancelled) {
          setResources(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { resources, isLoading, error };
}
