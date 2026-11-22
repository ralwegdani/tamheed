import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useToast } from '../contexts/ToastContext';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import { Avatar, RoleChip } from '../components/UserChips';
import { validateName, validatePassword, validateConfirm, firebaseMessage } from '../utils/validation';

export default function Profile() {
  const { user, isAdmin, updateName, changePassword } = useAuth();
  const { t } = usePreferences();
  const { showToast } = useToast();

  // Name form
  const [name, setName] = useState(user.displayName);
  const [nameError, setNameError] = useState('');
  const [nameServerError, setNameServerError] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordServerError, setPasswordServerError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleNameSubmit(e) {
    e.preventDefault();
    setNameServerError('');
    const error = validateName(name);
    setNameError(error);
    if (error) return;

    setSavingName(true);
    try {
      await updateName(name.trim());
      showToast(t('profile.nameSaved'));
    } catch (err) {
      setNameServerError(firebaseMessage(err));
    }
    setSavingName(false);
  }

  function handlePasswordChange(e) {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordServerError('');
    const errors = {
      current: passwords.current ? '' : 'v.currentRequired',
      next: validatePassword(passwords.next),
      confirm: validateConfirm(passwords.next, passwords.confirm),
    };
    setPasswordErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSavingPassword(true);
    try {
      await changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      showToast(t('profile.passwordChanged'));
    } catch (err) {
      setPasswordServerError(firebaseMessage(err));
    }
    setSavingPassword(false);
  }

  return (
    <div className="profile">
      <div className="profile-head">
        <Avatar name={user.displayName} size="lg" />
        <div>
          <h1>{t('profile.title')}</h1>
          <p className="page-sub">
            {user.displayName} · <RoleChip role={isAdmin ? 'admin' : 'student'} />
          </p>
        </div>
      </div>

      <div className="profile-grid">
        <section className="panel" aria-labelledby="account-title">
          <h2 id="account-title">{t('profile.account')}</h2>
          <Alert type="error">{t(nameServerError)}</Alert>
          <form onSubmit={handleNameSubmit} noValidate>
            <FormField id="profile-name" label={t('profile.name')} autoComplete="name"
              value={name} onChange={(e) => setName(e.target.value)} error={t(nameError)} />
            <FormField id="profile-email" label={t('profile.email')} value={user.email} readOnly dir="ltr"
              hint={t('profile.emailHint')} />
            <button type="submit" className="btn btn-primary" disabled={savingName}>
              {savingName ? t('profile.saving') : t('profile.saveName')}
            </button>
          </form>
        </section>

        <section className="panel" aria-labelledby="password-title">
          <h2 id="password-title">{t('profile.passwordTitle')}</h2>
          <Alert type="error">{t(passwordServerError)}</Alert>
          <form onSubmit={handlePasswordSubmit} noValidate>
            <FormField id="current" name="current" type="password" label={t('profile.current')}
              autoComplete="current-password" value={passwords.current}
              onChange={handlePasswordChange} error={t(passwordErrors.current)} />
            <FormField id="next" name="next" type="password" label={t('profile.new')}
              autoComplete="new-password" hint={t('signup.passwordHint')}
              value={passwords.next} onChange={handlePasswordChange} error={t(passwordErrors.next)} />
            <FormField id="confirm-new" name="confirm" type="password" label={t('profile.repeat')}
              autoComplete="new-password" value={passwords.confirm}
              onChange={handlePasswordChange} error={t(passwordErrors.confirm)} />
            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              {savingPassword ? t('profile.changing') : t('profile.change')}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
