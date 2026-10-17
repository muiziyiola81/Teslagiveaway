import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { notification, clearNotification } = useApp();

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 max-w-md w-auto sm:w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-start justify-between gap-3 p-4 rounded-lg border backdrop-blur-md shadow-2xl ${
          isSuccess
            ? 'bg-zinc-900/95 border-zinc-700/80 text-zinc-100'
            : isError
            ? 'bg-zinc-900/95 border-red-500/60 text-zinc-100'
            : 'bg-zinc-900/95 border-zinc-700/80 text-zinc-100'
        }`}
      >
        <div className="flex items-start gap-3">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />}
          {isError && <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />}
          <p className="text-sm font-medium leading-snug">{notification.message}</p>
        </div>
        <button
          onClick={clearNotification}
          className="text-zinc-400 hover:text-white transition-colors p-1"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
