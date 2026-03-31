import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { markets, JIRA_EPIC } from '../data/rolloutData';
import './Rollout.css';

// SVG helpers
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

// Feedback area: click to edit, blur to reset placeholder
function FeedbackArea({ defaultText = 'Click to add feedback or notes…' }) {
  const ref = useRef(null);
  const [hasContent, setHasContent] = useState(false);

  const handleClick = () => {
    const el = ref.current;
    if (el.textContent.trim() === defaultText) {
      el.textContent = '';
    }
    el.contentEditable = 'true';
    el.focus();
  };

  const handleFocus = () => {
    const el = ref.current;
    if (el.textContent.trim() === defaultText) {
      el.textContent = '';
    }
    setHasContent(true);
  };

  const handleBlur = () => {
    const el = ref.current;
    if (!el.textContent.trim()) {
      el.textContent = defaultText;
      setHasContent(false);
      el.contentEditable = 'false';
    }
  };

  return (
    <div
      ref={ref}
      className={`feedback-area${hasContent ? ' has-content' : ''}`}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      title="Click to add feedback"
      suppressContentEditableWarning
    >
      {defaultText}
    </div>
  );
}

// Bugs toggle section
function BugsSummary({ id, label, pills, bugs, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bugs-summary">
      <div className="bugs-header" onClick={() => setExpanded(e => !e)}>
        <div className="bugs-label">
          QA Bugs {pills}
        </div>
        <span className={`bugs-toggle${expanded ? ' expanded' : ''}`}>▾</span>
      </div>
      <div className={`bugs-list${expanded ? ' expanded' : ''}`}>
        {bugs}
      </div>
    </div>
  );
}

function connectorClass(steps, i) {
  if (i >= steps.length - 1) return '';
  const prev = steps[i].state;
  const next = steps[i + 1].state;
  if (prev === 'done' || prev === 'live') return 'done';
  if ((prev === 'active' || prev === 'warn') && (next === 'active' || next === 'warn')) return 'active';
  if (prev === 'warn') return 'active';
  return '';
}

