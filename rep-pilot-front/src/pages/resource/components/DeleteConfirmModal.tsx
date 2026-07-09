import { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import "./DeleteConfirmModal.css";

interface DeleteConfirmModalProps {
  resourceName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  t: {
    title: string;
    message: string;
    confirmButton: string;
    confirming: string;
    cancel: string;
  };
}

export function DeleteConfirmModal({
  resourceName,
  isDeleting,
  onConfirm,
  onCancel,
  t,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, isDeleting]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div className="modal-card">
        <div className="modal-card__header">
          <h2 className="modal-card__title">{t.title}</h2>
          <button
            type="button"
            className="modal-card__close"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label={t.cancel}
          >
            <X size={18} />
          </button>
        </div>

        <div className="delete-confirm-body">
          <div className="delete-confirm-icon">
            <AlertTriangle size={36} aria-hidden="true" />
          </div>
          <p className="delete-confirm-message">
            {t.message}{" "}
            <span className="delete-confirm-resource-name">
              &ldquo;{resourceName}&rdquo;
            </span>
          </p>
        </div>

        <div className="modal-card__actions">
          <button
            type="button"
            className="edit-resource-btn edit-resource-btn--secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            {t.cancel}
          </button>
          <button
            type="button"
            className="edit-resource-btn edit-resource-btn--danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t.confirming : t.confirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}
