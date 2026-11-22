import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useToast } from '../contexts/ToastContext';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirm,
  firebaseMessage,
} from '../utils/validation';

export default function Signup() {
  const { user, signup } = useAuth();
  const { t } = usePreferences();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && !loading) return <Navigate to="/dashboard" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const newErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: validateConfirm(form.password, form.confirm),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      showToast(t('welcome.toast', { name: form.name.trim().split(' ')[0] }));
      navigate('/dashboard');
    } catch (error) {
      // Our own errors (blocked account, database) carry a key; Firebase errors carry a code.
      setServerError(error.toText ? error.toText() : firebaseMessage(error));
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 id="signup-title">{t('signup.title')}</h1>
      <p className="auth-sub">{t('signup.sub')}</p>

      <Alert type="error">{t(serverError)}</Alert>

      <form onSubmit={handleSubmit} noValidate aria-labelledby="signup-title">
        <FormField id="name" name="name" label={t('signup.name')} autoComplete="name"
          value={form.name} onChange={handleChange} error={t(errors.name)} />
        <FormField id="email" name="email" type="email" dir="ltr" label={t('signup.email')} autoComplete="email"
          value={form.email} onChange={handleChange} error={t(errors.email)} />
        <FormField id="password" name="password" type="password" label={t('signup.password')}
          autoComplete="new-password" hint={t('signup.passwordHint')}
          value={form.password} onChange={handleChange} error={t(errors.password)} />
        <FormField id="confirm" name="confirm" type="password" label={t('signup.confirm')}
          autoComplete="new-password"
          value={form.confirm} onChange={handleChange} error={t(errors.confirm)} />

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? t('signup.submitting') : t('signup.submit')}
        </button>
      </form>

      <p className="auth-switch">
        {t('signup.haveAccount')} <Link to="/login">{t('signup.loginLink')}</Link>
      </p>
    </AuthLayout>
  );
}
