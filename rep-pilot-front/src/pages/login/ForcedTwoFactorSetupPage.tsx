import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "../../shared/hooks/useTranslation";
import { FormInput } from "../../shared/ui/FormInput/FormInput";
import { setup2FA, confirm2FA } from "../../shared/lib/auth/twoFactorApi";
import { userStorage } from "../../shared/lib/auth/userStorage";
import "./ForcedTwoFactorSetupPage.css";

interface ForcedTwoFactorSetupPageProps {
  onComplete: () => void;
  onLogout: () => void;
}

type PageStep = "loading" | "qr" | "confirm" | "load-error";

export function ForcedTwoFactorSetupPage({
  onComplete,
  onLogout,
}: ForcedTwoFactorSetupPageProps) {
  const t = useTranslation();
  const tForced = t.auth.forcedSetup;
  const tSetup = t.profile.security.setupModal;

  const [step, setStep] = useState<PageStep>("loading");
  const [qrUri, setQrUri] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    setup2FA()
      .then(({ qrUri: uri }) => {
        setQrUri(uri);
        setStep("qr");
      })
      .catch(() => setStep("load-error"));
  }, []);

  function validateCode(): boolean {
    if (!code) {
      setCodeError(tSetup.codeRequired);
      return false;
    }
    if (!/^\d{6}$/.test(code)) {
      setCodeError(tSetup.codeInvalid);
      return false;
    }
    return true;
  }

  async function handleConfirm() {
    if (!validateCode()) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      await confirm2FA(code);
      const user = userStorage.get();
      if (user) userStorage.set({ ...user, twoFactorEnabled: true });
      onComplete();
    } catch (err) {
      const apiErr = err as { status?: number };
      setConfirmError(
        apiErr.status === 401 ? tSetup.invalidCode : tSetup.loadError,
      );
      setIsConfirming(false);
    }
  }

  const currentVisualStep = step === "confirm" ? 2 : 1;

  return (
    <main className="forced-2fa-page" aria-label={tForced.title}>
      <div className="forced-2fa-page__card">
        <header className="forced-2fa-page__header">
          <h1 className="forced-2fa-page__title">Rep - Pilot</h1>
          <p className="forced-2fa-page__subtitle">{tForced.subtitle}</p>
        </header>

        {(step === "qr" || step === "confirm") && (
          <>
            <p className="forced-2fa-page__step-label">
              {tSetup.step(currentVisualStep, 2)}
            </p>
            <p className="forced-2fa-page__step-title">
              {step === "qr" ? tSetup.step1Title : tSetup.step2Title}
            </p>
          </>
        )}

        <div className="forced-2fa-page__body">
          {step === "loading" && (
            <div className="forced-2fa-page__loading" aria-label={t.common.loading}>
              <span className="forced-2fa-page__spinner" />
            </div>
          )}

          {step === "load-error" && (
            <p className="forced-2fa-page__error" role="alert">
              {tSetup.loadError}
            </p>
          )}

          {step === "qr" && (
            <>
              <p className="forced-2fa-page__desc">{tSetup.step1Desc}</p>
              <div className="forced-2fa-page__qr-wrapper">
                <QRCodeSVG value={qrUri} size={200} />
              </div>
            </>
          )}

          {step === "confirm" && (
            <>
              <p className="forced-2fa-page__desc">{tSetup.step2Desc}</p>
              <FormInput
                id="forced-2fa-code"
                label={tSetup.codeLabel}
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(v) => {
                  setCode(v);
                  if (codeError) setCodeError(undefined);
                  if (confirmError) setConfirmError(null);
                }}
                placeholder={tSetup.codePlaceholder}
                error={codeError ?? confirmError ?? undefined}
                disabled={isConfirming}
                autoComplete="one-time-code"
                maxLength={6}
              />
            </>
          )}
        </div>

        <div className="forced-2fa-page__footer">
          {step === "qr" && (
            <button
              type="button"
              className="forced-2fa-page__submit"
              onClick={() => setStep("confirm")}
            >
              {tSetup.continueButton}
            </button>
          )}

          {step === "confirm" && (
            <>
              <button
                type="button"
                className="forced-2fa-page__submit"
                onClick={() => { void handleConfirm(); }}
                disabled={isConfirming}
                aria-busy={isConfirming}
              >
                {isConfirming ? (
                  <span className="forced-2fa-page__btn-spinner" aria-hidden="true" />
                ) : null}
                {isConfirming ? tSetup.confirming : tSetup.confirmButton}
              </button>

              <button
                type="button"
                className="forced-2fa-page__back"
                onClick={() => { setStep("qr"); setCode(""); setCodeError(undefined); setConfirmError(null); }}
                disabled={isConfirming}
              >
                {tSetup.backButton}
              </button>
            </>
          )}

          {step === "load-error" && (
            <button
              type="button"
              className="forced-2fa-page__submit"
              onClick={() => {
                setStep("loading");
                setup2FA()
                  .then(({ qrUri: uri }) => { setQrUri(uri); setStep("qr"); })
                  .catch(() => setStep("load-error"));
              }}
            >
              {tSetup.continueButton}
            </button>
          )}

          <button
            type="button"
            className="forced-2fa-page__logout"
            onClick={onLogout}
          >
            {tForced.logoutButton}
          </button>
        </div>
      </div>
    </main>
  );
}
