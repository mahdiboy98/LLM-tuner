'use client';

import { useState, useEffect } from 'react';
import { subscribe, removeToast, Toast } from '@/lib/toast';

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const colors = {
  success: 'bg-emerald-600 border-emerald-500',
  error: 'bg-red-600 border-red-500',
  warning: 'bg-amber-600 border-amber-500',
  info: 'bg-sky-600 border-sky-500',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe(setToasts);
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${colors[t.type]} border text-white px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3 animate-[slideIn_0.3s_ease-out]`}
        >
          <span className="text-lg font-bold mt-0.5">{icons[t.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{t.title}</p>
            {t.message && <p className="text-xs opacity-90 mt-0.5">{t.message}</p>}
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/70 hover:text-white text-sm ml-2"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}