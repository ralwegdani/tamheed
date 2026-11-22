// Bar chart: number of evaluations on each of the last days.
// Hover or focus a bar to see its exact number. Plain SVG, no chart library.
import { useState } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

const W = 600;
const H = 200;
const PAD = { top: 16, right: 12, bottom: 30, left: 30 };

// results -> [{ day: 'YYYY-MM-DD', count }] for the last `days` days, oldest first
export function countPerDay(results, days = 14) {
  const list = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    list.push({ day, count: results.filter((r) => r.createdAt.slice(0, 10) === day).length });
  }
  return list;
}

export default function DailyBars({ data }) {
  const { t, language } = usePreferences();
  const [active, setActive] = useState(null);

  const max = Math.max(1, ...data.map((d) => d.count));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / data.length;
  const barW = Math.min(28, slot * 0.62);
  const label = (day) =>
    new Date(day).toLocaleDateString(language === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="trend" dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg" role="group" aria-label={t('adm.chart.daily')}>
        {/* Whole-number grid lines only: 0, the middle (when it is a whole number) and the top */}
        {[...new Set([0, Math.round(max / 2), max])].map((value) => {
          const y = PAD.top + innerH * (1 - value / max);
          return (
            <g key={value}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} className="trend-grid" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="trend-axis">{value}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.count / max) * innerH;
          const x = PAD.left + slot * i + (slot - barW) / 2;
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={PAD.top + innerH - h}
                width={barW}
                height={Math.max(h, d.count ? 2 : 0)}
                rx="5"
                className={active === i ? 'day-bar active' : 'day-bar'}
                tabIndex={0}
                aria-label={`${label(d.day)}: ${d.count}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
              {i % 2 === 0 && (
                <text x={x + barW / 2} y={H - 8} textAnchor="middle" className="trend-axis">{label(d.day)}</text>
              )}
            </g>
          );
        })}
      </svg>
      {active !== null && (
        <div
          className="trend-tip"
          style={{
            left: `${((PAD.left + slot * active + slot / 2) / W) * 100}%`,
            top: `${((PAD.top + innerH - (data[active].count / max) * innerH) / H) * 100}%`,
          }}
        >
          <strong>{data[active].count}</strong>
          <span>{label(data[active].day)}</span>
        </div>
      )}
    </div>
  );
}
