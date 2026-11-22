// Language (Arabic / English) and theme (light / dark) for the whole app.
// Both choices are saved in localStorage so they stay after a refresh.
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../i18n/en';
import ar from '../i18n/ar';

const PreferencesContext = createContext();

export const usePreferences = () => useContext(PreferencesContext);

const DICTIONARIES = { en, ar };
const LANG_KEY = 'tamheed_language';
const THEME_KEY = 'tamheed_theme';

function readSaved(key, allowed, fallback) {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Saving is a convenience only. The app still works without it.
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function PreferencesProvider({ children }) {
  const [language, setLanguage] = useState(() => readSaved(LANG_KEY, ['en', 'ar'], 'en'));
  const [theme, setTheme] = useState(() => readSaved(THEME_KEY, ['light', 'dark'], systemTheme()));

  // Arabic pages read right to left. The <html> tag tells the browser and screen readers.
  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.title = language === 'ar' ? 'تمهيد' : 'Tamheed';
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleLanguage() {
    const next = language === 'en' ? 'ar' : 'en';
    setLanguage(next);
    save(LANG_KEY, next);
  }

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    save(THEME_KEY, next);
  }

  // t('dash.welcome', { name: 'Jana' }) -> "Welcome, Jana"
  // t also accepts { key, vars } objects, which our validation and API code return.
  const t = useCallback(
    (key, vars) => {
      if (key && typeof key === 'object') {
        vars = key.vars;
        key = key.key;
      }
      if (!key) return '';
      let text = DICTIONARIES[language][key] ?? en[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([name, value]) => {
          text = text.replaceAll(`{${name}}`, value);
        });
      }
      return text;
    },
    [language]
  );

  // Dates use the Gregorian calendar and Western digits in both languages.
  const formatDate = useCallback(
    (iso, withTime = false) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      if (withTime) Object.assign(options, { hour: '2-digit', minute: '2-digit' });
      const locale = language === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-GB';
      return new Date(iso).toLocaleString(locale, options);
    },
    [language]
  );

  const value = { language, theme, dir: language === 'ar' ? 'rtl' : 'ltr', t, formatDate, toggleLanguage, toggleTheme };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
