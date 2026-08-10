import { useState, useEffect, useCallback } from "react";
import {
  fetchProjects,
  createProject,
  type CreateProjectPayload,
  type ProjectResponse,
} from "../lib/projects/projectsApi";
import { toast } from "../lib/toast/toastBus";
import { useTranslation } from "./useTranslation";
import { isSessionExpiredError } from "../lib/apiClient";

export interface UseProjectsReturn {
  projects: ProjectResponse[];
  isLoading: boolean;
  isCreating: boolean;
  loadError: boolean;
  create: (payload: CreateProjectPayload) => Promise<ProjectResponse | null>;
}

export function useProjects(): UseProjectsReturn {
  const t = useTranslation();
  const tp = t.projects;

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((err) => {
        if (!isSessionExpiredError(err)) {
          setLoadError(true);
          toast.error(tp.loadError);
        }
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = useCallback(
    async (payload: CreateProjectPayload): Promise<ProjectResponse | null> => {
      setIsCreating(true);
      try {
        const project = await createProject(payload);
        setProjects((prev) => [project, ...prev]);
        toast.success(tp.createSuccess);
        return project;
      } catch (err) {
        if (!isSessionExpiredError(err)) {
          toast.error(tp.createError);
        }
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [tp],
  );

  return { projects, isLoading, isCreating, loadError, create };
}
