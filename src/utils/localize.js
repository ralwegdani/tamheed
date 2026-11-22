// Returns a simulation in the chosen language.
// Built-in simulations have Arabic text in data/simulations-ar.js.
// Simulations added or edited by the admin keep the text the admin wrote.
import { SIMULATIONS_AR } from '../data/simulations-ar';

export function localizeSimulation(simulation, language) {
  if (!simulation || language !== 'ar' || simulation.edited) return simulation;
  const arabic = SIMULATIONS_AR[simulation.id];
  if (!arabic) return simulation;

  return {
    ...simulation,
    title: arabic.title,
    from: arabic.from,
    summary: arabic.summary,
    scenario: arabic.scenario,
    task: arabic.task,
    criteria: simulation.criteria.map((criterion, i) => ({
      ...criterion,
      name: arabic.criteria[i]?.name || criterion.name,
      description: arabic.criteria[i]?.description || criterion.description,
    })),
  };
}

// Category, level and skill names are translated with t(). Unknown names
// (typed by an admin) are shown as they are.
export function labelOf(t, prefix, value) {
  const key = `${prefix}.${value}`;
  const text = t(key);
  return text === key ? value : text;
}
