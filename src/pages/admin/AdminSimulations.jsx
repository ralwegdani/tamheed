// Admin: add, edit, hide and remove simulations. Changes are saved in Firestore,
// so every student sees them on every device.
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useToast } from '../../contexts/ToastContext';
import {
  getAllSimulations,
  saveSimulation,
  setSimulationHidden,
  removeSimulationChanges,
  logAdminAction,
} from '../../services/db';
import { localizeSimulation } from '../../utils/localize';
import { CATEGORIES, DIFFICULTIES } from '../../data/simulations';
import useAsync from '../../components/useAsync';
import FormField from '../../components/FormField';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import CategoryIcon from '../../components/CategoryIcon';
import ConfirmButton from '../../components/ConfirmButton';

const EMPTY_CRITERION = { name: '', skill: '', weight: '', description: '' };

function emptySimulation() {
  return {
    id: '',
    title: '',
    category: CATEGORIES[0],
    difficulty: DIFFICULTIES[0],
    from: '',
    summary: '',
    scenario: '',
    task: '',
    criteria: [{ ...EMPTY_CRITERION }],
  };
}

// Checks the simulation form. Returns an object of translation keys.
function validateSimulation(sim) {
  const errors = {};
  if (sim.title.trim().length < 5) errors.title = 'av.title';
  if (sim.summary.trim().length < 10) errors.summary = 'av.summary';
  if (sim.scenario.trim().length < 50) errors.scenario = 'av.scenario';
  if (sim.task.trim().length < 20) errors.task = 'av.task';

  const criteriaErrors = sim.criteria.map((c) => {
    const e = {};
    if (!c.name.trim()) e.name = 'av.cName';
    if (!c.skill.trim()) e.skill = 'av.cSkill';
    const weight = Number(c.weight);
    if (!Number.isInteger(weight) || weight < 1 || weight > 100) e.weight = 'av.cWeight';
    if (c.description.trim().length < 10) e.description = 'av.cDesc';
    return e;
  });
  if (criteriaErrors.some((e) => Object.keys(e).length)) errors.criteria = criteriaErrors;

  const total = sim.criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);
  if (total !== 100) errors.total = { key: 'av.total', vars: { total } };
  return errors;
}

