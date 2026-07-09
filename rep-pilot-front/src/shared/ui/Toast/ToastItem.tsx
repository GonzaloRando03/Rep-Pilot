import { CheckCircle, Info, TriangleAlert, XCircle, X } from "lucide-react";
import type { ToastVariant } from "../../lib/toast/toastBus";
import { useTranslation } from "../../hooks/useTranslation";
import "./ToastItem.css";

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle size={16} strokeWidth={2} aria-hidden />,
  error: <XCircle size={16} strokeWidth={2} aria-hidden />,
  warning: <TriangleAlert size={16} strokeWidth={2} aria-hidden />,
  info: <Info size={16} strokeWidth={2} aria-hidden />,
};

interface ToastItemProps {
  id: string;
  variant: ToastVariant;
  message: string;
  duration: number;
  onDismiss: (id: string) => void;
  className?: string;
}

export function ToastItem({
  id,
  variant,
  message,
  duration,
  onDismiss,
  className,
}: ToastItemProps) {
  const { toast: tToast } = useTranslation();
  return (
    <li
      className={`toast-item toast-item--${variant}${className ? ` ${className}` : ""}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className="toast-item__icon">{ICONS[variant]}</span>
      <div className="toast-item__body">
        <span className="toast-item__label">{tToast.labels[variant]}</span>
        <span className="toast-item__message">{message}</span>
      </div>
      <button
        type="button"
        className="toast-item__close"
        aria-label={tToast.closeAriaLabel}
        onClick={() => onDismiss(id)}
      >
        <X size={14} strokeWidth={2} aria-hidden />
      </button>
      <span
        className="toast-item__progress"
        style={{ animationDuration: `${duration}ms` }}
        aria-hidden
      />
    </li>
  );
}
