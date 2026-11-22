// A small colored score pill, for tables and cards. score is 0 to 100.
import { scoreLevel } from '../utils/scoring';

export default function ScoreBadge({ score, children }) {
  return <span className={`score-pill level-${scoreLevel(score)}`}>{children ?? score}</span>;
}
