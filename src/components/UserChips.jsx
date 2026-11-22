// Small labels for a user's role and account status, plus an initials avatar.
import { usePreferences } from '../contexts/PreferencesContext';

export function RoleChip({ role }) {
  const { t } = usePreferences();
  return <span className={`chip chip-${role}`}>{t(`role.${role}`)}</span>;
}

export function StatusChip({ status }) {
  const { t } = usePreferences();
  return <span className={`chip chip-${status}`}>{t(`status.${status}`)}</span>;
}

export function Avatar({ name = '', size = 'md' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return <span className={`avatar avatar-${size}`} aria-hidden="true">{initials || '?'}</span>;
}
