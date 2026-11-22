// A simulation in the list. The card tilts a little toward the mouse,
// and a soft light follows the cursor. Keyboard users get a focus ring instead.
import { Link } from 'react-router';
import { usePreferences } from '../contexts/PreferencesContext';
import { labelOf } from '../utils/localize';
import CategoryIcon from './CategoryIcon';
import ScoreBadge from './ScoreBadge';

function handlePointerMove(e) {
  if (e.pointerType !== 'mouse') return;
  const card = e.currentTarget;
  const box = card.getBoundingClientRect();
  const px = (e.clientX - box.left) / box.width; // 0 (left) to 1 (right)
  const py = (e.clientY - box.top) / box.height;
  card.style.setProperty('--mx', `${px * 100}%`);
  card.style.setProperty('--my', `${py * 100}%`);
  card.style.setProperty('--rx', `${(0.5 - py) * 5}deg`);
  card.style.setProperty('--ry', `${(px - 0.5) * 5}deg`);
}

function handlePointerLeave(e) {
  e.currentTarget.style.setProperty('--rx', '0deg');
  e.currentTarget.style.setProperty('--ry', '0deg');
}

export default function SimulationCard({ simulation, bestScore }) {
  const { t } = usePreferences();

  return (
    <article className="sim-card" onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      <div className="sim-card-top">
        <span className="sim-card-icon"><CategoryIcon category={simulation.category} /></span>
        <span className="sim-card-category">{labelOf(t, 'cat', simulation.category)}</span>
      </div>
      <h3>
        <Link to={`/simulations/${simulation.id}`}>{simulation.title}</Link>
      </h3>
      <p className="sim-card-summary">{simulation.summary}</p>
      <div className="sim-card-meta">
        <span className={`level-chip diff-${simulation.difficulty.toLowerCase()}`}>
          {labelOf(t, 'diff', simulation.difficulty)}
        </span>
        {bestScore !== undefined && (
          <ScoreBadge score={bestScore}>{t('sims.best', { score: bestScore })}</ScoreBadge>
        )}
      </div>
    </article>
  );
}
