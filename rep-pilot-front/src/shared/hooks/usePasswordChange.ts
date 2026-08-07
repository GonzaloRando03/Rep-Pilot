import { useCallback, useState } from "react";
import { changePassword } from "../lib/auth/passwordApi";
import type { ApiError } from "../lib/apiClient";
import { toast } from "../lib/toast/toastBus";
import { useTranslation } from "./useTranslation";

interface PasswordChangeState {
  isOpen: boolean;
  isChanging: boolean;
  error: string | null;
}

export function usePasswordChange() {
  const t = useTranslation().profile.security.passwordModal;
  const [state, setState] = useState<PasswordChangeState>({
    isOpen: false,
    isChanging: false,
    error: null,
  });

  const open = useCallback(() => {
    setState({ isOpen: true, isChanging: false, error: null });
  }, []);

  const close = useCallback(() => {
    setState((current) => ({ ...current, isOpen: false, error: null }));
  }, []);

  const submit = useCallback(
    async (currentPassword: string, newPassword: string) => {
      setState((current) => ({ ...current, isChanging: true, error: null }));
      try {
        await changePassword({ currentPassword, newPassword });
        setState({ isOpen: false, isChanging: false, error: null });
        toast.success(t.successMessage);
      } catch (error) {
        const apiError = error as ApiError;
        setState((current) => ({
          ...current,
          isChanging: false,
          error:
            apiError.status === 400 || apiError.status === 401
              ? t.invalidCurrentPassword
              : t.submitError,
        }));
      }
    },
    [t.invalidCurrentPassword, t.submitError, t.successMessage],
  );

  return { ...state, open, close, submit };
}
