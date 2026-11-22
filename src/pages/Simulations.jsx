import { useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { getVisibleSimulations, getUserResults } from '../services/db';
import { localizeSimulation } from '../utils/localize';
import { CATEGORIES, DIFFICULTIES } from '../data/simulations';
import useAsync from '../components/useAsync';
import SimulationCard from '../components/SimulationCard';
import FormField from '../components/FormField';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function Simulations() {
  const { user } = useAuth();
  const { t, language } = usePreferences();
  // Search and filters are kept in the URL, so a filtered list can be shared or refreshed.
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';

  const { data, loading, error } = useAsync(
    () => Promise.all([getVisibleSimulations(), getUserResults(user.uid)]),
    [user.uid]
  );

  const simulations = data?.[0] || [];
  const best = {}; // simulation id -> best overall score
  (data?.[1] || []).forEach((r) => {
    best[r.simulationId] = Math.max(best[r.simulationId] ?? 0, r.overall);
  });

  // Start from the browser's current URL (always up to date), so quick changes are never lost.
  function updateParam(name, value) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace: true });
  }

  const text = q.trim().toLowerCase();
  const filtered = simulations
    .map((sim) => localizeSimulation(sim, language))
    .filter((sim) => {
      const matchesText =
        !text || sim.title.toLowerCase().includes(text) || sim.summary.toLowerCase().includes(text);
      const matchesCategory = !category || sim.category === category;
      const matchesLevel = !level || sim.difficulty === level;
      return matchesText && matchesCategory && matchesLevel;
    });

  const hasFilters = q || category || level;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t('sims.title')}</h1>
          <p className="page-sub">{t('sims.lead')}</p>
        </div>
      </div>

      <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <FormField id="search" type="search" label={t('sims.search')} placeholder={t('sims.searchPlaceholder')}
          value={q} onChange={(e) => updateParam('q', e.target.value)} />
        <FormField id="category" as="select" label={t('sims.field')} value={category}
          onChange={(e) => updateParam('category', e.target.value)}>
          <option value="">{t('sims.allFields')}</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
        </FormField>
        <FormField id="level" as="select" label={t('sims.level')} value={level}
          onChange={(e) => updateParam('level', e.target.value)}>
          <option value="">{t('sims.allLevels')}</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{t(`diff.${d}`)}</option>)}
        </FormField>
        {hasFilters && (
          <button type="button" className="btn btn-ghost" onClick={() => setSearchParams({})}>
            {t('sims.clear')}
          </button>
        )}
      </form>

      <Alert type="error">{t(error)}</Alert>

      {loading ? (
        <Loader />
      ) : (
        <>
          <p className="result-count" aria-live="polite">
            {filtered.length === 1 ? t('sims.countOne') : t('sims.count', { count: filtered.length })}
          </p>

          {filtered.length === 0 ? (
            <EmptyState text={t('sims.empty')}>
              <button type="button" className="btn btn-ghost" onClick={() => setSearchParams({})}>
                {t('sims.clear')}
              </button>
            </EmptyState>
          ) : (
            <div className="sim-grid">
              {filtered.map((sim) => (
                <SimulationCard key={sim.id} simulation={sim} bestScore={best[sim.id]} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
