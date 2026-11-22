import { Link, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { getResult, getSimulationById } from '../services/db';
import { localizeSimulation, labelOf } from '../utils/localize';
import useAsync from '../components/useAsync';
import ScoreRing from '../components/ScoreRing';
import ScoreBar from '../components/ScoreBar';
import ScoreLegend from '../components/ScoreLegend';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function Result() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { t, language, formatDate } = usePreferences();

  // The database rules only return a result to its owner or to an admin.
  const { data, loading, error } = useAsync(async () => {
    const result = await getResult(id);
    const simulation = result ? await getSimulationById(result.simulationId) : null;
    return { result, simulation };
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <Alert type="error">{t(error)}</Alert>;

  const { result } = data;
  if (!result) {
    return (
      <EmptyState page title={t('result.notFound')} text={t('result.notFoundText')}>
        <Link to="/dashboard" className="btn btn-primary">{t('result.goDashboard')}</Link>
      </EmptyState>
    );
  }

  // Titles and criterion names follow the current language when we have them.
  // The AI text (reasons, feedback) stays in the language it was written in.
  const simulation = localizeSimulation(data.simulation, language);
  const title = simulation?.title || result.simulationTitle;
  const criterionName = (c) => simulation?.criteria.find((sc) => sc.id === c.id)?.name || c.name;
  const feedbackLanguage = result.language || 'en';
  const viewingOther = result.uid !== user.uid; // an admin looking at a student's result

  return (
    <div className="result">
      {viewingOther && isAdmin ? (
        <Link to={`/admin/users/${result.uid}`} className="back-link">
          {t('result.backToUser', { name: result.userName })}
        </Link>
      ) : (
        <Link to="/dashboard" className="back-link">{t('result.back')}</Link>
      )}

      {viewingOther && (
        <p className="admin-view-note">{t('result.adminView', { name: result.userName, email: result.userEmail })}</p>
      )}

      <header className="result-head">
        <div>
          <p className="result-field">
            {labelOf(t, 'cat', result.category)} · {labelOf(t, 'diff', result.difficulty)}
          </p>
          <h1>{title}</h1>
          <p className="result-meta">
            {t('result.evaluatedBy', { model: result.model, date: formatDate(result.createdAt, true) })}
          </p>
          {feedbackLanguage !== language && (
            <p className="result-lang-note">{t('result.langNote', { lang: t(`lang.${feedbackLanguage}`) })}</p>
          )}
        </div>
        <ScoreRing score={result.overall} />
      </header>

      <ScoreLegend />

      {/* dir="auto" lets AI text written in the other language read in its own direction */}
      <div className="result-grid">
        <section aria-labelledby="scores-title" className="panel">
          <h2 id="scores-title">{t('result.criteria')}</h2>
          {result.criteria.map((c) => (
            <ScoreBar key={c.id} name={criterionName(c)} skill={c.skill} score={c.score}
              weight={c.weight} reason={c.reason} />
          ))}
        </section>

        <div className="result-side">
          <section aria-labelledby="feedback-title" className="panel">
            <h2 id="feedback-title">{t('result.feedback')}</h2>
            <p dir="auto">{result.feedback}</p>
          </section>

          <section aria-labelledby="strengths-title" className="panel panel-good">
            <h2 id="strengths-title">{t('result.strengths')}</h2>
            <ul className="plain-list">
              {result.strengths.map((s, i) => <li key={i} dir="auto">{s}</li>)}
            </ul>
          </section>

          <section aria-labelledby="improve-title" className="panel panel-warn">
            <h2 id="improve-title">{t('result.improve')}</h2>
            <ul className="plain-list">
              {result.improvements.map((s, i) => <li key={i} dir="auto">{s}</li>)}
            </ul>
          </section>

          <section aria-labelledby="practice-title" className="panel panel-sand">
            <h2 id="practice-title">{t('result.practice')}</h2>
            <ul className="plain-list">
              {result.recommendations.map((s, i) => <li key={i} dir="auto">{s}</li>)}
            </ul>
          </section>
        </div>
      </div>

      <details className="your-answer">
        <summary>{t('result.showAnswer')}</summary>
        <p dir="auto">{result.answer}</p>
      </details>

      {!viewingOther && (
        <div className="result-actions">
          <Link to="/simulations" className="btn btn-primary">{t('result.another')}</Link>
          <Link to={`/simulations/${result.simulationId}`} className="btn btn-ghost">{t('result.again')}</Link>
        </div>
      )}

      <p className="disclaimer">{t('result.disclaimer')}</p>
    </div>
  );
}
