import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import { validateEmail, firebaseMessage } from '../utils/validation';

export default function Login() {
  const { user, login, blockedNotice } = useAuth();
  const { t } = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  // Go back to the page the user wanted before login, or the dashboard.
  const goTo = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && !loading) return <Navigate to={goTo} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const newErrors = {
      email: validateEmail(email),
      password: password ? '' : 'v.loginPassword',
    };
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(goTo, { replace: true });
    } catch (error) {
      // Our own errors (blocked account, database) carry a key; Firebase errors carry a code.
      setServerError(error.toText ? error.toText() : firebaseMessage(error));
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 id="login-title">{t('login.title')}</h1>
      <p className="auth-sub">{t('login.sub')}</p>

      {blockedNotice && !serverError && <Alert type="error">{t('auth.blocked')}</Alert>}
      <Alert type="error">{t(serverError)}</Alert>

      <form onSubmit={handleSubmit} noValidate aria-labelledby="login-title">
        <FormField id="email" type="email" dir="ltr" label={t('login.email')} autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} error={t(errors.email)} />
        <FormField id="password" type="password" label={t('login.password')} autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} error={t(errors.password)} />

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? t('login.submitting') : t('login.submit')}
        </button>
      </form>

      <p className="auth-switch">
        {t('login.noAccount')} <Link to="/signup">{t('login.signupLink')}</Link>
      </p>
    </AuthLayout>
  );
}
