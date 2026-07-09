import { useEffect, useState } from "react";
import { fetchTags, type Tag } from "../lib/resources/tagsApi";
import { toast } from "../lib/toast/toastBus";

export interface UseTagsResult {
  tags: Tag[];
  isLoading: boolean;
}

export function useTags(): UseTagsResult {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchTags()
      .then((data) => {
        if (!cancelled) {
          setTags(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("No se pudieron cargar las etiquetas.");
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { tags, isLoading };
}
