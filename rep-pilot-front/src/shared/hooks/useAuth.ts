import { useEffect, useState } from "react";
import { tokenStorage } from "../lib/auth/tokenStorage";
import { userStorage } from "../lib/auth/userStorage";
import { loginRequest } from "../lib/auth/authApi";
import { fetchCurrentUser, updateUserLanguage } from "../lib/auth/userApi";
import { fetchConfig } from "../lib/config/configApi";
import { toast } from "../lib/toast/toastBus";
import {
  setOnUnauthorized,
  clearOnUnauthorized,
  resetSessionExpired,
  type ApiError,
} from "../lib/apiClient";
import type { User } from "../lib/auth/userStorage";
import type { Language } from "../lib/language/Language";
import { Language as LanguageEnum } from "../lib/language/Language";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { useTranslation } from "./useTranslation";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  requiresTwoFactor: boolean;
  requiresTwoFactorSetup: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (
    username: string,
    password: string,
    totpCode?: string,
  ) => Promise<void>;
  logout: () => void;
  updateLanguage: (language: Language) => Promise<void>;
  clearTwoFactor: () => void;
  completeForcedSetup: () => void;
}

export function useAuth(): UseAuthReturn {
  const { setLanguage } = useLanguage();
  const t = useTranslation();

  const [state, setState] = useState<AuthState>({
    isAuthenticated: tokenStorage.exists(),
    isLoading: false,
    user: userStorage.get(),
    requiresTwoFactor: false,
    requiresTwoFactorSetup: false,
  });

  useEffect(() => {
    setOnUnauthorized(() => {
      tokenStorage.clear();
      userStorage.clear();
      setLanguage(LanguageEnum.En);
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        requiresTwoFactor: false,
        requiresTwoFactorSetup: false,
      });
      toast.warning(t.auth.toast.sessionExpired);
    });
    return () => clearOnUnauthorized();
  }, [setLanguage, t.auth.toast.sessionExpired]);

  async function login(
    username: string,
    password: string,
    totpCode?: string,
  ): Promise<void> {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const { token } = await loginRequest({ username, password, totpCode });
      tokenStorage.set(token);
      resetSessionExpired();

      const user = await fetchCurrentUser();
      userStorage.set(user);
      setLanguage(user.language);

      // If the user doesn't have 2FA configured, check if it's globally enforced
      let forcedSetupRequired = false;
      if (!user.twoFactorEnabled) {
        try {
          const config = await fetchConfig();
          forcedSetupRequired = config.enableTwoFactor === true;
        } catch {
          // If config fetch fails, don't block the user
          forcedSetupRequired = false;
        }
      }

      if (forcedSetupRequired) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user,
          requiresTwoFactor: false,
          requiresTwoFactorSetup: true,
        });
      } else {
        setState({
          isAuthenticated: true,
          isLoading: false,
          user,
          requiresTwoFactor: false,
          requiresTwoFactorSetup: false,
        });
        toast.success(t.auth.toast.welcome(user.name));
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401 && apiError.requiresTwoFactor) {
        setState((s) => ({ ...s, isLoading: false, requiresTwoFactor: true }));
      } else if (apiError.status === 401 && totpCode !== undefined) {
        toast.error(t.auth.toast.invalidTwoFactorCode);
        setState((s) => ({ ...s, isLoading: false }));
      } else {
        const message =
          apiError.status === 401
            ? t.auth.toast.invalidCredentials
            : t.auth.toast.serverError;
        toast.error(message);
        tokenStorage.clear();
        userStorage.clear();
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          requiresTwoFactor: false,
          requiresTwoFactorSetup: false,
        });
      }
    }
  }

  function clearTwoFactor(): void {
    setState((s) => ({ ...s, requiresTwoFactor: false }));
  }

  function completeForcedSetup(): void {
    const user = userStorage.get();
    setState((s) => ({
      ...s,
      isAuthenticated: true,
      requiresTwoFactorSetup: false,
    }));
    if (user) toast.success(t.auth.toast.welcome(user.name));
  }

  function logout(): void {
    tokenStorage.clear();
    userStorage.clear();
    setLanguage(LanguageEnum.En);
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      requiresTwoFactor: false,
      requiresTwoFactorSetup: false,
    });
    toast.info(t.auth.toast.loggedOut);
  }

  async function updateLanguage(language: Language): Promise<void> {
    if (!state.user) return;
    const previous = state.user;
    const updated = { ...state.user, language };
    userStorage.set(updated);
    setLanguage(language);
    setState((s) => ({ ...s, user: updated }));
    try {
      await updateUserLanguage(language);
    } catch {
      userStorage.set(previous);
      setLanguage(previous.language);
      setState((s) => ({ ...s, user: previous }));
      toast.error(t.auth.toast.languageSaveError);
    }
  }

  return {
    ...state,
    login,
    logout,
    updateLanguage,
    clearTwoFactor,
    completeForcedSetup,
  };
}
