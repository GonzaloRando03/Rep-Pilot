import { useState, useCallback } from "react";
import { setup2FA, confirm2FA, disable2FA } from "../lib/auth/twoFactorApi";
import { userStorage } from "../lib/auth/userStorage";
import { toast } from "../lib/toast/toastBus";
import { useTranslation } from "./useTranslation";
import type { ApiError } from "../lib/apiClient";
import { isSessionExpiredError } from "../lib/apiClient";

interface TwoFactorState {
  twoFactorEnabled: boolean;
  setupOpen: boolean;
  setupQrUri: string;
  setupIsLoading: boolean;
  isConfirming: boolean;
  setupError: string | null;
  disableOpen: boolean;
  isDisabling: boolean;
  disableError: string | null;
}

export interface UseTwoFactorReturn {
  twoFactorEnabled: boolean;
  setupOpen: boolean;
  setupQrUri: string;
  setupIsLoading: boolean;
  isConfirming: boolean;
  setupError: string | null;
  disableOpen: boolean;
  isDisabling: boolean;
  disableError: string | null;
  openSetup: () => Promise<void>;
  closeSetup: () => void;
  confirmSetup: (totpCode: string) => Promise<void>;
  openDisable: () => void;
  closeDisable: () => void;
  confirmDisable: (totpCode: string) => Promise<void>;
}

export function useTwoFactor(): UseTwoFactorReturn {
  const t = useTranslation().profile.security;

  const [state, setState] = useState<TwoFactorState>({
    twoFactorEnabled: userStorage.get()?.twoFactorEnabled ?? false,
    setupOpen: false,
    setupQrUri: "",
    setupIsLoading: false,
    isConfirming: false,
    setupError: null,
    disableOpen: false,
    isDisabling: false,
    disableError: null,
  });

  const openSetup = useCallback(async () => {
    setState((s) => ({ ...s, setupIsLoading: true, setupError: null }));
    try {
      const { qrUri } = await setup2FA();
      setState((s) => ({
        ...s,
        setupOpen: true,
        setupIsLoading: false,
        setupQrUri: qrUri,
      }));
    } catch (err) {
      setState((s) => ({ ...s, setupIsLoading: false }));
      if (!isSessionExpiredError(err)) {
        toast.error(t.setupModal.loadError);
      }
    }
  }, [t.setupModal.loadError]);

  const closeSetup = useCallback(() => {
    setState((s) => ({
      ...s,
      setupOpen: false,
      setupQrUri: "",
      setupError: null,
    }));
  }, []);

  const confirmSetup = useCallback(
    async (totpCode: string) => {
      setState((s) => ({ ...s, isConfirming: true, setupError: null }));
      try {
        await confirm2FA(totpCode);
        const user = userStorage.get();
        if (user) userStorage.set({ ...user, twoFactorEnabled: true });
        setState((s) => ({
          ...s,
          isConfirming: false,
          setupOpen: false,
          setupQrUri: "",
          twoFactorEnabled: true,
        }));
        toast.success(t.setupModal.successMessage);
      } catch (err) {
        const apiErr = err as ApiError;
        const error =
          apiErr.status === 401
            ? t.setupModal.invalidCode
            : t.setupModal.loadError;
        setState((s) => ({ ...s, isConfirming: false, setupError: error }));
      }
    },
    [
      t.setupModal.successMessage,
      t.setupModal.invalidCode,
      t.setupModal.loadError,
    ],
  );

  const openDisable = useCallback(() => {
    setState((s) => ({ ...s, disableOpen: true, disableError: null }));
  }, []);

  const closeDisable = useCallback(() => {
    setState((s) => ({ ...s, disableOpen: false, disableError: null }));
  }, []);

  const confirmDisable = useCallback(
    async (totpCode: string) => {
      setState((s) => ({ ...s, isDisabling: true, disableError: null }));
      try {
        await disable2FA(totpCode);
        const user = userStorage.get();
        if (user) userStorage.set({ ...user, twoFactorEnabled: false });
        setState((s) => ({
          ...s,
          isDisabling: false,
          disableOpen: false,
          twoFactorEnabled: false,
        }));
        toast.success(t.disableModal.successMessage);
      } catch (err) {
        const apiErr = err as ApiError;
        const error =
          apiErr.status === 401
            ? t.disableModal.invalidCode
            : t.disableModal.loadError;
        setState((s) => ({ ...s, isDisabling: false, disableError: error }));
      }
    },
    [
      t.disableModal.successMessage,
      t.disableModal.invalidCode,
      t.disableModal.loadError,
    ],
  );

  return {
    ...state,
    openSetup,
    closeSetup,
    confirmSetup,
    openDisable,
    closeDisable,
    confirmDisable,
  };
}
