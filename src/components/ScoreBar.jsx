// One rubric criterion with its score from 0 to 10, drawn as a colored bar.
import { usePreferences } from '../contexts/PreferencesContext';
import { scoreLevel } from '../utils/scoring';
import { labelOf } from '../utils/localize';

export default function ScoreBar({ name, skill, score, weight, reason }) {
  const { t } = usePreferences();
  const percent = (score / 10) * 100;
  const level = scoreLevel(percent);

  return (
    <div className={`score-row level-${level}`}>
      <div className="score-head">
        <span className="score-name">{name}</span>
        <span className="score-badge">{score}/10</span>
      </div>
      <div className="score-track" role="meter" aria-label={name}
        aria-valuemin={0} aria-valuemax={10} aria-valuenow={score}
        aria-valuetext={`${score}/10, ${t(`level.${level}`)}`}>
        <div className="score-fill" style={{ '--w': `${percent}%` }}></div>
      </div>
      <p className="score-meta">
        {labelOf(t, 'skill', skill)} · {t('result.weight', { weight })}
      </p>
      {reason && <p className="score-reason" dir="auto">{reason}</p>}
    </div>
  );
}
