// Shared layout for the Sign up and Log in pages:
// a brand panel on one side and the form card on the other.
import { usePreferences } from '../contexts/PreferencesContext';
import { LogoMark } from './Logo';

export default function AuthLayout({ children }) {
  const { t } = usePreferences();
  return (
    <section className="auth-page">
      <div className="auth-shell">
        <aside className="auth-panel" aria-hidden="true">
          <LogoMark size={48} />
          <p className="auth-panel-title">{t('auth.panel.title')}</p>
          <ul>
            <li>{t('auth.panel.p1')}</li>
            <li>{t('auth.panel.p2')}</li>
            <li>{t('auth.panel.p3')}</li>
          </ul>
        </aside>
        <div className="auth-card">{children}</div>
      </div>
    </section>
  );
}
