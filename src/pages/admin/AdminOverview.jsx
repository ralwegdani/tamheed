// Admin overview: platform numbers, charts, top simulations and recent activity.
import { Link } from 'react-router';
import { usePreferences } from '../../contexts/PreferencesContext';
import { getAllUsers, getAllResults, getAllSimulations, getAdminLog } from '../../services/db';
import { localizeSimulation } from '../../utils/localize';
import { scoreLevel } from '../../utils/scoring';
import useAsync from '../../components/useAsync';
import AnimatedNumber from '../../components/AnimatedNumber';
import DailyBars, { countPerDay } from '../../components/DailyBars';
import SkillChart from '../../components/SkillChart';
import ScoreBadge from '../../components/ScoreBadge';
import ScoreLegend from '../../components/ScoreLegend';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function AdminOverview() {
  const { t, language, formatDate } = usePreferences();
  const { data, loading, error } = useAsync(
    () => Promise.all([getAllUsers(), getAllResults(), getAllSimulations(), getAdminLog(10)]),
    []
  );

  if (loading) return <Loader />;
  if (error) return <Alert type="error">{t(error)}</Alert>;

  const [users, results, simulations, log] = data;
  const titleOf = (id, fallback) =>
    localizeSimulation(simulations.find((s) => s.id === id), language)?.title || fallback;

  const activeWeek = users.filter((u) => Date.now() - new Date(u.lastActiveAt).getTime() < WEEK_MS).length;
  const blocked = users.filter((u) => u.status === 'blocked').length;
  const average = results.length ? Math.round(results.reduce((s, r) => s + r.overall, 0) / results.length) : null;

  // How many results fall in each color level
  const levels = { low: 0, mid: 0, high: 0 };
  results.forEach((r) => { levels[scoreLevel(r.overall)] += 1; });

  // Simulations with the most attempts
  const bySimulation = {};
  results.forEach((r) => {
    const entry = (bySimulation[r.simulationId] ||= { id: r.simulationId, title: r.simulationTitle, count: 0, sum: 0 });
    entry.count += 1;
    entry.sum += r.overall;
  });
  const top = Object.values(bySimulation).sort((a, b) => b.count - a.count).slice(0, 5);

  const cards = [
    { key: 'adm.stat.users', value: users.length },
    { key: 'adm.stat.active', value: activeWeek },
    { key: 'adm.stat.results', value: results.length },
    { key: 'adm.stat.blocked', value: blocked },
  ];

  return (
    <div className="admin-overview">
      <dl className="stats stats-4">
        {cards.map((card) => (
          <div key={card.key} className="stat-card">
            <dt>{t(card.key)}</dt>
            <dd><AnimatedNumber value={card.value} /></dd>
          </div>
        ))}
      </dl>

      <div className="charts">
        <section className="panel" aria-labelledby="daily-title">
          <h2 id="daily-title">{t('adm.chart.daily')}</h2>
          <p className="muted small">{t('adm.chart.dailyNote')}</p>
          <DailyBars data={countPerDay(results)} />
        </section>

        <section className="panel" aria-labelledby="dist-title">
          <h2 id="dist-title">{t('adm.chart.levels')}</h2>
          <p className="muted small">
            {average === null ? t('dash.noScore') : t('adm.chart.average', { average })}
          </p>
          {results.length > 0 ? (
            <>
              <div className="level-split" role="img"
                aria-label={['low', 'mid', 'high'].map((l) => `${t(`level.${l}`)}: ${levels[l]}`).join(', ')}>
                {['low', 'mid', 'high'].map((l) =>
                  levels[l] > 0 ? (
                    <span key={l} className={`level-${l}`} style={{ flexGrow: levels[l] }}>{levels[l]}</span>
                  ) : null
                )}
              </div>
              <ScoreLegend />
            </>
          ) : (
            <p className="muted">{t('adm.empty.results')}</p>
          )}
        </section>
      </div>

      <div className="charts">
        <section className="panel" aria-labelledby="top-title">
          <h2 id="top-title">{t('adm.top.title')}</h2>
          {top.length === 0 ? (
            <p className="muted">{t('adm.empty.results')}</p>
          ) : (
            <ol className="rank-list">
              {top.map((s) => (
                <li key={s.id}>
                  <span className="rank-title">{titleOf(s.id, s.title)}</span>
                  <span className="muted small">{t('adm.top.attempts', { count: s.count })}</span>
                  <ScoreBadge score={Math.round(s.sum / s.count)} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="panel" aria-labelledby="pskills-title">
          <h2 id="pskills-title">{t('adm.skills.title')}</h2>
          {results.length === 0 ? (
            <p className="muted">{t('adm.empty.results')}</p>
          ) : (
            <>
              <p className="muted small">{t('adm.skills.note')}</p>
              <SkillChart results={results} />
            </>
          )}
        </section>
      </div>

      <div className="charts">
        <section className="panel" aria-labelledby="recent-title">
          <h2 id="recent-title">{t('adm.recent.title')}</h2>
          {results.length === 0 ? (
            <p className="muted">{t('adm.empty.results')}</p>
          ) : (
            <ul className="activity-list">
              {results.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <Link to={`/results/${r.id}`} className="activity-main">
                    <strong>{r.userName}</strong> · {titleOf(r.simulationId, r.simulationTitle)}
                  </Link>
                  <span className="muted small">{formatDate(r.createdAt, true)}</span>
                  <ScoreBadge score={r.overall} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel" aria-labelledby="log-title">
          <h2 id="log-title">{t('adm.log.title')}</h2>
          {log.length === 0 ? (
            <p className="muted">{t('adm.log.empty')}</p>
          ) : (
            <ul className="activity-list">
              {log.map((entry) => (
                <li key={entry.id}>
                  <span className="activity-main">
                    <strong>{entry.adminName}</strong> · {t(entry.action, { target: entry.target })}
                  </span>
                  <span className="muted small">{formatDate(entry.createdAt, true)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
