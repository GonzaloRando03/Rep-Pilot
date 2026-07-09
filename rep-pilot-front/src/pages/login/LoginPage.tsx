import { useState, type FormEvent } from "react";
import { FormInput } from "../../shared/ui/FormInput/FormInput";
import { useTranslation } from "../../shared/hooks/useTranslation";
import "./LoginPage.css";

interface LoginPageProps {
  onLogin: (
    username: string,
    password: string,
    totpCode?: string,
  ) => Promise<void>;
  isLoading: boolean;
  requiresTwoFactor: boolean;
  onBackFromTwoFactor: () => void;
}

export function LoginPage({
  onLogin,
  isLoading,
  requiresTwoFactor,
  onBackFromTwoFactor,
}: LoginPageProps) {
  const t = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
    totpCode?: string;
  }>({});

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!username.trim()) errors.username = t.auth.login.usernameRequired;
    if (!password) errors.password = t.auth.login.passwordRequired;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateTotp(): boolean {
    const errors: typeof fieldErrors = {};
    if (!totpCode) {
      errors.totpCode = t.auth.twoFactor.codeRequired;
    } else if (!/^\d{6}$/.test(totpCode)) {
      errors.totpCode = t.auth.twoFactor.codeInvalid;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (requiresTwoFactor) {
      if (!validateTotp()) return;
      await onLogin(username.trim(), password, totpCode);
    } else {
      if (!validate()) return;
      await onLogin(username.trim(), password);
    }
  }

  function handleBack() {
    setTotpCode("");
    setFieldErrors({});
    onBackFromTwoFactor();
  }

  if (requiresTwoFactor) {
    return (
      <main className="login-page" aria-label={t.auth.twoFactor.title}>
        <div className="login-page__card">
          <header className="login-page__header">
            <h1 className="login-page__title">Rep - Pilot</h1>
            <p className="login-page__subtitle">{t.auth.twoFactor.title}</p>
          </header>

          <form
            className="login-page__form"
            onSubmit={handleSubmit}
            noValidate
            aria-label={t.auth.twoFactor.title}
          >
            <p className="login-page__2fa-desc">{t.auth.twoFactor.description}</p>

            <FormInput
              id="login-totp"
              label={t.auth.twoFactor.codeLabel}
              type="text"
              inputMode="numeric"
              value={totpCode}
              onChange={(v) => {
                setTotpCode(v);
                if (fieldErrors.totpCode)
                  setFieldErrors((e) => ({ ...e, totpCode: undefined }));
              }}
              placeholder={t.auth.twoFactor.codePlaceholder}
              error={fieldErrors.totpCode}
              disabled={isLoading}
              autoComplete="one-time-code"
              maxLength={6}
            />

            <button
              type="submit"
              className="login-page__submit"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="login-page__spinner" aria-hidden="true" />
              ) : null}
              {isLoading ? t.auth.twoFactor.submitting : t.auth.twoFactor.submitButton}
            </button>

            <button
              type="button"
              className="login-page__back"
              onClick={handleBack}
              disabled={isLoading}
            >
              {t.auth.twoFactor.backButton}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page" aria-label={t.auth.login.ariaLabel}>
      <div className="login-page__card">
        <header className="login-page__header">
          <h1 className="login-page__title">Rep - Pilot</h1>
          <p className="login-page__subtitle">{t.auth.login.subtitle}</p>
        </header>

        <form
          className="login-page__form"
          onSubmit={handleSubmit}
          noValidate
          aria-label={t.auth.login.formAriaLabel}
        >
          <FormInput
            id="login-username"
            label={t.auth.login.usernameLabel}
            type="text"
            value={username}
            onChange={(v) => {
              setUsername(v);
              if (fieldErrors.username)
                setFieldErrors((e) => ({ ...e, username: undefined }));
            }}
            placeholder={t.auth.login.usernamePlaceholder}
            error={fieldErrors.username}
            disabled={isLoading}
            autoComplete="username"
          />

          <FormInput
            id="login-password"
            label={t.auth.login.passwordLabel}
            type="password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (fieldErrors.password)
                setFieldErrors((e) => ({ ...e, password: undefined }));
            }}
            placeholder={t.auth.login.passwordPlaceholder}
            error={fieldErrors.password}
            disabled={isLoading}
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="login-page__submit"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="login-page__spinner" aria-hidden="true" />
            ) : null}
            {isLoading ? t.auth.login.submitting : t.auth.login.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
