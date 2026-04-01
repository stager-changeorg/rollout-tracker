import { useParams, Link } from 'react-router-dom';
import { markets, JIRA_EPIC, AXOLOTL_EPIC } from '../data/rolloutData';
import AnalyticsInsights from './AnalyticsInsights';
import './Rollout.css';
import './MarketDetail.css';

const CheckIcon = () => (
  <svg viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const DotIcon = () => (
  <svg viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="2.5" fill="#fff"/>
  </svg>
);

function connectorClass(steps, i) {
  if (i >= steps.length - 1) return '';
  const prev = steps[i].state;
  const next = steps[i + 1].state;
  if (prev === 'done' || prev === 'live') return 'done';
  if ((prev === 'active' || prev === 'warn') && (next === 'active' || next === 'warn')) return 'active';
  if (prev === 'warn') return 'active';
  return '';
}

function PipelineStep({ step }) {
  const { state, label, note } = step;
  const iconClass = state === 'done' || state === 'live' ? 'done'
    : state === 'active' || state === 'warn' ? 'active'
    : 'pending';
  const iconStyle = state === 'live' ? { background: 'var(--live)' } : {};
  const labelStyle = state === 'live' ? { color: 'var(--live)', fontWeight: 700 }
    : state === 'active' ? { color: 'var(--progress)' }
    : state === 'warn' ? { color: 'var(--warning)' }
    : {};

  return (
    <div className="pipeline-step">
      <div className={`step-icon ${iconClass}`} style={iconStyle}>
        {(state === 'done' || state === 'live') && <CheckIcon />}
        {(state === 'active' || state === 'warn') && <DotIcon />}
      </div>
      <span className={`step-label${state === 'pending' ? ' pending' : ''}`} style={labelStyle}>
        {label}
        {note && <span className="step-note"> — {note}</span>}
      </span>
    </div>
  );
}

function statusColor(status) {
  if (status === 'Closed' || status === 'Done') return '#059669';
  if (status === 'ToDo') return '#6b7280';
  return '#d97706';
}

function priorityColor(priority) {
  if (!priority) return '#9ca3af';
  const p = priority.toLowerCase();
  if (p === 'p1' || p === 'highest' || p === 'critical') return '#dc2626';
  if (p === 'p2' || p === 'high') return '#ea580c';
  if (p === 'p3' || p === 'medium') return '#d97706';
  return '#6b7280';
}

function formatRelativeDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function JiraTicketRow({ ticket, relation }) {
  const color = statusColor(ticket.status);
  const pColor = priorityColor(ticket.priority);
  const hasDetails = ticket.description || ticket.latestComment;

  return (
    <div className="jira-ticket-card">
      <a href={ticket.url} target="_blank" rel="noopener noreferrer" className="jira-ticket-row">
        <span className="jira-key">{ticket.key}</span>
        <span className="jira-summary">{ticket.summary}</span>
        {relation && <span className="jira-relation">{relation}</span>}
        <div className="jira-ticket-meta">
          {ticket.priority && (
            <span className="jira-priority" style={{ color: pColor, borderColor: pColor + '44', background: pColor + '11' }}>
              {ticket.priority}
            </span>
          )}
          <span className="jira-status" style={{ color, borderColor: color + '44', background: color + '11' }}>
            {ticket.status}
          </span>
          <span className="jira-assignee">{ticket.assignee}</span>
          {ticket.updatedAt && (
            <span className="jira-updated">updated {formatRelativeDate(ticket.updatedAt)}</span>
          )}
        </div>
      </a>
      {hasDetails && (
        <div className="jira-ticket-details">
          {ticket.description && (
            <div className="jira-description">{ticket.description}</div>
          )}
          {ticket.latestComment && (
            <div className="jira-comment">
              <span className="jira-comment-author">{ticket.latestComment.author}</span>
              <span className="jira-comment-date">{formatRelativeDate(ticket.latestComment.created)}</span>
              <span className="jira-comment-body">{ticket.latestComment.body}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BugTicketRow({ ticket }) {
  const color = statusColor(ticket.status);
  const pColor = priorityColor(ticket.priority);
  const isOpen = ticket.status !== 'Closed' && ticket.status !== 'Done';
  return (
    <div className="bug-ticket-card">
      <a href={ticket.url} target="_blank" rel="noopener noreferrer" className="bug-ticket-row">
        <div className="bug-ticket-top">
          <span className="bug-ticket-key">{ticket.key}</span>
          {isOpen && <span className="bug-ticket-critical">OPEN</span>}
          {ticket.priority && (
            <span className="bug-ticket-priority" style={{ color: pColor, borderColor: pColor + '44', background: pColor + '11' }}>
              {ticket.priority}
            </span>
          )}
          <span
            className="bug-ticket-status"
            style={{ color, borderColor: color + '55', background: color + '15' }}
          >
            {ticket.status}
          </span>
          {ticket.updatedAt && (
            <span className="jira-updated">updated {formatRelativeDate(ticket.updatedAt)}</span>
          )}
        </div>
        <div className="bug-ticket-summary">{ticket.summary}</div>
        {ticket.assignee && (
          <div className="bug-ticket-assignee">Assigned to {ticket.assignee}</div>
        )}
      </a>
      {ticket.latestComment && (
        <div className="jira-comment" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
          <span className="jira-comment-author">{ticket.latestComment.author}</span>
          <span className="jira-comment-date">{formatRelativeDate(ticket.latestComment.created)}</span>
          <span className="jira-comment-body">{ticket.latestComment.body}</span>
        </div>
      )}
    </div>
  );
}

export default function MarketDetail() {
  const { market: marketCode } = useParams();
  const market = markets[marketCode];

  if (!market) {
    return (
      <div className="rollout-root">
        <div className="detail-root">
          <div className="detail-not-found">
            <Link to="/rollout" className="detail-back">← Back to Rollout</Link>
            <h2>Market "{marketCode}" not found</h2>
          </div>
        </div>
      </div>
    );
  }

  const openBugs = market.bugs.filter(b => b.type !== 'passed');
  const passedBugs = market.bugs.filter(b => b.type === 'passed');

  const dateLabel = market.status === 'live' ? 'Launch Date' : 'Target Launch';
  const dateVal = market.status === 'live' ? market.launchDate
    : market.status === 'delayed' ? `${market.targetDate} ↗ (was ${market.originalDate})`
    : market.targetDate;
  const dateStyle = market.status === 'delayed' ? { color: 'var(--warning)', fontWeight: 700 }
    : market.status === 'live' ? { color: 'var(--live)' } : {};

  const statusPill = market.status === 'live'
    ? <span className="market-status-pill live">Live</span>
    : market.status === 'delayed'
    ? <span className="market-status-pill" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)' }}>⚠ Delayed</span>
    : <span className="market-status-pill upcoming">Upcoming</span>;

  return (
    <div className="rollout-root">
      <div className="detail-root">

        {/* HEADER */}
        <div className="detail-header" style={{ borderTop: `4px solid ${market.phaseColor}` }}>
          <Link to="/rollout" className="detail-back">← All Markets</Link>
          <div className="detail-hero">
            <span className="detail-flag">{market.flag}</span>
            <div className="detail-title-block">
              <div className="detail-market-name">{market.name} <span className="detail-lang">{market.lang}</span></div>
              <div className="detail-phase-label">Phase {market.phase} · Sunrise Dashboard Global Rollout</div>
            </div>
            {statusPill}
          </div>
          <div className="detail-meta-row">
            <div className="detail-meta-item">
              <div className="detail-meta-label">Market Manager</div>
              <div className="detail-meta-val">{market.manager ?? <span className="tbd">TBD</span>}</div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">{dateLabel}</div>
              <div className="detail-meta-val" style={dateStyle}>{dateVal}</div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Open Issues</div>
              <div className="detail-meta-val" style={{ color: openBugs.length > 0 ? '#dc2626' : 'var(--live)' }}>
                {openBugs.length > 0 ? `${openBugs.length} open` : 'None'}
              </div>
            </div>
            <div className="detail-meta-item">
              <div className="detail-meta-label">Jira Epic</div>
              <div className="detail-meta-val">
                <a href={JIRA_EPIC.url} target="_blank" rel="noopener noreferrer" className="detail-jira-badge">
                  {JIRA_EPIC.key}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-body">

          {/* PIPELINE */}
          <section className="detail-section">
            <h3 className="detail-section-title">Pipeline</h3>
            <div className="detail-pipeline">
              {market.pipeline.map((step, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <PipelineStep step={step} />
                  {i < market.pipeline.length - 1 && (
                    <div className={`pipeline-connector ${connectorClass(market.pipeline, i)}`}></div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* JIRA TICKETS */}
          <section className="detail-section">
            <h3 className="detail-section-title">
              Jira
              <a href={JIRA_EPIC.url} target="_blank" rel="noopener noreferrer" className="detail-section-link">
                View epic ↗
              </a>
            </h3>

            <div className="jira-section">
              <div className="jira-group-label">Parent Epic</div>
              <JiraTicketRow ticket={JIRA_EPIC} />

              <div className="jira-group-label" style={{ marginTop: '1rem' }}>Initiative</div>
              <JiraTicketRow ticket={AXOLOTL_EPIC} />

              {market.jiraTickets.length > 0 && (
                <>
                  <div className="jira-group-label" style={{ marginTop: '1rem' }}>Market-Specific Tickets</div>
                  {market.jiraTickets.map(t => (
                    <JiraTicketRow key={t.key} ticket={t} />
                  ))}
                </>
              )}

              {market.jiraTickets.length === 0 && (
                <div className="jira-no-tickets">
                  No market-specific tickets yet — add them to <code>rolloutData.js → {market.code}.jiraTickets</code>
                </div>
              )}

              {(market.linkedBugs ?? []).length > 0 && (
                <>
                  <div className="jira-group-label linked-bugs-label" style={{ marginTop: '1.25rem' }}>
                    Linked Bug Tickets
                    <span className="linked-bugs-count">{(market.linkedBugs ?? []).filter(b => b.status !== 'Closed' && b.status !== 'Done').length} open</span>
                  </div>
                  {(market.linkedBugs ?? []).map(bug => (
                    <BugTicketRow key={bug.key} ticket={bug} />
                  ))}
                </>
              )}
            </div>
          </section>

          {/* BUGS */}
          <section className="detail-section">
            <h3 className="detail-section-title">
              Issues &amp; Bugs
              {openBugs.length > 0 && <span className="bug-count-pill open" style={{ marginLeft: '0.5rem' }}>{openBugs.length} open</span>}
              {passedBugs.length > 0 && <span className="bug-count-pill passed" style={{ marginLeft: '0.5rem' }}>{passedBugs.length} passed</span>}
            </h3>

            {market.bugs.length === 0 ? (
              <div className="detail-empty">No issues logged yet.</div>
            ) : (
              <div className="detail-bugs-list">
                {openBugs.map((bug, i) => (
                  <div key={i} className={`bug-item ${bug.type}-bug`}>
                    <span className="bug-tag" style={
                      bug.tag === 'T' ? { background: '#eff6ff', color: '#2563eb' }
                      : { background: '#fff7ed', color: '#ea580c' }
                    }>{bug.tag}</span>
                    {bug.text}
                  </div>
                ))}
                {passedBugs.map((bug, i) => (
                  <div key={i} className="bug-item passed-bug">
                    <span className="bug-tag p">P</span>
                    {bug.text}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ANALYTICS */}
          <section className="detail-section" style={{ padding: 0, overflow: 'hidden', background: 'transparent', boxShadow: 'none' }}>
            {market.analyticsData ? (
              <AnalyticsInsights data={market.analyticsData} marketName={market.name} />
            ) : (
              <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
                <h3 className="detail-section-title">Analytics</h3>
                <div className="detail-amplitude-placeholder">
                  <div className="amplitude-placeholder-icon">📊</div>
                  <div className="amplitude-placeholder-text">Analytics coming soon</div>
                  <div className="amplitude-placeholder-sub">
                    Key metrics for {market.name} will appear here once the dashboard is set up in Amplitude.
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
