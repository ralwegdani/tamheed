// Small pop-up messages for successful actions ("Name saved.").
// Errors stay inside the page next to the form, so they are not missed.
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { usePreferences } from './PreferencesContext';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const SHOW_MS = 3500;

export function ToastProvider({ children }) {
  const { t } = usePreferences();
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = nextId.current++;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), SHOW_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-area" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon" aria-hidden="true">
              {toast.type === 'success' ? '✓' : 'i'}
            </span>
            <span>{toast.message}</span>
            <button type="button" className="toast-close" onClick={() => dismiss(toast.id)}
              aria-label={t('toast.dismiss')}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