function MarketCard({ market }) {
  const { code, flag, name, lang, phaseColor, status, pipeline, bugs, manager, feedbackNote } = market;
  const openCount = bugs.filter(b => b.type !== 'passed').length;
  const passedCount = bugs.filter(b => b.type === 'passed').length;

  const dateLabel = status === 'live' ? 'Launch Date' : 'Target Launch';
  const dateVal = status === 'live' ? market.launchDate
    : status === 'delayed' ? `${market.targetDate} ↗ (was ${market.originalDate})`
    : market.targetDate;
  const dateStyle = status === 'delayed' ? { color: 'var(--warning)', fontWeight: 700 }
    : status === 'live' ? { color: 'var(--live)' } : {};

  const statusPill = status === 'live'
    ? <span className="market-status-pill live">Live</span>
    : status === 'delayed'
    ? <span className="market-status-pill" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)' }}>⚠ Delayed</span>
    : <span className="market-status-pill upcoming">Upcoming</span>;

  return (
    <div className="market-card" style={{ borderTop: `3px solid ${phaseColor}` }}>
      <div className="market-card-top">
        <div className="market-flag-name">
          <span className="market-flag">{flag}</span>
          <div>
            <div className="market-name">{name}</div>
            <div className="market-lang">{lang}</div>
          </div>
        </div>
        {statusPill}
      </div>

      <div className="pipeline">
        {pipeline.map((step, i) => {
          const iconClass = step.state === 'done' || step.state === 'live' ? 'done'
            : step.state === 'active' || step.state === 'warn' ? 'active' : 'pending';
          const iconStyle = step.state === 'live' ? { background: 'var(--live)' } : {};
          const labelStyle = step.state === 'live' ? { color: 'var(--live)', fontWeight: 700 }
            : step.state === 'active' ? { color: 'var(--progress)' }
            : step.state === 'warn' ? { color: 'var(--warning)' } : {};
          return (
            <div key={i} style={{ display: 'contents' }}>
              <div className="pipeline-step">
                <div className={`step-icon ${iconClass}`} style={iconStyle}>
                  {(step.state === 'done' || step.state === 'live') && <CheckIcon />}
                  {(step.state === 'active' || step.state === 'warn') && <DotIcon />}
                </div>
                <span className={`step-label${step.state === 'pending' ? ' pending' : ''}`} style={labelStyle}>
                  {step.label}
                  {step.note && <span className="step-note"> — {step.note}</span>}
                </span>
              </div>
              {i < pipeline.length - 1 && (
                <div className={`pipeline-connector ${connectorClass(pipeline, i)}`}></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="market-meta">
        <div className="meta-item">
          <div className="meta-label">Market Manager</div>
          <div className={`meta-val${!manager ? ' tbd' : ''}`}>{manager ?? 'To be assigned'}</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">{dateLabel}</div>
          <div className="meta-val" style={dateStyle}>{dateVal}</div>
        </div>
        <FeedbackArea defaultText={feedbackNote ?? 'Click to add feedback or notes…'} />
      </div>

      {(market.linkedBugs?.length > 0) && (
        <div className="linked-tickets-row">
          <span className="linked-tickets-label">🔗 Linked bug tickets</span>
          <div className="linked-tickets-pills">
            {market.linkedBugs.filter(b => b.status !== 'Closed' && b.status !== 'Done').length > 0 && (
              <span className="linked-ticket-pill open">
                {market.linkedBugs.filter(b => b.status !== 'Closed' && b.status !== 'Done').length} open
              </span>
            )}
            {market.linkedBugs.filter(b => b.status === 'Closed' || b.status === 'Done').length > 0 && (
              <span className="linked-ticket-pill closed">
                {market.linkedBugs.filter(b => b.status === 'Closed' || b.status === 'Done').length} closed
              </span>
            )}
          </div>
        </div>
      )}

      {bugs.length > 0 && (
        <BugsSummary
          id={`${code}-bugs`}
          defaultExpanded={status === 'delayed'}
          pills={<>
            {openCount > 0 && <span className="bug-count-pill open">{openCount} open</span>}
            {' '}
            {passedCount > 0 && <span className="bug-count-pill passed">{passedCount} passed</span>}
          </>}
          bugs={<>
            {bugs.filter(b => b.type !== 'passed').map((bug, i) => (
              <div key={i} className={`bug-item ${bug.type}-bug`}>
                <span className={`bug-tag ${bug.tag.toLowerCase()}`}>{bug.tag}</span>
                {bug.text}
              </div>
            ))}
            {bugs.filter(b => b.type === 'passed').map((bug, i) => (
              <div key={i} className="bug-item passed-bug">
                <span className="bug-tag p">P</span>
                {bug.text}
              </div>
            ))}
          </>}
        />
      )}

      <Link to={`/rollout/${code}`} className="market-detail-link">View details →</Link>
    </div>
  );
}

export default function Rollout() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.rollout-root .phase-section');
      let current = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id;
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="rollout-root">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">Change.org · Starter Experience</div>
          <div className="sidebar-title">Dashboard Global Rollout</div>
          <div className="sidebar-meta">AI Guidance · 16 Markets</div>
        </div>

        <div className="sidebar-stats">
          <div className="stat-row">
            <span className="stat-label">Markets Live</span>
            <span className="stat-val live">9 / 16</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Phase 4</span>
            <span className="stat-val live">4 / 6 Live</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Upcoming</span>
            <span className="stat-val upcoming">9 markets</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Phases</div>

          <button className={`nav-item phase-1${activeSection === 'phase-1' ? ' active' : ''}`} onClick={() => scrollTo('phase-1')}>
            <span className="nav-dot" style={{background:'#059669'}}></span>
            Phase 1 · AU
            <span className="nav-badge live">Live</span>
          </button>

          <button className={`nav-item phase-2${activeSection === 'phase-2' ? ' active' : ''}`} onClick={() => scrollTo('phase-2')}>
            <span className="nav-dot" style={{background:'#2563eb'}}></span>
            Phase 2 · CA / IN / GB
            <span className="nav-badge live">Live</span>
          </button>

          <button className={`nav-item phase-3${activeSection === 'phase-3' ? ' active' : ''}`} onClick={() => scrollTo('phase-3')}>
            <span className="nav-dot" style={{background:'#9333ea'}}></span>
            Phase 3 · MX
            <span className="nav-badge live">Live</span>
          </button>

          <button className={`nav-item phase-4${activeSection === 'phase-4' ? ' active' : ''}`} onClick={() => scrollTo('phase-4')}>
            <span className="nav-dot" style={{background:'#ea580c'}}></span>
            Phase 4 · DE / FR / CA-FR / RU / JP / IN-HI
            <span className="nav-badge" style={{background:'rgba(217,119,6,.3)',color:'#fbbf24'}}>4 / 6 Live</span>
          </button>

          <button className={`nav-item phase-5${activeSection === 'phase-5' ? ' active' : ''}`} onClick={() => scrollTo('phase-5')}>
            <span className="nav-dot" style={{background:'#db2777'}}></span>
            Phase 5 · BR / AR / TH / TR / IT / ES / ID
            <span className="nav-badge">Apr 2</span>
          </button>

          <div className="nav-section-label" style={{marginTop:'1.5rem'}}>Jira</div>
          <div className="sidebar-links">
            <a href={JIRA_EPIC.url} target="_blank" rel="noopener noreferrer" className="sidebar-link">
              🎯 {JIRA_EPIC.key} — {JIRA_EPIC.summary}
            </a>
          </div>

          <div className="nav-section-label" style={{marginTop:'1.5rem'}}>Important Docs</div>
          <div className="sidebar-links">
            <a href="https://change.atlassian.net/wiki/spaces/AS/pages/edit-v2/4705189895" target="_blank" rel="noopener noreferrer" className="sidebar-link">📋 Rollout Plan</a>
            <a href="https://docs.google.com/spreadsheets/d/1sigXxrV7IB2D27IAjiGmB2hHW6F7_DmN/edit?gid=642014652#gid=642014652" target="_blank" rel="noopener noreferrer" className="sidebar-link">🐛 QA Bug Tracker</a>
            <a href="https://app.amplitude.com/analytics/change/space/resdteha/all" target="_blank" rel="noopener noreferrer" className="sidebar-link">📊 Analytics Dashboard</a>
            <a href="https://change.slack.com/archives/C0AH359Q5C5" target="_blank" rel="noopener noreferrer" className="sidebar-link">💬 Slack Channel</a>
          </div>

          <div className="nav-section-label" style={{marginTop:'1.5rem'}}>Milestones</div>
          <div style={{padding:'.5rem .75rem',display:'flex',flexDirection:'column',gap:'.35rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'.7rem',color:'rgba(255,255,255,.4)'}}>
              <span>Dashboard copy merged</span><span style={{color:'#34d399'}}>✓ Mar 4</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'.7rem',color:'rgba(255,255,255,.4)'}}>
              <span>MX launched</span><span style={{color:'#34d399'}}>✓ Mar 24</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'.7rem',color:'rgba(255,255,255,.4)'}}>
              <span>DE + RU launched</span><span style={{color:'#34d399'}}>✓ Mar 26</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'.7rem',color:'rgba(255,255,255,.4)'}}>
              <span>FR + FR-CA launched</span><span style={{color:'#34d399'}}>✓ Mar 31</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'.7rem',color:'rgba(255,255,255,.55)'}}>
              <span>JP + IN-HI target</span><span style={{color:'#fbbf24'}}>Thu Apr 2</span>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">Updated March 26, 2026 · Rolling launches within each phase</div>
      </aside>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">Global Rollout Tracker</div>
          <div className="topbar-right">
            <span className="topbar-date">Week of Mar 24–27, 2026</span>
            <button className="add-market-btn" onClick={() => alert('Add market coming soon')}>+ Add Market</button>
          </div>
        </div>

        <div className="content">

          {/* OVERALL PROGRESS */}
          <div className="overall-strip">
            <div className="overall-kpi">
              <div className="overall-kpi-val">16</div>
              <div className="overall-kpi-label">Total Markets</div>
            </div>
            <div className="overall-divider"></div>
            <div className="overall-kpi">
              <div className="overall-kpi-val" style={{color:'var(--live)'}}>9</div>
              <div className="overall-kpi-label">Live Now</div>
            </div>
            <div className="overall-divider"></div>
            <div className="overall-kpi">
              <div className="overall-kpi-val" style={{color:'var(--warning)'}}>JP · IN-HI</div>
              <div className="overall-kpi-label">Next — Thu Apr 2</div>
            </div>
            <div className="overall-divider"></div>
            <div className="overall-phases">
              <div className="phases-label">Overall Rollout Progress</div>
              <div className="phases-bar-row">
                <div className="phase-seg done" style={{flex:1}} title="Phase 1 · AU"><span className="phase-seg-label">P1</span></div>
                <div className="phase-seg done" style={{flex:3}} title="Phase 2 · CA/IN/GB"><span className="phase-seg-label">P2</span></div>
                <div className="phase-seg done" style={{flex:1}} title="Phase 3 · MX — Live"><span className="phase-seg-label">P3</span></div>
                <div className="phase-seg" style={{flex:2,background:'var(--live)'}} title="Phase 4 · DE+RU Live"><span className="phase-seg-label">P4a</span></div>
                <div className="phase-seg" style={{flex:2,background:'var(--live)'}} title="Phase 4 · FR+FR-CA Live"><span className="phase-seg-label">P4b</span></div>
                <div className="phase-seg" style={{flex:2,background:'var(--warning)'}} title="Phase 4 · JP+IN-HI — QA Underway"><span className="phase-seg-label">P4c</span></div>
                <div className="phase-seg later" style={{flex:7}} title="Phase 5"><span className="phase-seg-label">P5</span></div>
              </div>
              <div className="phase-legend">
                <div className="legend-item"><div className="legend-dot" style={{background:'var(--live)'}}></div>Live</div>
                <div className="legend-item"><div className="legend-dot" style={{background:'var(--warning)'}}></div>Delayed</div>
                <div className="legend-item"><div className="legend-dot" style={{background:'#e5e7eb'}}></div>Upcoming</div>
              </div>
            </div>
          </div>

          {/* ── PHASE 1 ── */}
          <section id="phase-1" className="phase-section phase-1">
            <div className="phase-header">
              <div className="phase-num">1</div>
              <div className="phase-info">
                <div className="phase-name">Phase 1 — Australia</div>
                <div className="phase-sub">English · Pioneer Market · Live since Mar 10</div>
              </div>
              <span className="phase-status-badge live">🟢 Live</span>
            </div>
            <div className="market-grid">
              <MarketCard market={markets.au} />
            </div>
          </section>

          {/* ── PHASE 2 ── */}
          <section id="phase-2" className="phase-section phase-2">
            <div className="phase-header">
              <div className="phase-num" style={{background:'#eff6ff',color:'#2563eb'}}>2</div>
              <div className="phase-info">
                <div className="phase-name">Phase 2 — Canada, India (Eng), Great Britain</div>
                <div className="phase-sub">English · 3 Markets · All live as of Mar 18</div>
              </div>
              <span className="phase-status-badge live">🟢 Live</span>
            </div>
            <div className="market-grid">
              <MarketCard market={markets.ca} />
              <MarketCard market={markets['in-eng']} />
              <MarketCard market={markets.gb} />
            </div>
          </section>

          {/* ── PHASE 3 ── */}
          <section id="phase-3" className="phase-section phase-3">
            <div className="phase-header">
              <div className="phase-num" style={{background:'#fdf4ff',color:'#9333ea'}}>3</div>
              <div className="phase-info">
                <div className="phase-name">Phase 3 — Mexico</div>
                <div className="phase-sub">Spanish · 1 Market · Live since Mar 24</div>
              </div>
              <span className="phase-status-badge live">🟢 Live</span>
            </div>
            <div className="market-grid">
              <MarketCard market={markets.mx} />
            </div>
          </section>

          {/* ── PHASE 4 ── */}
          <section id="phase-4" className="phase-section phase-4">
            <div className="phase-header">
              <div className="phase-num" style={{background:'#fff7ed',color:'#ea580c'}}>4</div>
              <div className="phase-info">
                <div className="phase-name">Phase 4 — Germany, France, Canada (FR), Russia, Japan, India (Hindi)</div>
                <div className="phase-sub">Multi-language · 6 Markets · DE+RU live Mar 26 · FR+FR-CA live Mar 31 · JP+IN-HI targeting Thu Apr 2</div>
              </div>
              <span className="phase-status-badge" style={{background:'#fef3c7',color:'#d97706',border:'1px solid #fde68a'}}>4 / 6 Live</span>
            </div>
            <div className="market-grid">
              <MarketCard market={markets.de} />
              <MarketCard market={markets.fr} />
              <MarketCard market={markets['ca-fr']} />
              <MarketCard market={markets.ru} />
              <MarketCard market={markets.jp} />
              <MarketCard market={markets['in-hi']} />
            </div>
          </section>

          {/* ── PHASE 5 ── */}
          <section id="phase-5" className="phase-section phase-5">
            <div className="phase-header">
              <div className="phase-num" style={{background:'#fdf2f8',color:'#db2777'}}>5</div>
              <div className="phase-info">
                <div className="phase-name">Phase 5 — Brazil, Argentina, Thailand, Turkey, Italy, Spain, Indonesia</div>
                <div className="phase-sub">Multi-language · 7 Markets · Target: Apr 2 — rolling launches allowed</div>
              </div>
              <span className="phase-status-badge upcoming">⏳ Upcoming</span>
            </div>
            <div className="market-grid">
              <MarketCard market={markets.br} />
              <MarketCard market={markets.ar} />
              <MarketCard market={markets.th} />
              <MarketCard market={markets.tr} />
              <MarketCard market={markets.it} />
              <MarketCard market={markets.es} />
              <MarketCard market={markets.id} />
            </div>
          </section>

        </div>{/* /content */}
      </div>{/* /main */}

    </div>
  );
}
