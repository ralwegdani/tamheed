import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import Logo from './Logo';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { t, theme, toggleTheme, toggleLanguage } = usePreferences();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setOpen(false);
    try {
      await logout();
      // replace + no state: the next person who logs in starts at their own dashboard,
      // not at the page the previous user was on.
      navigate('/login', { replace: true, state: null });
    } catch {
      console.error('Failed to log out');
    }
  }

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <a href="#main" className="skip-link">{t('nav.skip')}</a>
      <div className="navbar-inner">
        <Link to={user ? '/dashboard' : '/'} className="brand" onClick={close}>
          <Logo />
        </Link>

        <nav id="main-menu" className={open ? 'nav-links open' : 'nav-links'} aria-label={t('nav.main')}>
          {user ? (
            <>
              <NavLink to="/dashboard" onClick={close}>{t('nav.dashboard')}</NavLink>
              <NavLink to="/simulations" onClick={close}>{t('nav.simulations')}</NavLink>
              <NavLink to="/profile" onClick={close}>{t('nav.profile')}</NavLink>
              {isAdmin && <NavLink to="/admin" onClick={close}>{t('nav.admin')}</NavLink>}
              <button type="button" className="btn btn-ghost nav-logout" onClick={handleLogout}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" end onClick={close}>{t('nav.home')}</NavLink>
              <NavLink to="/login" onClick={close}>{t('nav.login')}</NavLink>
              <Link to="/signup" className="btn btn-primary" onClick={close}>{t('nav.signup')}</Link>
            </>
          )}
        </nav>

        <div className="nav-tools">
          <button type="button" className="tool-button lang-button" onClick={toggleLanguage}
            aria-label={t('pref.languageLabel')}>
            {t('pref.otherLanguage')}
          </button>
          <button type="button" className="tool-button icon-button" onClick={toggleTheme}
            aria-label={theme === 'light' ? t('pref.toDark') : t('pref.toLight')}
            title={theme === 'light' ? t('pref.toDark') : t('pref.toLight')}>
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <button type="button" className="tool-button menu-button" aria-expanded={open}
            aria-controls="main-menu" onClick={() => setOpen(!open)}>
            {open ? t('nav.close') : t('nav.menu')}
          </button>
        </div>
      </div>
    </header>
  );
}
