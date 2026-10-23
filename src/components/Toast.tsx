import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${
            t.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-700'
              : t.type === 'info'
                ? 'bg-slate-900/95 text-white border-slate-700'
                : 'bg-emerald-950/95 text-white border-emerald-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : t.type === 'info' ? (
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <p className="text-xs font-semibold leading-snug">{t.message}</p>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
