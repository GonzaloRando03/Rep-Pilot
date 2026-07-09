import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "../../../shared/hooks/useTranslation";
import { FormInput } from "../../../shared/ui/FormInput/FormInput";
import "../../../pages/admin/components/UserFormModal.css";
import "./TwoFactorSetupModal.css";

interface TwoFactorSetupModalProps {
  qrUri: string;
  isConfirming: boolean;
  confirmError: string | null;
  onClose: () => void;
  onConfirm: (totpCode: string) => Promise<void>;
}

export function TwoFactorSetupModal({
  qrUri,
  isConfirming,
  confirmError,
  onClose,
  onConfirm,
}: TwoFactorSetupModalProps) {
  const t = useTranslation().profile.security.setupModal;
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();

  useEffect(() => {
    if (confirmError) setCodeError(confirmError);
  }, [confirmError]);

  function handleBack() {
    setStep(1);
    setCode("");
    setCodeError(undefined);
  }

  function validateCode(): boolean {
    if (!code) {
      setCodeError(t.codeRequired);
      return false;
    }
    if (!/^\d{6}$/.test(code)) {
      setCodeError(t.codeInvalid);
      return false;
    }
    return true;
  }

  async function handleConfirm() {
    if (!validateCode()) return;
    await onConfirm(code);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={t.title}>
      <div className="modal-card">
        <div className="modal-card__header">
          <div>
            <p className="tfa-setup-modal__step-label">{t.step(step, 2)}</p>
            <h2 className="tfa-setup-modal__step-title">
              {step === 1 ? t.step1Title : t.step2Title}
            </h2>
          </div>
          <button
            type="button"
            className="modal-card__close"
            onClick={onClose}
            aria-label={t.cancelButton}
            disabled={isConfirming}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="tfa-setup-modal__body">
          {step === 1 && (
            <>
              <p className="tfa-setup-modal__desc">{t.step1Desc}</p>
              <div className="tfa-setup-modal__qr-wrapper">
                <QRCodeSVG value={qrUri} size={200} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="tfa-setup-modal__desc">{t.step2Desc}</p>
              <FormInput
                id="tfa-confirm-code"
                label={t.codeLabel}
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(v) => {
                  setCode(v);
                  if (codeError) setCodeError(undefined);
                }}
                placeholder={t.codePlaceholder}
                error={codeError}
                disabled={isConfirming}
                autoComplete="one-time-code"
                maxLength={6}
              />
            </>
          )}
        </div>

        <div className="tfa-setup-modal__footer">
          {step === 1 && (
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => setStep(2)}
            >
              {t.continueButton}
            </button>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => { void handleConfirm(); }}
                disabled={isConfirming}
                aria-busy={isConfirming}
              >
                {isConfirming ? t.confirming : t.confirmButton}
              </button>

              <button
                type="button"
                className="tfa-setup-modal__back"
                onClick={handleBack}
                disabled={isConfirming}
              >
                {t.backButton}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
