import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../../shared/hooks/useTranslation";
import { FormInput } from "../../../shared/ui/FormInput/FormInput";
import "../../../pages/admin/components/UserFormModal.css";
import "./TwoFactorDisableModal.css";

interface TwoFactorDisableModalProps {
  isDisabling: boolean;
  disableError: string | null;
  onClose: () => void;
  onConfirm: (totpCode: string) => Promise<void>;
}

export function TwoFactorDisableModal({
  isDisabling,
  disableError,
  onClose,
  onConfirm,
}: TwoFactorDisableModalProps) {
  const t = useTranslation().profile.security.disableModal;
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();

  useEffect(() => {
    if (disableError) setCodeError(disableError);
  }, [disableError]);

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
          <h2 className="modal-card__title">{t.title}</h2>
          <button
            type="button"
            className="modal-card__close"
            onClick={onClose}
            aria-label={t.cancelButton}
            disabled={isDisabling}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="tfa-setup-modal__body">
          <p className="tfa-disable-modal__desc">{t.description}</p>

          <FormInput
            id="tfa-disable-code"
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
            disabled={isDisabling}
            autoComplete="one-time-code"
            maxLength={6}
          />
        </div>

        <div className="tfa-disable-modal__footer">
          <button
            type="button"
            className="admin-btn"
            onClick={onClose}
            disabled={isDisabling}
          >
            {t.cancelButton}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => { void handleConfirm(); }}
            disabled={isDisabling}
            aria-busy={isDisabling}
          >
            {isDisabling ? t.confirming : t.confirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}
