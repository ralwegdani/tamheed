// Horizontal bar chart: average score per skill across all results.
// Each bar is colored by its level. Hover or focus a row to highlight it.
import { useState } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import { scoreLevel } from '../utils/scoring';
import { labelOf } from '../utils/localize';

// results -> [{ skill, average (0-100), count }], strongest first
export function skillAverages(results) {
  const totals = {};
  results.forEach((result) => {
    result.criteria.forEach((c) => {
      totals[c.skill] = totals[c.skill] || { sum: 0, count: 0 };
      totals[c.skill].sum += c.score * 10;
      totals[c.skill].count += 1;
    });
  });
  return Object.entries(totals)
    .map(([skill, { sum, count }]) => ({ skill, average: Math.round(sum / count), count }))
    .sort((a, b) => b.average - a.average);
}

export default function SkillChart({ results }) {
  const { t } = usePreferences();
  const [active, setActive] = useState(null);
  const skills = skillAverages(results);

  return (
    <ul className="skill-chart" onMouseLeave={() => setActive(null)}>
      {skills.map((s) => {
        const level = scoreLevel(s.average);
        const label = labelOf(t, 'skill', s.skill);
        const dimmed = active && active !== s.skill;
        return (
          <li
            key={s.skill}
            className={`skill-row level-${level}${dimmed ? ' dimmed' : ''}`}
            tabIndex={0}
            onMouseEnter={() => setActive(s.skill)}
            onFocus={() => setActive(s.skill)}
            onBlur={() => setActive(null)}
            aria-label={`${label}: ${s.average}/100, ${t(`level.${level}`)}`}
          >
            <span className="skill-name">{label}</span>
            <span className="skill-track">
              <span className="skill-fill" style={{ '--w': `${s.average}%` }}></span>
            </span>
            <span className="skill-value">{s.average}</span>
            {active === s.skill && (
              <span className="skill-tip">{t('dash.skills.results', { count: s.count })}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
