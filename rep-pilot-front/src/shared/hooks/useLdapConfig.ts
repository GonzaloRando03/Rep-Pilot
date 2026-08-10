import { useState, useEffect, useCallback } from "react";
import {
  fetchLdapConfig,
  saveLdapConfig,
  type LdapConfig,
} from "../lib/config/ldapApi";
import { toast } from "../lib/toast/toastBus";
import { useTranslation } from "./useTranslation";
import { isSessionExpiredError } from "../lib/apiClient";

interface LdapConfigState {
  config: LdapConfig;
  isLoading: boolean;
  isSaving: boolean;
  errors: { url?: string; bindDn?: string };
}

export interface UseLdapConfigReturn extends LdapConfigState {
  update: (field: keyof LdapConfig, value: string) => void;
  save: () => Promise<void>;
}

export function useLdapConfig(): UseLdapConfigReturn {
  const t = useTranslation();
  const tl = t.admin.ldapConfig;

  const [state, setState] = useState<LdapConfigState>({
    config: { url: "", bindDn: "" },
    isLoading: true,
    isSaving: false,
    errors: {},
  });

  useEffect(() => {
    fetchLdapConfig()
      .then((config) => {
        setState((s) => ({ ...s, config, isLoading: false }));
      })
      .catch(() => {
        setState((s) => ({ ...s, isLoading: false }));
      });
  }, []);

  const update = useCallback((field: keyof LdapConfig, value: string) => {
    setState((s) => ({
      ...s,
      config: { ...s.config, [field]: value },
      errors: { ...s.errors, [field]: undefined },
    }));
  }, []);

  const validate = (config: LdapConfig): { url?: string; bindDn?: string } => {
    const errors: { url?: string; bindDn?: string } = {};
    if (!config.url.trim()) errors.url = tl.required;
    if (!config.bindDn.trim()) errors.bindDn = tl.required;
    return errors;
  };

  const save = useCallback(async () => {
    const errors = validate(state.config);
    if (Object.keys(errors).length > 0) {
      setState((s) => ({ ...s, errors }));
      return;
    }

    setState((s) => ({ ...s, isSaving: true }));
    try {
      const updated = await saveLdapConfig(state.config);
      setState((s) => ({ ...s, config: updated, isSaving: false, errors: {} }));
      toast.success(tl.saveSuccess);
    } catch (err) {
      setState((s) => ({ ...s, isSaving: false }));
      if (!isSessionExpiredError(err)) {
        toast.error(tl.saveError);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.config, tl.saveSuccess, tl.saveError, tl.required]);

  return { ...state, update, save };
}
