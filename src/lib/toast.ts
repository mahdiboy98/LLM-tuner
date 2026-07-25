type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let listeners: Listener[] = [];

function notify() {
  listeners.forEach(fn => fn([...toasts]));
}

export function addToast(type: ToastType, title: string, message?: string) {
  const id = Date.now().toString() + Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, title, message }];
  notify();

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }, 4000);
}

export function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

export function subscribe(listener: Listener) {
  listeners.push(listener);
  listener([...toasts]);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

// Convenience shortcuts
export const toast = {
  success: (title: string, message?: string) => addToast('success', title, message),
  error: (title: string, message?: string) => addToast('error', title, message),
  warning: (title: string, message?: string) => addToast('warning', title, message),
  info: (title: string, message?: string) => addToast('info', title, message),
};