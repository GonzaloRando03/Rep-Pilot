import { useState, useEffect, useCallback } from "react";
import {
  fetchProject,
  updateProject,
  deleteProject,
  type ProjectResponse,
  type UpdateProjectPayload,
} from "../lib/projects/projectsApi";
import { toast } from "../lib/toast/toastBus";
import { useTranslation } from "./useTranslation";
import { isSessionExpiredError } from "../lib/apiClient";

export interface UseProjectDetailReturn {
  project: ProjectResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  update: (payload: UpdateProjectPayload) => Promise<boolean>;
  remove: () => Promise<boolean>;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useProjectDetail(id: string): UseProjectDetailReturn {
  const t = useTranslation();
  const tp = t.projects;

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    fetchProject(id)
      .then(setProject)
      .catch(() => setError(tp.detail.detailNotFound))
      .finally(() => setIsLoading(false));
  }, [id, tp.detail.detailNotFound]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(
    async (payload: UpdateProjectPayload): Promise<boolean> => {
      setIsUpdating(true);
      try {
        const updated = await updateProject(id, payload);
        setProject(updated);
        toast.success(tp.detail.editSuccess);
        return true;
      } catch (err) {
        if (!isSessionExpiredError(err)) {
          toast.error(tp.detail.editError);
        }
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [id, tp.detail],
  );

  const remove = useCallback(async (): Promise<boolean> => {
    setIsDeleting(true);
    try {
      await deleteProject(id);
      toast.success(tp.detail.deleteSuccess);
      return true;
    } catch (err) {
      if (!isSessionExpiredError(err)) {
        toast.error(tp.detail.deleteError);
      }
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [id, tp.detail]);

  return {
    project,
    isLoading,
    error,
    refetch: load,
    update,
    remove,
    isUpdating,
    isDeleting,
  };
}
