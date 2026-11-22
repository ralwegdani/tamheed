// Explains the three score colors. Shown wherever scores appear.
import { usePreferences } from '../contexts/PreferencesContext';

const LEVELS = ['low', 'mid', 'high'];

export default function ScoreLegend({ large = false }) {
  const { t } = usePreferences();
  return (
    <div className={large ? 'legend legend-large' : 'legend'}>
      <span className="legend-title">{t('legend.title')}</span>
      <ul>
        {LEVELS.map((level) => (
          <li key={level} className={`level-${level}`}>
            <span className="legend-dot" aria-hidden="true"></span>
            <span className="legend-name">{t(`level.${level}`)}</span>
            <span className="legend-range">{t(`legend.${level}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
