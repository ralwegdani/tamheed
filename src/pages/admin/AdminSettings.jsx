// Admin: platform settings. The daily AI limit and an announcement for all students.
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useToast } from '../../contexts/ToastContext';
import { saveSettings, logAdminAction } from '../../services/db';
import FormField from '../../components/FormField';
import Alert from '../../components/Alert';

export default function AdminSettings() {
  const { profile: admin, settings, refreshSettings } = useAuth();
  const { t } = usePreferences();
  const { showToast } = useToast();

  const [dailyLimit, setDailyLimit] = useState(String(settings.dailyLimit));
  const [text, setText] = useState(settings.announcement.text);
  const [active, setActive] = useState(settings.announcement.active);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    const limit = Number(dailyLimit);
    const newErrors = {
      dailyLimit: Number.isInteger(limit) && limit >= 1 && limit <= 50 ? '' : 'adm.set.limitError',
      text: text.length > 300 ? 'adm.set.textError' : active && !text.trim() ? 'adm.set.textEmpty' : '',
    };
    setErrors(newErrors);
    if (newErrors.dailyLimit || newErrors.text) return;

    setSaving(true);
    try {
      await saveSettings({ dailyLimit: limit, announcement: { text: text.trim(), active } });
      await logAdminAction(admin, 'log.settings');
      await refreshSettings();
      showToast(t('adm.set.saved'));
    } catch (err) {
      setSaveError(err.toText ? err.toText() : 'db.generic');
    }
    setSaving(false);
  }

  return (
    <form className="settings-grid" onSubmit={handleSubmit} noValidate>
      <section className="panel" aria-labelledby="limit-title">
        <h2 id="limit-title">{t('adm.set.limitTitle')}</h2>
        <p className="muted">{t('adm.set.limitText')}</p>
        <FormField id="daily-limit" type="number" min="1" max="50" label={t('adm.set.limitLabel')}
          value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} error={t(errors.dailyLimit)} />
      </section>

      <section className="panel" aria-labelledby="ann-title">
        <h2 id="ann-title">{t('adm.set.annTitle')}</h2>
        <p className="muted">{t('adm.set.annText')}</p>
        <FormField id="ann-text" as="textarea" rows={3} dir="auto" label={t('adm.set.annLabel')} maxLength={300}
          value={text} onChange={(e) => setText(e.target.value)} error={t(errors.text)}
          hint={t('adm.set.annHint', { now: text.length })} />
        <label className="switch">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span className="switch-track" aria-hidden="true"><span></span></span>
          {t('adm.set.annActive')}
        </label>
        {active && text.trim() && (
          <div className="announcement preview">
            <span className="announcement-label">{t('dash.announcement')}</span>
            <p dir="auto">{text}</p>
          </div>
        )}
      </section>

      <div className="settings-actions">
        <Alert type="error">{t(saveError)}</Alert>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? t('profile.saving') : t('adm.set.save')}
        </button>
      </div>
    </form>
  );
}
