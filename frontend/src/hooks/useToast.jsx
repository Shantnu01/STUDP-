// src/hooks/useToast.js
import { useState, useCallback, useEffect } from 'react';

let globalShow;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((msg, type = 'ok') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  useEffect(() => { globalShow = show; }, [show]);

  return { toasts, show };
}

export function toast(msg, type = 'ok') {
  globalShow?.(msg, type);
}

// src/components/Toast.jsx  (exported from same file for convenience)
export function ToastContainer({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'var(--bg2)', border: '1px solid',
          borderColor: t.type === 'ok' ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)',
          borderRadius: 10, padding: '10px 16px', fontSize: 12,
          color: t.type === 'ok' ? 'var(--green)' : 'var(--red)',
          boxShadow: '0 8px 32px rgba(0,0,0,.5)',
          animation: 'fadeIn .2s ease',
          maxWidth: 320,
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
