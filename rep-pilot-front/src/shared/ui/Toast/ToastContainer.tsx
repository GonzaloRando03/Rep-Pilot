import { useEffect, useState } from "react";
import { toastBus } from "../../lib/toast/toastBus";
import type { ToastPayload } from "../../lib/toast/toastBus";
import { ToastItem } from "./ToastItem";
import { useTranslation } from "../../hooks/useTranslation";
import "./ToastContainer.css";

export function ToastContainer() {
  const { toast: tToast } = useTranslation();
  const [toasts, setToasts] = useState<ToastPayload[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  useEffect(() => {
    return toastBus.subscribe((payload) => {
      setToasts((prev) => [...prev, payload]);

      setTimeout(() => {
        dismiss(payload.id);
      }, payload.duration);
    });
  }, []);

  function dismiss(id: string) {
    setExiting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 220); // matches --duration-slow
  }

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label={tToast.containerAriaLabel}>
      <ul className="toast-container__list" role="list">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            {...t}
            onDismiss={dismiss}
            className={exiting.has(t.id) ? "toast-item--exiting" : undefined}
          />
        ))}
      </ul>
    </div>
  );
}
