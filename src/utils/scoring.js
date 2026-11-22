// Checks Gemini's reply and calculates the final score.
// Gemini gives a score per criterion. Our code decides the overall score.
import AppError from './AppError';

// Overall score from 0 to 100, using the criterion weights.
export function calculateOverall(criteria) {
  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight), 0);
  if (totalWeight === 0) return 0;
  const weighted = criteria.reduce((sum, c) => sum + (c.score / 10) * Number(c.weight), 0);
  return Math.round((weighted / totalWeight) * 100);
}

function isTextList(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

// Makes sure the AI reply has every criterion with a score from 0 to 10.
// Throws an error if anything is missing, so we never save a broken result.
export function validateEvaluation(data, rubric) {
  if (!data || !Array.isArray(data.criteria)) {
    throw new AppError('api.incomplete');
  }

  const criteria = rubric.map((criterion) => {
    const found = data.criteria.find((c) => c.criterion_id === criterion.id);
    const score = Number(found?.score);
    if (!found || Number.isNaN(score) || score < 0 || score > 10) {
      throw new AppError('api.missingScore');
    }
    return { ...criterion, score: Math.round(score), reason: String(found.reason || '') };
  });

  if (!isTextList(data.strengths) || !isTextList(data.improvements) || !isTextList(data.recommendations)) {
    throw new AppError('api.incomplete');
  }

  return {
    criteria,
    overall: calculateOverall(criteria),
    strengths: data.strengths,
    improvements: data.improvements,
    feedback: String(data.feedback || ''),
    recommendations: data.recommendations,
  };
}

// The same three levels and colors are used everywhere in the app.
//   low  (red):    0 to 49   -> Needs improvement
//   mid  (yellow): 50 to 74  -> Developing
//   high (green):  75 to 100 -> Good / Excellent
// percent is a score from 0 to 100. A criterion score of 7/10 is 70.
export function scoreLevel(percent) {
  if (percent >= 75) return 'high';
  if (percent >= 50) return 'mid';
  return 'low';
}
