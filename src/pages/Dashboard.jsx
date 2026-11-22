import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { getUserResults, getAllSimulations, usedToday } from '../services/db';
import { localizeSimulation, labelOf } from '../utils/localize';
import { scoreLevel } from '../utils/scoring';
import useAsync from '../components/useAsync';
import AnimatedNumber from '../components/AnimatedNumber';
import FormField from '../components/FormField';
import ScoreBadge from '../components/ScoreBadge';
import ScoreLegend from '../components/ScoreLegend';
import SkillChart from '../components/SkillChart';
import TrendChart from '../components/TrendChart';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const TREND_SIZE = 10;

export default function Dashboard() {
  const { user, profile, settings } = useAuth();
  const { t, language, formatDate } = usePreferences();
  const [search, setSearch] = useState('');

  // Load this student's results and the simulations (for titles) when the page opens.
  const { data, loading, error } = useAsync(
    () => Promise.all([getUserResults(user.uid), getAllSimulations()]),
    [user.uid]
  );

  const results = data?.[0] || [];
  const simulations = data?.[1] || [];

  // Show each simulation title in the current language when we have it.
  const titleOf = (result) => {
    const sim = simulations.find((s) => s.id === result.simulationId);
    return localizeSimulation(sim, language)?.title || result.simulationTitle;
  };

  const completed = new Set(results.map((r) => r.simulationId)).size;
  const average = results.length
    ? Math.round(results.reduce((sum, r) => sum + r.overall, 0) / results.length)
    : null;
  const limit = settings.dailyLimit;
  const left = Math.max(limit - usedToday(profile), 0);

  // results are newest first; the chart reads oldest first
  const trendPoints = results
    .slice(0, TREND_SIZE)
    .reverse()
    .map((r) => ({ id: r.id, score: r.overall, title: titleOf(r) }));

  const shown = results.filter((r) => titleOf(r).toLowerCase().includes(search.trim().toLowerCase()));
  const firstName = user.displayName.split(' ')[0];
  const announcement = settings.announcement;

  return (
    <div className="dashboard">
      <div className="page-head">
        <div>
          <h1>{t('dash.welcome', { name: firstName })}</h1>
          <p className="page-sub">{t('dash.sub')}</p>
        </div>
        <Link to="/simulations" className="btn btn-primary">{t('dash.start')}</Link>
      </div>

      {announcement.active && announcement.text && (
        <div className="announcement" role="note">
          <span className="announcement-label">{t('dash.announcement')}</span>
          <p dir="auto">{announcement.text}</p>
        </div>
      )}

      <Alert type="error">{t(error)}</Alert>

      {loading ? (
        <Loader />
      ) : (
        <>
          <dl className="stats">
            <div className="stat-card">
              <dt>{t('dash.completed')}</dt>
              <dd><AnimatedNumber value={completed} /></dd>
            </div>
            <div className={`stat-card${average !== null ? ` level-${scoreLevel(average)}` : ''}`}>
              <dt>{t('dash.average')}</dt>
              <dd>
                {average === null ? (
                  <span className="stat-empty">{t('dash.noScore')}</span>
                ) : (
                  <><span className="stat-score"><AnimatedNumber value={average} /></span><small>/100</small></>
                )}
              </dd>
            </div>
            <div className="stat-card">
              <dt>{t('dash.left')}</dt>
              <dd>{t('dash.leftValue', { left, limit })}</dd>
              <div className="usage-dots" aria-hidden="true">
                {Array.from({ length: Math.min(limit, 20) }, (_, i) => (
                  <span key={i} className={i < left ? 'dot on' : 'dot'}></span>
                ))}
              </div>
            </div>
          </dl>

          <div className="charts">
            <section className="panel" aria-labelledby="skills-title">
              <h2 id="skills-title">{t('dash.skills.title')}</h2>
              {results.length === 0 ? (
                <p className="muted">{t('dash.skills.empty')}</p>
              ) : (
                <>
                  <p className="muted small">{t('dash.skills.note')}</p>
                  <SkillChart results={results} />
                </>
              )}
            </section>

            <section className="panel" aria-labelledby="trend-title">
              <h2 id="trend-title">{t('dash.trend.title')}</h2>
              {trendPoints.length < 2 ? (
                <p className="muted">{t('dash.trend.empty')}</p>
              ) : (
                <>
                  <p className="muted small">{t('dash.trend.note', { count: trendPoints.length })}</p>
                  <TrendChart points={trendPoints} />
                </>
              )}
            </section>
          </div>

          {results.length > 0 && <ScoreLegend />}

          <section aria-labelledby="results-title" className="results-section">
            <div className="section-head">
              <h2 id="results-title">{t('dash.results.title')}</h2>
              {results.length > 0 && (
                <FormField id="result-search" type="search" label={t('dash.results.search')}
                  placeholder={t('dash.results.placeholder')} value={search}
                  onChange={(e) => setSearch(e.target.value)} />
              )}
            </div>

            {results.length === 0 && (
              <EmptyState text={t('dash.results.empty')}>
                <Link to="/simulations" className="btn btn-primary">{t('dash.results.browse')}</Link>
              </EmptyState>
            )}

            {results.length > 0 && shown.length === 0 && (
              <p className="empty-line">{t('dash.results.noMatch', { q: search })}</p>
            )}

            {shown.length > 0 && (
              <div className="table-wrap">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th scope="col">{t('table.simulation')}</th>
                      <th scope="col">{t('table.field')}</th>
                      <th scope="col">{t('table.date')}</th>
                      <th scope="col">{t('table.score')}</th>
                      <th scope="col"><span className="visually-hidden">{t('table.open')}</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((r) => (
                      <tr key={r.id}>
                        <td className="cell-strong">{titleOf(r)}</td>
                        <td>{labelOf(t, 'cat', r.category)}</td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td><ScoreBadge score={r.overall} /></td>
                        <td><Link to={`/results/${r.id}`}>{t('table.view')}</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
