// Admin: one user's profile, numbers, results and the actions an admin can take.
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useToast } from '../../contexts/ToastContext';
import {
  getUser,
  getUserResults,
  getAllSimulations,
  updateUserByAdmin,
  resetUserUsage,
  sendPasswordReset,
  deleteUserResults,
  logAdminAction,
  usedToday,
} from '../../services/db';
import { localizeSimulation, labelOf } from '../../utils/localize';
import { scoreLevel } from '../../utils/scoring';
import useAsync from '../../components/useAsync';
import ConfirmButton from '../../components/ConfirmButton';
import ScoreBadge from '../../components/ScoreBadge';
import SkillChart from '../../components/SkillChart';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import { RoleChip, StatusChip, Avatar } from '../../components/UserChips';
export default function AdminUserDetail() {
  const { uid } = useParams();
  const { profile: admin, settings } = useAuth();
  const { t, language, formatDate } = usePreferences();
  const { showToast } = useToast();
  const [actionError, setActionError] = useState('');

  const { data, loading, error, reload } = useAsync(
    () => Promise.all([getUser(uid), getUserResults(uid), getAllSimulations()]),
    [uid]
  );

  if (loading) return <Loader />;
  if (error) return <Alert type="error">{t(error)}</Alert>;

  const [person, results, simulations] = data;
  if (!person) {
    return (
      <EmptyState title={t('adm.user.notFound')}>
        <Link to="/admin/users" className="btn btn-primary">{t('adm.user.back')}</Link>
      </EmptyState>
    );
  }

  const isSelf = person.uid === admin.uid; // admins cannot block or demote themselves
  const average = results.length ? Math.round(results.reduce((s, r) => s + r.overall, 0) / results.length) : null;
  const titleOf = (r) =>
    localizeSimulation(simulations.find((s) => s.id === r.simulationId), language)?.title || r.simulationTitle;

  // Runs an admin action, writes it to the admin log, shows a message and reloads.
  async function act(task, logKey, toastKey) {
    setActionError('');
    try {
      await task();
      await logAdminAction(admin, logKey, person.name);
      showToast(t(toastKey, { name: person.name }));
      await reload();
    } catch (err) {
      setActionError(err.toText ? err.toText() : 'db.generic');
    }
  }

  const blocked = person.status === 'blocked';
  const isAdminUser = person.role === 'admin';

  return (
    <div className="user-detail">
      <Link to="/admin/users" className="back-link">{t('adm.user.back')}</Link>

      <header className="user-head panel">
        <Avatar name={person.name} size="lg" />
        <div className="user-head-text">
          <h2>{person.name}</h2>
          <p className="muted" dir="ltr">{person.email}</p>
          <div className="chip-row">
            <RoleChip role={person.role} />
            <StatusChip status={person.status} />
          </div>
        </div>
        <dl className="user-facts">
          <div><dt>{t('adm.user.joined')}</dt><dd>{formatDate(person.createdAt)}</dd></div>
          <div><dt>{t('adm.users.colActive')}</dt><dd>{formatDate(person.lastActiveAt, true)}</dd></div>
          <div><dt>{t('adm.users.colAttempts')}</dt><dd>{results.length}</dd></div>
          <div>
            <dt>{t('dash.average')}</dt>
            <dd>{average === null ? '-' : <ScoreBadge score={average} />}</dd>
          </div>
          <div><dt>{t('adm.user.usedToday')}</dt><dd>{usedToday(person)} / {settings.dailyLimit}</dd></div>
        </dl>
      </header>

      <Alert type="error">{t(actionError)}</Alert>

      <section className="panel" aria-labelledby="actions-title">
        <h2 id="actions-title">{t('adm.user.actions')}</h2>
        {isSelf && <p className="muted small">{t('adm.user.selfNote')}</p>}
        <div className="action-grid">
          <div className="action">
            <div>
              <h3>{blocked ? t('adm.act.unblock') : t('adm.act.block')}</h3>
              <p>{blocked ? t('adm.act.unblockText') : t('adm.act.blockText')}</p>
            </div>
            {blocked ? (
              <button type="button" className="btn btn-primary btn-small"
                onClick={() => act(() => updateUserByAdmin(uid, { status: 'active' }), 'log.unblocked', 'adm.toast.unblocked')}>
                {t('adm.act.unblock')}
              </button>
            ) : (
              <ConfirmButton danger disabled={isSelf}
                onConfirm={() => act(() => updateUserByAdmin(uid, { status: 'blocked' }), 'log.blocked', 'adm.toast.blocked')}>
                {t('adm.act.block')}
              </ConfirmButton>
            )}
          </div>

          <div className="action">
            <div>
              <h3>{isAdminUser ? t('adm.act.demote') : t('adm.act.promote')}</h3>
              <p>{isAdminUser ? t('adm.act.demoteText') : t('adm.act.promoteText')}</p>
            </div>
            <ConfirmButton disabled={isSelf}
              onConfirm={() =>
                isAdminUser
                  ? act(() => updateUserByAdmin(uid, { role: 'student' }), 'log.demoted', 'adm.toast.demoted')
                  : act(() => updateUserByAdmin(uid, { role: 'admin' }), 'log.promoted', 'adm.toast.promoted')
              }>
              {isAdminUser ? t('adm.act.demote') : t('adm.act.promote')}
            </ConfirmButton>
          </div>

          <div className="action">
            <div>
              <h3>{t('adm.act.resetUsage')}</h3>
              <p>{t('adm.act.resetUsageText')}</p>
            </div>
            <button type="button" className="btn btn-ghost btn-small"
              onClick={() => act(() => resetUserUsage(uid), 'log.usageReset', 'adm.toast.usageReset')}>
              {t('adm.act.resetUsage')}
            </button>
          </div>

          <div className="action">
            <div>
              <h3>{t('adm.act.resetPassword')}</h3>
              <p>{t('adm.act.resetPasswordText')}</p>
            </div>
            <button type="button" className="btn btn-ghost btn-small"
              onClick={() => act(() => sendPasswordReset(person.email), 'log.resetEmail', 'adm.toast.resetEmail')}>
              {t('adm.act.resetPassword')}
            </button>
          </div>

          <div className="action action-danger">
            <div>
              <h3>{t('adm.act.deleteResults')}</h3>
              <p>{t('adm.act.deleteResultsText')}</p>
            </div>
            <ConfirmButton danger disabled={results.length === 0}
              onConfirm={() => act(() => deleteUserResults(uid), 'log.resultsDeleted', 'adm.toast.resultsDeleted')}>
              {t('adm.act.deleteResults')}
            </ConfirmButton>
          </div>
        </div>
      </section>

      <div className="charts">
        <section className="panel" aria-labelledby="u-skills-title">
          <h2 id="u-skills-title">{t('dash.skills.title')}</h2>
          {results.length === 0 ? <p className="muted">{t('dash.skills.empty')}</p> : <SkillChart results={results} />}
        </section>

        <section className="panel" aria-labelledby="u-results-title">
          <h2 id="u-results-title">{t('dash.results.title')}</h2>
          {results.length === 0 ? (
            <p className="muted">{t('adm.user.noResults')}</p>
          ) : (
            <ul className="activity-list">
              {results.map((r) => (
                <li key={r.id} className={`level-${scoreLevel(r.overall)}`}>
                  <Link to={`/results/${r.id}`} className="activity-main">{titleOf(r)}</Link>
                  <span className="muted small">
                    {labelOf(t, 'cat', r.category)} · {formatDate(r.createdAt)}
                  </span>
                  <ScoreBadge score={r.overall} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
