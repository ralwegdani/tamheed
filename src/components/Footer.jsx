import { usePreferences } from '../contexts/PreferencesContext';
import { LogoMark } from './Logo';

export default function Footer() {
  const { t } = usePreferences();
  return (
    <footer className="footer">
      <LogoMark size={28} />
      <div>
        <p>{t('footer.line1')}</p>
        <p>{t('footer.line2')}</p>
      </div>
    </footer>
  );
}
