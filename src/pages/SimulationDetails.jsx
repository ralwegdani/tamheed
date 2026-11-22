import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { getSimulationById, saveResult, usedToday, addUsage } from '../services/db';
import { validateAnswer, ANSWER_MIN, ANSWER_MAX } from '../utils/validation';
import { localizeSimulation, labelOf } from '../utils/localize';
import { evaluateAnswer, MODEL } from '../services/gemini';
import useAsync from '../components/useAsync';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import CategoryIcon from '../components/CategoryIcon';

export default function SimulationDetails() {
  const { id } = useParams();
  const { profile, settings, refreshProfile } = useAuth();
  const { t, language } = usePreferences();
  const navigate = useNavigate();

  const [answer, setAnswer] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: baseSimulation, loading, error } = useAsync(() => getSimulationById(id), [id]);

  if (loading) return <Loader />;
  if (error) return <Alert type="error">{t(error)}</Alert>;

  // Hidden simulations are not open to students.
  if (!baseSimulation || baseSimulation.hidden) {
    return (
      <EmptyState page title={t('details.notFound')} text={t('details.notFoundText')}>
        <Link to="/simulations" className="btn btn-primary">{t('details.back')}</Link>
      </EmptyState>
    );
  }

  const simulation = localizeSimulation(baseSimulation, language);
  const limit = settings.dailyLimit;
  const left = Math.max(limit - usedToday(profile), 0);
  const limitReached = left === 0;
  const length = answer.trim().length;
  const progress = Math.min(length / ANSWER_MIN, 1) * 100;

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');

    const validation = validateAnswer(answer);
    setFieldError(validation);
    if (validation || limitReached) return;

    setSubmitting(true);
    try {
      const evaluation = await evaluateAnswer(simulation, answer.trim(), language);
      const resultId = await saveResult(profile, {
        simulationId: simulation.id,
        simulationTitle: simulation.title,
        category: simulation.category,
        difficulty: simulation.difficulty,
        answer: answer.trim(),
        language, // the feedback language
        model: MODEL,
        createdAt: new Date().toISOString(),
        ...evaluation,
      });
      await addUsage(profile);
      await refreshProfile();
      navigate(`/results/${resultId}`);
    } catch (err) {
      // The answer stays in the box so the student can try again.
      setApiError(err.toText ? err.toText() : 'fb.generic');
      setSubmitting(false);
    }
  }

  return (
    <div className="details">
      <Link to="/simulations" className="back-link">{t('details.back')}</Link>

      <article className="brief" aria-labelledby="brief-title">
        <div className="brief-header">
          <span className="brief-icon"><CategoryIcon category={simulation.category} /></span>
          <p><span className="brief-key">{t('brief.from')}</span> {simulation.from || t('admin.fFromPlaceholder')}</p>
          <p><span className="brief-key">{t('brief.field')}</span> {labelOf(t, 'cat', simulation.category)}</p>
          <p><span className="brief-key">{t('brief.level')}</span> {labelOf(t, 'diff', simulation.difficulty)}</p>
        </div>
        <h1 id="brief-title">{simulation.title}</h1>
        <p className="brief-body">{simulation.scenario}</p>
        <h2>{t('brief.task')}</h2>
        <p className="brief-body">{simulation.task}</p>
      </article>

      <div className="details-grid">
        <section className="rubric" aria-labelledby="rubric-title">
          <h2 id="rubric-title">{t('details.rubric')}</h2>
          <ul>
            {simulation.criteria.map((c) => (
              <li key={c.id}>
                <div className="rubric-head">
                  <span>{c.name}</span>
                  <span className="rubric-weight">{c.weight}%</span>
                </div>
                <span className="rubric-weight-bar" aria-hidden="true">
                  <span style={{ width: `${c.weight}%` }}></span>
                </span>
                <p>{c.description}</p>
                <p className="rubric-skill">{labelOf(t, 'skill', c.skill)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="answer panel" aria-labelledby="answer-title">
          <h2 id="answer-title">{t('details.response')}</h2>
          <Alert type="error">{t(apiError)}</Alert>
          {limitReached && <Alert type="info">{t('details.limit', { limit })}</Alert>}

          {submitting ? (
            <Loader variant="bar" text={t('details.loading')} />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <FormField
                id="answer"
                as="textarea"
                label={t('details.label')}
                rows={12}
                dir="auto"
                maxLength={ANSWER_MAX}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setFieldError('');
                }}
                error={t(fieldError)}
                hint={t('details.hint', { now: length, max: ANSWER_MAX, min: ANSWER_MIN })}
              />
              {/* Fills up until the answer reaches the minimum length */}
              <span className={`length-meter${progress === 100 ? ' done' : ''}`} aria-hidden="true">
                <span style={{ width: `${progress}%` }}></span>
              </span>
              <div className="answer-actions">
                <button type="submit" className="btn btn-primary" disabled={limitReached}>
                  {t('details.submit')}
                </button>
                <span className="usage-note">{t('details.left', { left, limit })}</span>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
