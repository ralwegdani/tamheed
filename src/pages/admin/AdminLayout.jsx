// Shell for all admin pages: a title and tabs. The chosen tab's page shows in <Outlet />.
// Uses nested routes from the React Router lecture.
import { NavLink, Outlet } from 'react-router';
import { usePreferences } from '../../contexts/PreferencesContext';

export default function AdminLayout() {
  const { t } = usePreferences();
  return (
    <div className="admin">
      <div className="admin-head">
        <h1>{t('adm.title')}</h1>
        <nav className="admin-tabs" aria-label={t('adm.title')}>
          <NavLink to="/admin" end>{t('adm.tab.overview')}</NavLink>
          <NavLink to="/admin/users">{t('adm.tab.users')}</NavLink>
          <NavLink to="/admin/simulations">{t('adm.tab.simulations')}</NavLink>
          <NavLink to="/admin/settings">{t('adm.tab.settings')}</NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
