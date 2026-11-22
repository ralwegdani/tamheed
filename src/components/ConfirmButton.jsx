// A button for risky actions. The first click asks "Are you sure?",
// the second click does the action. No browser pop-up needed.
import { useState, useEffect } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

export default function ConfirmButton({ children, confirmText, onConfirm, danger = false, disabled = false }) {
  const { t } = usePreferences();
  const [asking, setAsking] = useState(false);
  const [working, setWorking] = useState(false);

  // Stop asking after 4 seconds if nothing happens.
  useEffect(() => {
    if (!asking) return undefined;
    const timer = setTimeout(() => setAsking(false), 4000);
    return () => clearTimeout(timer);
  }, [asking]);

  async function handleClick() {
    if (!asking) {
      setAsking(true);
      return;
    }
    setWorking(true);
    try {
      await onConfirm();
    } finally {
      setWorking(false);
      setAsking(false);
    }
  }

  const className = `btn btn-small ${danger ? 'btn-danger' : 'btn-ghost'}${asking ? ' is-asking' : ''}`;

  return (
    <button type="button" className={className} onClick={handleClick} disabled={disabled || working}>
      {working ? t('loading') : asking ? confirmText || t('admin.confirm') : children}
    </button>
  );
}
