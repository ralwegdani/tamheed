// Circle gauge for an overall score from 0 to 100.
// The color comes from the score level: red, yellow or green.
import { usePreferences } from '../contexts/PreferencesContext';
import { scoreLevel } from '../utils/scoring';
import AnimatedNumber from './AnimatedNumber';

const RADIUS = 52;
const CIRCLE = 2 * Math.PI * RADIUS;

export default function ScoreRing({ score, size = 150, showLabel = true }) {
  const { t } = usePreferences();
  const level = scoreLevel(score);
  const offset = CIRCLE * (1 - score / 100);

  return (
    <div className={`score-ring level-${level}`} style={{ width: size }}>
      <svg viewBox="0 0 120 120" role="img" aria-label={`${score} / 100, ${t(`level.${level}`)}`}>
        <circle className="ring-track" cx="60" cy="60" r={RADIUS} />
        <circle
          className="ring-value"
          cx="60"
          cy="60"
          r={RADIUS}
          strokeDasharray={CIRCLE}
          style={{ '--ring-full': CIRCLE, '--ring-offset': offset }}
        />
      </svg>
      <div className="ring-center" aria-hidden="true">
        <span className="ring-number"><AnimatedNumber value={score} /></span>
        <span className="ring-out">{t('result.outOf')}</span>
      </div>
      {showLabel && <span className="level-pill">{t(`level.${level}`)}</span>}
    </div>
  );
}
