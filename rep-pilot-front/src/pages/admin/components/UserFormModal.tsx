import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { UserDTO } from "../../../shared/lib/users/usersApi";
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from "../../../shared/lib/users/usersApi";
import { Language } from "../../../shared/lib/language/Language";
import "./UserFormModal.css";

interface ModalTranslations {
  createTitle: string;
  editTitle: string;
  fields: {
    name: string;
    username: string;
    email: string;
    password: string;
    isAdmin: string;
    language: string;
  };
  placeholders: {
    name: string;
    username: string;
    email: string;
    password: string;
    passwordEdit: string;
  };
  saveButton: string;
  saving: string;
  cancelButton: string;
  required: string;
}

interface UserFormModalProps {
  user: UserDTO | null;
  isSaving: boolean;
  onSave: (
    data: CreateUserPayload | UpdateUserPayload,
    userId?: string,
  ) => Promise<boolean>;
  onClose: () => void;
  t: ModalTranslations;
}

interface FormState {
  name: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  language: string;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}

export function UserFormModal({
  user,
  isSaving,
  onSave,
  onClose,
  t,
}: UserFormModalProps) {
  const isEdit = user !== null;
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    password: "",
    isAdmin: user?.isAdmin ?? false,
    language: user?.language ?? Language.En,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = t.required;
    if (!form.username.trim()) next.username = t.required;
    if (!isEdit && !form.email.trim()) next.email = t.required;
    if (!isEdit && !form.password.trim()) next.password = t.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      const payload: UpdateUserPayload = {
        name: form.name,
        username: form.username,
        email: form.email,
        isAdmin: form.isAdmin,
        language: form.language as Language,
      };
      if (form.password.trim()) payload.password = form.password;
      const ok = await onSave(payload, user.id);
      if (ok) onClose();
    } else {
      const payload: CreateUserPayload = {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        isAdmin: form.isAdmin,
        language: form.language as Language,
      };
      const ok = await onSave(payload);
      if (ok) onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? t.editTitle : t.createTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-card__header">
          <h2 className="modal-card__title">
            {isEdit ? t.editTitle : t.createTitle}
          </h2>
          <button
            type="button"
            className="modal-card__close"
            onClick={onClose}
            aria-label={t.cancelButton}
          >
            <X size={18} />
          </button>
        </div>

        <form className="modal-card__form" onSubmit={handleSubmit} noValidate>
          <div className="modal-field">
            <label className="modal-label" htmlFor="user-name">
              {t.fields.name}
            </label>
            <input
              ref={firstFieldRef}
              id="user-name"
              className={`modal-input${errors.name ? " modal-input--error" : ""}`}
              type="text"
              value={form.name}
              placeholder={t.placeholders.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
            {errors.name && <span className="modal-error">{errors.name}</span>}
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="user-username">
              {t.fields.username}
            </label>
            <input
              id="user-username"
              className={`modal-input${errors.username ? " modal-input--error" : ""}`}
              type="text"
              value={form.username}
              placeholder={t.placeholders.username}
              onChange={(e) =>
                setForm((s) => ({ ...s, username: e.target.value }))
              }
            />
            {errors.username && (
              <span className="modal-error">{errors.username}</span>
            )}
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="user-email">
              {t.fields.email}
            </label>
            <input
              id="user-email"
              className={`modal-input${errors.email ? " modal-input--error" : ""}`}
              type="email"
              value={form.email}
              placeholder={t.placeholders.email}
              onChange={(e) =>
                setForm((s) => ({ ...s, email: e.target.value }))
              }
            />
            {errors.email && (
              <span className="modal-error">{errors.email}</span>
            )}
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="user-password">
              {t.fields.password}
            </label>
            <input
              id="user-password"
              className={`modal-input${errors.password ? " modal-input--error" : ""}`}
              type="password"
              value={form.password}
              placeholder={
                isEdit ? t.placeholders.passwordEdit : t.placeholders.password
              }
              autoComplete="new-password"
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
            />
            {errors.password && (
              <span className="modal-error">{errors.password}</span>
            )}
          </div>

          <div className="modal-field modal-field--checkbox">
            <label className="modal-checkbox-label" htmlFor="user-isAdmin">
              <input
                id="user-isAdmin"
                type="checkbox"
                className="modal-checkbox"
                checked={form.isAdmin}
                onChange={(e) =>
                  setForm((s) => ({ ...s, isAdmin: e.target.checked }))
                }
              />
              {t.fields.isAdmin}
            </label>
          </div>

          <div className="modal-card__actions">
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              {t.cancelButton}
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={isSaving}
              aria-busy={isSaving}
            >
              {isSaving ? (
                <span
                  className="git-section__spinner"
                  style={{ width: 14, height: 14, borderWidth: 2 }}
                  aria-hidden="true"
                />
              ) : null}
              {isSaving ? t.saving : t.saveButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
