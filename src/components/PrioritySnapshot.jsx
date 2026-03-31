import { initiatives, BET_COLORS, MAX_SCORE } from '../data/priorityData';
import './PrioritySnapshot.css';

const TIER_LABEL = score =>
  score >= 9 ? { label: 'Top Priority', cls: 'tier-top' }
  : score >= 6 ? { label: 'High', cls: 'tier-high' }
  : score >= 4 ? { label: 'Medium', cls: 'tier-med' }
  : { label: 'Lower', cls: 'tier-low' };

export default function PrioritySnapshot() {
  return (
    <div className="priority-snapshot">
      <div className="ps-header">
        <div className="ps-title">Draft Priority Scores</div>
        <div className="ps-sub">All 21 initiatives ranked by draft score · Pending team scoring session</div>
      </div>

      <div className="ps-disclaimer">
        These are draft scores to spark the conversation — not final. Use the team scoring session to calibrate.
      </div>

      <div className="ps-table">
        <div className="ps-table-head">
          <span>Initiative</span>
          <span className="ps-th-factors">RI · Co · SF · Ef</span>
          <span>Score</span>
          <span>Impact</span>
        </div>
        {initiatives.map((item, i) => {
          const { label, cls } = TIER_LABEL(item.score);
          const barPct = (item.score / MAX_SCORE) * 100;
          const color = BET_COLORS[item.bet];
          return (
            <div key={i} className={`ps-row ${i === 0 || (i > 0 && initiatives[i-1].score !== item.score && item.score === MAX_SCORE) ? 'ps-row-top' : ''}`}>
              <div className="ps-rank" style={{ color }}>{i + 1}</div>
              <div className="ps-name-col">
                <span className="ps-bet-dot" style={{ background: color }} />
                <span className="ps-bet-lbl" style={{ color }}>B{item.bet}</span>
                <span className="ps-name">{item.name}</span>
              </div>
              <div className="ps-factors">
                <span title="Retention Impact">{item.ri}</span>
                <span className="ps-dot">·</span>
                <span title="Confidence">{item.co}</span>
                <span className="ps-dot">·</span>
                <span title="Strategic Fit">{item.sf}</span>
                <span className="ps-dot">·</span>
                <span title="Effort (1=large, 3=quick)">{item.ef}</span>
              </div>
              <div className="ps-score-col">
                <span className="ps-score-val">{item.score}</span>
                <span className={`ps-tier ${cls}`}>{label}</span>
              </div>
              <div className="ps-bar-col">
                <div className="ps-bar-track">
                  <div className="ps-bar-fill" style={{ width: `${barPct}%`, background: color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="ps-legend">
        <span className="ps-tier tier-top">Top Priority</span> ≥ 9 &nbsp;·&nbsp;
        <span className="ps-tier tier-high">High</span> 6–8 &nbsp;·&nbsp;
        <span className="ps-tier tier-med">Medium</span> 4–5 &nbsp;·&nbsp;
        <span className="ps-tier tier-low">Lower</span> &lt; 4
      </div>
    </div>
  );
}

export function ScoreBadge({ bet, num }) {
  const item = initiatives.find(i => i.bet === bet && i.num === num);
  if (!item) return null;
  const { cls } = TIER_LABEL(item.score);
  const barPct = (item.score / MAX_SCORE) * 100;
  return (
    <div className="score-badge">
      <span className={`score-badge-val ${cls}`}>{item.score}</span>
      <div className="score-badge-bar">
        <div className="score-badge-fill" style={{ width: `${barPct}%`, background: BET_COLORS[bet] }} />
      </div>
      <span className="score-badge-label">RI{item.ri}·Co{item.co}·SF{item.sf}·Ef{item.ef}</span>
    </div>
  );
}
