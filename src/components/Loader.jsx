// Loading indicator. role="status" lets screen readers announce it.
// variant="bar" shows a moving bar, used while Gemini evaluates an answer.
import { usePreferences } from '../contexts/PreferencesContext';

export default function Loader({ text, variant = 'spinner' }) {
  const { t } = usePreferences();
  return (
    <div className={`loader loader-${variant}`} role="status">
      {variant === 'bar' ? (
        <span className="loader-track" aria-hidden="true"><span></span></span>
      ) : (
        <span className="loader-spinner" aria-hidden="true"></span>
      )}
      <span>{text || t('loading')}</span>
    </div>
  );
}
