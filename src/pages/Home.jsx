import { useRef } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { CATEGORIES, SIMULATIONS, DIFFICULTIES } from '../data/simulations';
import AnimatedNumber from '../components/AnimatedNumber';
import ScoreRing from '../components/ScoreRing';
import ScoreLegend from '../components/ScoreLegend';
import CategoryIcon from '../components/CategoryIcon';
import useReveal from '../components/useReveal';
import { scoreLevel } from '../utils/scoring';


// Example scores on the sample result card in the hero.
const SAMPLE = [
  { key: 'home.sample.c1', score: 8 },
  { key: 'home.sample.c2', score: 6 },
  { key: 'home.sample.c3', score: 9 },
];


function Section({ className = '', children, ...rest }) {
  const ref = useReveal();
  return (
    <section ref={ref} className={`home-section reveal ${className}`} {...rest}>
      {children}
    </section>
  );
}

export default function Home() {
  const { user, settings } = useAuth();
  const { t } = usePreferences();
  const heroRef = useRef(null);

  // Real numbers from the app, not invented statistics.
  const STATS = [
    { value: SIMULATIONS.length, key: 'home.stats.simulations' },
    { value: CATEGORIES.length, key: 'home.stats.fields' },
    { value: DIFFICULTIES.length, key: 'home.stats.levels' },
    { value: settings.dailyLimit, key: 'home.stats.daily' },
  ];

  if (user) return <Navigate to="/dashboard" replace />;

  // The hero background and cards follow the mouse.
  // We only update CSS variables, so React does not re-render on every move.
  function handlePointerMove(e) {
    if (e.pointerType !== 'mouse' || !heroRef.current) return;
    const box = heroRef.current.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    heroRef.current.style.setProperty('--mx', `${x}px`);
    heroRef.current.style.setProperty('--my', `${y}px`);
    heroRef.current.style.setProperty('--px', ((x / box.width) * 2 - 1).toFixed(3));
    heroRef.current.style.setProperty('--py', ((y / box.height) * 2 - 1).toFixed(3));
  }

  const simsPerField = (category) => SIMULATIONS.filter((s) => s.category === category).length;

  return (
    <div className="home">
      <section ref={heroRef} className="hero" onPointerMove={handlePointerMove} aria-labelledby="hero-title">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-dots"></div>
          <div className="hero-dots hero-dots-lit"></div>
          <div className="hero-glow"></div>
        </div>

        <div className="hero-text">
          <h1 id="hero-title">{t('home.title')}</h1>
          <p className="hero-lead">{t('home.lead')}</p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-large btn-shine">{t('home.ctaPrimary')}</Link>
            <Link to="/login" className="btn btn-ghost btn-large">{t('home.ctaSecondary')}</Link>
          </div>
        </div>

        {/* A sample brief and its result, the way they look inside the app */}
        <div className="hero-visual" aria-hidden="true">
          <div className="brief hero-brief float-back">
            <div className="brief-header">
              <p><span className="brief-key">{t('brief.from')}</span> {t('home.sample.from')}</p>
              <p><span className="brief-key">{t('brief.subject')}</span> {t('home.sample.subject')}</p>
            </div>
            <p className="brief-body">{t('home.sample.body')}</p>
          </div>

          <div className="hero-result float-front">
            <ScoreRing score={82} size={112} showLabel={false} />
            <div className="hero-result-bars">
              <p className="hero-result-title">{t('home.sample.score')}</p>
              {SAMPLE.map((item) => (
                <div key={item.key} className={`mini-bar level-${scoreLevel(item.score * 10)}`}>
                  <span className="mini-bar-label">{t(item.key)}</span>
                  <span className="mini-bar-track">
                    <span className="mini-bar-fill" style={{ '--w': `${item.score * 10}%` }}></span>
                  </span>
                  <span className="mini-bar-value">{item.score}/10</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="stats-band">
        {STATS.map((stat) => (
          <div key={stat.key} className="stat">
            <span className="stat-number"><AnimatedNumber value={stat.value} /></span>
            <span className="stat-label">{t(stat.key)}</span>
          </div>
        ))}
      </section>

      <Section className="problem" aria-labelledby="problem-title">
        <h2 id="problem-title">{t('home.problem.title')}</h2>
        <p>{t('home.problem.body')}</p>
      </Section>

      <Section aria-labelledby="steps-title">
        <h2 id="steps-title">{t('home.steps.title')}</h2>
        <ol className="steps">
          {[1, 2, 3].map((n) => (
            <li key={n} className="step">
              <span className="step-number" aria-hidden="true">{n}</span>
              <h3>{t(`home.steps.${n}.title`)}</h3>
              <p>{t(`home.steps.${n}.body`)}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section aria-labelledby="fields-title">
        <h2 id="fields-title">{t('home.fields.title')}</h2>
        <ul className="field-grid">
          {CATEGORIES.map((category) => (
            <li key={category}>
              <Link to="/signup" className="field-card">
                <span className="field-icon"><CategoryIcon category={category} /></span>
                <span className="field-name">{t(`cat.${category}`)}</span>
                <span className="field-count">{t('home.fields.count', { count: simsPerField(category) })}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="scoring" aria-labelledby="scoring-title">
        <div>
          <h2 id="scoring-title">{t('home.scoring.title')}</h2>
          <p>{t('home.scoring.body')}</p>
        </div>
        <ScoreLegend large />
      </Section>

      <section className="home-cta">
        <h2>{t('home.cta.title')}</h2>
        <Link to="/signup" className="btn btn-sand btn-large btn-shine">{t('home.ctaPrimary')}</Link>
      </section>
    </div>
  );
}