export default function AdminSimulations() {
  const { profile: admin } = useAuth();
  const { t, language } = usePreferences();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(null); // the simulation in the form, or null
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: simulations, loading, error, reload } = useAsync(() => getAllSimulations(), []);

  const titleOf = (sim) => localizeSimulation(sim, language).title;

  // Runs a change, writes it to the admin log, shows a message and reloads the list.
  async function act(task, logKey, toastText, target) {
    setSaveError('');
    try {
      await task();
      await logAdminAction(admin, logKey, target);
      showToast(toastText);
      await reload();
      return true;
    } catch (err) {
      setSaveError(err.toText ? err.toText() : 'db.generic');
      return false;
    }
  }

  function startNew() {
    setErrors({});
    setSaveError('');
    setEditing(emptySimulation());
  }

  // The form edits the original text (English for built-in simulations).
  function startEdit(sim) {
    setErrors({});
    setSaveError('');
    setEditing({ ...sim, criteria: sim.criteria.map((c) => ({ ...c })) });
  }

  function updateField(e) {
    setEditing({ ...editing, [e.target.name]: e.target.value });
  }

  function updateCriterion(index, field, value) {
    const criteria = editing.criteria.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    setEditing({ ...editing, criteria });
  }

  function addCriterion() {
    setEditing({ ...editing, criteria: [...editing.criteria, { ...EMPTY_CRITERION }] });
  }

  function removeCriterion(index) {
    setEditing({ ...editing, criteria: editing.criteria.filter((_, i) => i !== index) });
  }

  async function handleSave(e) {
    e.preventDefault();
    const newErrors = validateSimulation(editing);
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    const isNew = !editing.id;
    const clean = {
      ...editing,
      id: editing.id || `custom-${Date.now().toString(36)}`,
      title: editing.title.trim(),
      from: editing.from.trim() || t('admin.fFromPlaceholder'),
      summary: editing.summary.trim(),
      scenario: editing.scenario.trim(),
      task: editing.task.trim(),
      criteria: editing.criteria.map((c, i) => ({
        id: `c${i + 1}`, // numbered again so ids never repeat
        name: c.name.trim(),
        skill: c.skill.trim(),
        weight: Number(c.weight),
        description: c.description.trim(),
      })),
    };

    setSaving(true);
    const ok = await act(
      () => saveSimulation(clean),
      isNew ? 'log.simAdded' : 'log.simSaved',
      t(isNew ? 'admin.added' : 'admin.saved'),
      clean.title
    );
    setSaving(false);
    if (ok) setEditing(null);
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="section-head">
        <h2>{t('admin.title')}</h2>
        {!editing && <button type="button" className="btn btn-primary" onClick={startNew}>{t('admin.add')}</button>}
      </div>

      <Alert type="info">{t('admin.note')}</Alert>
      <Alert type="error">{t(error || saveError)}</Alert>

      {editing ? (
        <form className="panel admin-form" onSubmit={handleSave} noValidate>
          <h2>{editing.id ? t('admin.editTitle') : t('admin.newTitle')}</h2>

          <FormField id="sim-title" name="title" label={t('admin.fTitle')} dir="auto" value={editing.title}
            onChange={updateField} error={t(errors.title)} />
          <div className="form-row">
            <FormField id="sim-category" name="category" as="select" label={t('admin.fField')}
              value={editing.category} onChange={updateField}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
            </FormField>
            <FormField id="sim-level" name="difficulty" as="select" label={t('admin.fLevel')}
              value={editing.difficulty} onChange={updateField}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{t(`diff.${d}`)}</option>)}
            </FormField>
            <FormField id="sim-from" name="from" label={t('admin.fFrom')} dir="auto"
              placeholder={t('admin.fFromPlaceholder')} value={editing.from} onChange={updateField} />
          </div>
          <FormField id="sim-summary" name="summary" label={t('admin.fSummary')} dir="auto" value={editing.summary}
            onChange={updateField} error={t(errors.summary)} />
          <FormField id="sim-scenario" name="scenario" as="textarea" rows={4} label={t('admin.fScenario')}
            dir="auto" value={editing.scenario} onChange={updateField} error={t(errors.scenario)} />
          <FormField id="sim-task" name="task" as="textarea" rows={3} label={t('admin.fTask')}
            dir="auto" value={editing.task} onChange={updateField} error={t(errors.task)} />

          <fieldset className="criteria-set">
            <legend>{t('admin.criteria')}</legend>
            {editing.criteria.map((c, i) => {
              const ce = errors.criteria?.[i] || {};
              return (
                <div className="criterion-row" key={i}>
                  <FormField id={`c-name-${i}`} label={t('admin.cName')} dir="auto" value={c.name} error={t(ce.name)}
                    onChange={(e) => updateCriterion(i, 'name', e.target.value)} />
                  <FormField id={`c-skill-${i}`} label={t('admin.cSkill')} dir="auto" value={c.skill} error={t(ce.skill)}
                    onChange={(e) => updateCriterion(i, 'skill', e.target.value)} />
                  <FormField id={`c-weight-${i}`} type="number" min="1" max="100" label={t('admin.cWeight')}
                    value={c.weight} error={t(ce.weight)}
                    onChange={(e) => updateCriterion(i, 'weight', e.target.value)} />
                  <FormField id={`c-desc-${i}`} label={t('admin.cDesc')} dir="auto" value={c.description}
                    error={t(ce.description)}
                    onChange={(e) => updateCriterion(i, 'description', e.target.value)} />
                  {editing.criteria.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-small" onClick={() => removeCriterion(i)}>
                      {t('admin.removeCriterion')}
                    </button>
                  )}
                </div>
              );
            })}
            {errors.total && <p className="field-error">{t(errors.total)}</p>}
            {editing.criteria.length < 5 && (
              <button type="button" className="btn btn-ghost" onClick={addCriterion}>{t('admin.addCriterion')}</button>
            )}
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? t('profile.saving') : t('admin.save')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>{t('admin.cancel')}</button>
          </div>
        </form>
      ) : (
        <div className="table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                <th scope="col">{t('admin.colTitle')}</th>
                <th scope="col">{t('admin.colField')}</th>
                <th scope="col">{t('admin.colLevel')}</th>
                <th scope="col">{t('admin.colStatus')}</th>
                <th scope="col"><span className="visually-hidden">{t('admin.colActions')}</span></th>
              </tr>
            </thead>
            <tbody>
              {(simulations || []).map((sim) => (
                <tr key={sim.id} className={sim.hidden ? 'row-muted' : ''}>
                  <td className="cell-strong">
                    <span className="cell-icon"><CategoryIcon category={sim.category} /></span>
                    {titleOf(sim)}
                    {sim.isCustom && <span className="new-tag">{t('admin.newTag')}</span>}
                    {sim.isChanged && <span className="new-tag tag-edited">{t('admin.editedTag')}</span>}
                  </td>
                  <td>{t(`cat.${sim.category}`)}</td>
                  <td>{t(`diff.${sim.difficulty}`)}</td>
                  <td>
                    <span className={sim.hidden ? 'status status-hidden' : 'status status-visible'}>
                      {sim.hidden ? t('admin.hidden') : t('admin.visible')}
                    </span>
                  </td>
                  <td className="row-actions">
                    <button type="button" className="btn btn-ghost btn-small" onClick={() => startEdit(sim)}>{t('admin.edit')}</button>
                    <button type="button" className="btn btn-ghost btn-small"
                      onClick={() =>
                        act(
                          () => setSimulationHidden(sim.id, !sim.hidden),
                          sim.hidden ? 'log.simShown' : 'log.simHidden',
                          t(sim.hidden ? 'admin.nowVisible' : 'admin.nowHidden', { title: titleOf(sim) }),
                          titleOf(sim)
                        )
                      }>
                      {sim.hidden ? t('admin.show') : t('admin.hide')}
                    </button>
                    {(sim.isCustom || sim.isChanged) && (
                      <ConfirmButton danger
                        onConfirm={() =>
                          act(
                            () => removeSimulationChanges(sim.id),
                            sim.isCustom ? 'log.simRemoved' : 'log.simReset',
                            t(sim.isCustom ? 'admin.removed' : 'admin.resetDone'),
                            titleOf(sim)
                          )
                        }>
                        {sim.isCustom ? t('admin.remove') : t('admin.reset')}
                      </ConfirmButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
