import { useState, useEffect, useCallback } from "react";
import {
  fetchConfig,
  saveConfig,
  type GitInstance,
  type AppConfig,
} from "../lib/config/configApi";
import { toast } from "../lib/toast/toastBus";
import { useTranslation } from "./useTranslation";
import type { ApiError } from "../lib/apiClient";

interface OpenAIConfig {
  url: string;
  token: string;
  model: string;
}

interface ConfigState {
  gitInstances: GitInstance[];
  openaiConfig: OpenAIConfig;
  enableTwoFactor: boolean;
  isLoading: boolean;
  isSavingGit: boolean;
  isSavingOpenAI: boolean;
  isSavingTwoFactor: boolean;
  hasLoadError: boolean;
}

export interface UseConfigReturn extends ConfigState {
  addInstance: () => void;
  removeInstance: (id: string) => void;
  updateInstance: (id: string, field: keyof GitInstance, value: string) => void;
  saveGit: () => Promise<void>;
  updateOpenAI: (field: keyof OpenAIConfig, value: string) => void;
  saveOpenAI: () => Promise<void>;
  updateTwoFactor: (value: boolean) => void;
  saveTwoFactor: () => Promise<void>;
}

export function useConfig(): UseConfigReturn {
  const t = useTranslation();
  const ta = t.admin.gitInstances;
  const toai = t.admin.openaiConfig;
  const t2fa = t.admin.twoFactorConfig;

  const [state, setState] = useState<ConfigState>({
    gitInstances: [],
    openaiConfig: { url: "", token: "", model: "" },
    enableTwoFactor: false,
    isLoading: true,
    isSavingGit: false,
    isSavingOpenAI: false,
    isSavingTwoFactor: false,
    hasLoadError: false,
  });

  useEffect(() => {
    fetchConfig()
      .then((config: AppConfig) => {
        setState((s) => ({
          ...s,
          gitInstances: config.gitInstances ?? [],
          openaiConfig: config.openaiConfig ?? {
            url: "",
            token: "",
            model: "",
          },
          enableTwoFactor: config.enableTwoFactor ?? false,
          isLoading: false,
        }));
      })
      .catch((err: ApiError) => {
        if (err.status === 404) {
          setState((s) => ({ ...s, isLoading: false }));
        } else {
          setState((s) => ({ ...s, isLoading: false, hasLoadError: true }));
          toast.error(ta.loadError);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addInstance = useCallback(() => {
    setState((s) => ({
      ...s,
      gitInstances: [
        ...s.gitInstances,
        { id: crypto.randomUUID(), url: "", username: "", token: "" },
      ],
    }));
  }, []);

  const removeInstance = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      gitInstances: s.gitInstances.filter((gi) => gi.id !== id),
    }));
  }, []);

  const updateInstance = useCallback(
    (id: string, field: keyof GitInstance, value: string) => {
      setState((s) => ({
        ...s,
        gitInstances: s.gitInstances.map((gi) =>
          gi.id === id ? { ...gi, [field]: value } : gi,
        ),
      }));
    },
    [],
  );

  const saveGit = useCallback(async () => {
    const instances = state.gitInstances;
    setState((s) => ({ ...s, isSavingGit: true }));
    try {
      const updated = await saveConfig({ gitInstances: instances });
      setState((s) => ({
        ...s,
        gitInstances: updated.gitInstances ?? [],
        isSavingGit: false,
      }));
      toast.success(ta.saveSuccess);
    } catch {
      setState((s) => ({ ...s, isSavingGit: false }));
      toast.error(ta.saveError);
    }
  }, [state.gitInstances, ta.saveSuccess, ta.saveError]);

  const updateOpenAI = useCallback(
    (field: keyof OpenAIConfig, value: string) => {
      setState((s) => ({
        ...s,
        openaiConfig: { ...s.openaiConfig, [field]: value },
      }));
    },
    [],
  );

  const saveOpenAI = useCallback(async () => {
    const cfg = state.openaiConfig;
    setState((s) => ({ ...s, isSavingOpenAI: true }));
    try {
      const updated = await saveConfig({ openaiConfig: cfg });
      setState((s) => ({
        ...s,
        openaiConfig: updated.openaiConfig ?? { url: "", token: "", model: "" },
        isSavingOpenAI: false,
      }));
      toast.success(toai.saveSuccess);
    } catch {
      setState((s) => ({ ...s, isSavingOpenAI: false }));
      toast.error(toai.saveError);
    }
  }, [state.openaiConfig, toai.saveSuccess, toai.saveError]);

  const updateTwoFactor = useCallback((value: boolean) => {
    setState((s) => ({ ...s, enableTwoFactor: value }));
  }, []);

  const saveTwoFactor = useCallback(async () => {
    const value = state.enableTwoFactor;
    setState((s) => ({ ...s, isSavingTwoFactor: true }));
    try {
      const updated = await saveConfig({ enableTwoFactor: value });
      setState((s) => ({
        ...s,
        enableTwoFactor: updated.enableTwoFactor ?? false,
        isSavingTwoFactor: false,
      }));
      toast.success(t2fa.saveSuccess);
    } catch {
      setState((s) => ({ ...s, isSavingTwoFactor: false }));
      toast.error(t2fa.saveError);
    }
  }, [state.enableTwoFactor, t2fa.saveSuccess, t2fa.saveError]);

  return {
    ...state,
    addInstance,
    removeInstance,
    updateInstance,
    saveGit,
    updateOpenAI,
    saveOpenAI,
    updateTwoFactor,
    saveTwoFactor,
  };
}
