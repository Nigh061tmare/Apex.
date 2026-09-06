import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

// Host global de toasts: escucha el evento 'apex:toast' y renderiza la cola.
// Se monta a nivel raíz (main.jsx) para que funcione en cualquier pantalla.
export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    function onToast(e) {
      const detail = e.detail || {};
      const id = detail.id || Date.now() + Math.random();
      const toast = { id, message: detail.message, type: detail.type || 'info' };
      setToasts(prev => [...prev.slice(-4), toast]);
      // Auto-dismiss
      setTimeout(() => dismiss(id), 4200);
    }
    window.addEventListener('apex:toast', onToast);
    return () => window.removeEventListener('apex:toast', onToast);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  const styles = {
    info: { border: 'border-cyan-500/50', bg: 'bg-cyan-950/90', icon: <Info className="w-4 h-4 text-cyan-300 shrink-0" /> },
    success: { border: 'border-emerald-500/50', bg: 'bg-emerald-950/90', icon: <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" /> },
    warning: { border: 'border-amber-500/50', bg: 'bg-amber-950/90', icon: <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" /> },
    error: { border: 'border-red-500/60', bg: 'bg-red-950/90', icon: <XCircle className="w-4 h-4 text-red-300 shrink-0" /> }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        const s = styles[t.type] || styles.info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-3 rounded-xl border ${s.border} ${s.bg} text-slate-100 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 fade-in duration-200`}
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {s.icon}
            <span className="flex-1 leading-snug break-words">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-white cursor-pointer shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}