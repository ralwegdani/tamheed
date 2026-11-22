// Tamheed logo: a bridge between two pillars (university and workplace)
// with a sun rising above it (the career ahead).
// The name shows in the current language, with the other language under it.
import { useId } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

export function LogoMark({ size = 36 }) {
  const gradientId = useId(); // unique id, so two logos on one page do not clash
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B4A3B" />
          <stop offset="1" stopColor="#13866A" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gradientId})`} />
      <circle cx="20" cy="13" r="3.4" fill="#F2D59A" />
      <path d="M8 29 Q20 13 32 29" fill="none" stroke="#F2D59A" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 29 V32 M32 29 V32 M14 23.6 V32 M26 23.6 V32" stroke="#FFFFFF" strokeOpacity="0.85"
        strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo() {
  const { language } = usePreferences();
  const main = language === 'ar' ? 'تمهيد' : 'Tamheed';
  const other = language === 'ar' ? 'Tamheed' : 'تمهيد';

  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-text">
        <span className="logo-main">{main}</span>
        <span className="logo-other" lang={language === 'ar' ? 'en' : 'ar'}>{other}</span>
      </span>
    </span>
  );
}
