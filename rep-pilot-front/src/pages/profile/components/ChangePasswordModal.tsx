import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../../shared/hooks/useTranslation";
import { FormInput } from "../../../shared/ui/FormInput/FormInput";
import "../../../pages/admin/components/UserFormModal.css";
import "./ChangePasswordModal.css";

interface ChangePasswordModalProps {
  isChanging: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function ChangePasswordModal({
  isChanging,
  submitError,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const t = useTranslation().profile.security.passwordModal;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
  }>({});

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isChanging) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChanging, onClose]);

  function validate(): boolean {
    const nextErrors: typeof errors = {};
    if (!currentPassword)
      nextErrors.currentPassword = t.currentPasswordRequired;
    if (!newPassword) {
      nextErrors.newPassword = t.newPasswordRequired;
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = t.newPasswordTooShort;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await onSubmit(currentPassword, newPassword);
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <div className="modal-card change-password-modal">
        <div className="modal-card__header">
          <h2 id="change-password-title" className="modal-card__title">
            {t.title}
          </h2>
          <button
            type="button"
            className="modal-card__close"
            onClick={onClose}
            aria-label={t.closeAriaLabel}
            disabled={isChanging}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form
          className="change-password-modal__form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <p className="change-password-modal__description">{t.description}</p>
          <FormInput
            id="current-password"
            label={t.currentPasswordLabel}
            type="password"
            value={currentPassword}
            onChange={(value) => {
              setCurrentPassword(value);
              if (errors.currentPassword) {
                setErrors((current) => ({
                  ...current,
                  currentPassword: undefined,
                }));
              }
            }}
            error={errors.currentPassword}
            disabled={isChanging}
            autoComplete="current-password"
          />
          <FormInput
            id="new-password"
            label={t.newPasswordLabel}
            type="password"
            value={newPassword}
            onChange={(value) => {
              setNewPassword(value);
              if (errors.newPassword || submitError) {
                setErrors((current) => ({
                  ...current,
                  newPassword: undefined,
                }));
              }
            }}
            error={errors.newPassword ?? submitError ?? undefined}
            disabled={isChanging}
            autoComplete="new-password"
          />
          <div className="change-password-modal__footer">
            <button
              type="button"
              className="admin-btn"
              onClick={onClose}
              disabled={isChanging}
            >
              {t.cancelButton}
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={isChanging}
              aria-busy={isChanging}
            >
              {isChanging ? t.submitting : t.submitButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
