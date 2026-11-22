// Line chart of the overall score over the last results (oldest first).
// Points are colored by level. Hover or focus a point to see its details.
// Drawn with plain SVG, no chart library.
import { useState } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import { scoreLevel } from '../utils/scoring';

const W = 600;
const H = 220;
const PAD = { top: 16, right: 20, bottom: 28, left: 36 };

export default function TrendChart({ points }) {
  const { t } = usePreferences();
  const [active, setActive] = useState(null);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (score) => PAD.top + (1 - score / 100) * innerH;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.score)}`).join(' ');
  const area = `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const activePoint = active === null ? null : points[active];

  return (
    <div className="trend" dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg" role="group"
        aria-label={t('dash.trend.title')}>
        <defs>
          <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--brand)', stopOpacity: 0.25 }} />
            <stop offset="1" style={{ stopColor: 'var(--brand)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* Grid lines at 0, 50, 75 and 100: the borders between the color levels */}
        {[0, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)}
              className={v === 50 || v === 75 ? 'trend-threshold' : 'trend-grid'} />
            <text x={PAD.left - 8} y={y(v) + 4} className="trend-axis" textAnchor="end">{v}</text>
          </g>
        ))}

        <path d={area} fill="url(#trend-area)" />
        <path d={line} className="trend-line" />

        {points.map((p, i) => (
          <circle
            key={p.id}
            cx={x(i)}
            cy={y(p.score)}
            r={active === i ? 9 : 6}
            className={`trend-point level-${scoreLevel(p.score)}`}
            tabIndex={0}
            aria-label={t('dash.trend.point', { n: i + 1, score: p.score, title: p.title })}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
          />
        ))}
      </svg>

      {activePoint && (
        <div
          className="trend-tip"
          style={{ left: `${(x(active) / W) * 100}%`, top: `${(y(activePoint.score) / H) * 100}%` }}
          dir="auto"
        >
          <strong>{activePoint.score}/100</strong>
          <span>{activePoint.title}</span>
        </div>
      )}
    </div>
  );
}
