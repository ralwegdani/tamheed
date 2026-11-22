// Admin: list of all users with search, filters, sorting and CSV export.
import { useState } from 'react';
import { Link } from 'react-router';
import { usePreferences } from '../../contexts/PreferencesContext';
import { getAllUsers, getAllResults } from '../../services/db';
import { downloadCSV } from '../../utils/csv';
import useAsync from '../../components/useAsync';
import FormField from '../../components/FormField';
import ScoreBadge from '../../components/ScoreBadge';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import { RoleChip, StatusChip, Avatar } from '../../components/UserChips';

export default function AdminUsers() {
  const { t, formatDate } = usePreferences();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');

  const { data, loading, error } = useAsync(() => Promise.all([getAllUsers(), getAllResults()]), []);

  if (loading) return <Loader />;
  if (error) return <Alert type="error">{t(error)}</Alert>;

  const [users, results] = data;

  // Add each user's number of results and average score
  const rows = users.map((u) => {
    const mine = results.filter((r) => r.uid === u.uid);
    const average = mine.length ? Math.round(mine.reduce((s, r) => s + r.overall, 0) / mine.length) : null;
    return { ...u, attempts: mine.length, average };
  });

  const text = search.trim().toLowerCase();
  const shown = rows
    .filter((u) => !text || u.name.toLowerCase().includes(text) || u.email.includes(text))
    .filter((u) => !role || u.role === role)
    .filter((u) => !status || u.status === status)
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'average') return (b.average ?? -1) - (a.average ?? -1);
      if (sort === 'active') return b.lastActiveAt.localeCompare(a.lastActiveAt);
      return b.createdAt.localeCompare(a.createdAt); // newest
    });

  function exportUsers() {
    downloadCSV('tamheed-users.csv', [
      ['Name', 'Email', 'Role', 'Status', 'Joined', 'Last active', 'Attempts', 'Average'],
      ...shown.map((u) => [u.name, u.email, u.role, u.status, u.createdAt, u.lastActiveAt, u.attempts, u.average ?? '']),
    ]);
  }

  function exportResults() {
    downloadCSV('tamheed-results.csv', [
      ['Student', 'Email', 'Simulation', 'Field', 'Level', 'Overall', 'Language', 'Date'],
      ...results.map((r) => [r.userName, r.userEmail, r.simulationTitle, r.category, r.difficulty, r.overall, r.language || 'en', r.createdAt]),
    ]);
  }

  return (
    <div>
      <div className="filters filters-users">
        <FormField id="user-search" type="search" label={t('adm.users.search')} placeholder={t('adm.users.searchPlaceholder')}
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <FormField id="user-role" as="select" label={t('adm.users.role')} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">{t('adm.users.all')}</option>
          <option value="student">{t('role.student')}</option>
          <option value="admin">{t('role.admin')}</option>
        </FormField>
        <FormField id="user-status" as="select" label={t('adm.users.status')} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t('adm.users.all')}</option>
          <option value="active">{t('status.active')}</option>
          <option value="blocked">{t('status.blocked')}</option>
        </FormField>
        <FormField id="user-sort" as="select" label={t('adm.users.sort')} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">{t('adm.users.sortNewest')}</option>
          <option value="active">{t('adm.users.sortActive')}</option>
          <option value="name">{t('adm.users.sortName')}</option>
          <option value="average">{t('adm.users.sortAverage')}</option>
        </FormField>
      </div>

      <div className="list-toolbar">
        <p className="result-count" aria-live="polite">{t('adm.users.count', { count: shown.length })}</p>
        <div className="toolbar-actions">
          <button type="button" className="btn btn-ghost btn-small" onClick={exportUsers}>{t('adm.users.exportUsers')}</button>
          <button type="button" className="btn btn-ghost btn-small" onClick={exportResults}>{t('adm.users.exportResults')}</button>
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState text={t('adm.users.empty')} />
      ) : (
        <div className="table-wrap">
          <table className="results-table users-table">
            <thead>
              <tr>
                <th scope="col">{t('adm.users.colUser')}</th>
                <th scope="col">{t('adm.users.role')}</th>
                <th scope="col">{t('adm.users.status')}</th>
                <th scope="col">{t('adm.users.colAttempts')}</th>
                <th scope="col">{t('dash.average')}</th>
                <th scope="col">{t('adm.users.colActive')}</th>
                <th scope="col"><span className="visually-hidden">{t('table.open')}</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.uid} className={u.status === 'blocked' ? 'row-muted' : ''}>
                  <td>
                    <div className="user-cell">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <div className="cell-strong">{u.name}</div>
                        <div className="muted small" dir="ltr">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><RoleChip role={u.role} /></td>
                  <td><StatusChip status={u.status} /></td>
                  <td>{u.attempts}</td>
                  <td>{u.average === null ? '-' : <ScoreBadge score={u.average} />}</td>
                  <td>{formatDate(u.lastActiveAt)}</td>
                  <td><Link to={`/admin/users/${u.uid}`}>{t('adm.users.manage')}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
