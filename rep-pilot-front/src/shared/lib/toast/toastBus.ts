export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastPayload {
  id: string;
  variant: ToastVariant;
  message: string;
  duration: number;
}

type Subscriber = (payload: ToastPayload) => void;

const DURATIONS: Record<ToastVariant, number> = {
  success: 3500,
  info: 4000,
  warning: 5000,
  error: 6000,
};

let counter = 0;
const subscribers = new Set<Subscriber>();

const toastBus = {
  emit(variant: ToastVariant, message: string, duration?: number): void {
    const payload: ToastPayload = {
      id: `toast-${++counter}-${Date.now()}`,
      variant,
      message,
      duration: duration ?? DURATIONS[variant],
    };
    subscribers.forEach((fn) => fn(payload));
  },

  subscribe(fn: Subscriber): () => void {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};

export const toast = {
  success: (message: string) => toastBus.emit("success", message),
  error: (message: string) => toastBus.emit("error", message),
  warning: (message: string) => toastBus.emit("warning", message),
  info: (message: string) => toastBus.emit("info", message),
};

export { toastBus };
