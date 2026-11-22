import { Link } from 'react-router';
import { usePreferences } from '../contexts/PreferencesContext';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  const { t } = usePreferences();
  return (
    <EmptyState page title={t('notFound.title')} text={t('notFound.text')}>
      <Link to="/" className="btn btn-primary">{t('notFound.home')}</Link>
    </EmptyState>
  );
}
