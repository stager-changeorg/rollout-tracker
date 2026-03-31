import { useState, useEffect, useRef } from 'react';
import './V2.css';
import PrioritySnapshot, { ScoreBadge } from './PrioritySnapshot';

export default function V2() {
  const [activeTab, setActiveTab] = useState('t1');
  const [activeSection, setActiveSection] = useState('hero');
  const mainRef = useRef(null);

  const switchTab = (id, e) => {
    if (e) e.preventDefault();
    setActiveTab(id);
    // scroll bets area into view
    setTimeout(() => {
      const betsEl = document.getElementById('bets');
      if (betsEl) betsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  useEffect(() => {
    const anchors = ['hero', 'scoring', 'bets', 'eng-panel'];

    const handleScroll = () => {
      let cur = 'hero';
      anchors.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) cur = id;
      });
      setActiveSection(cur);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sidebarLinkActive = (href) => {
    const id = href.replace('#', '');
    return activeSection === id ? 'active' : '';
  };

  return (
    <div className="v2-root" ref={mainRef}>
      <div className="layout">

        {/* SIDEBAR */}
        <nav className="sidebar">
          <div className="sidebar-logo">Starter Experience · Q2 2026</div>

          <div className="sidebar-section">Navigation</div>
          <a href="#hero" className={`sidebar-link ${sidebarLinkActive('#hero')}`}><span className="swatch" style={{background:'#7eb3ff'}}></span>Overview</a>
          <a href="#scoring" className={`sidebar-link ${sidebarLinkActive('#scoring')}`}><span className="swatch" style={{background:'#f5c542'}}></span>Scoring Framework</a>

          <div className="sidebar-section">4 Bets</div>
          <a href="#bets" className={`sidebar-link ${activeSection === 'bets' && activeTab === 't1' ? 'active' : ''}`} onClick={(e) => switchTab('t1', e)}>
            <span className="swatch" style={{background:'#4f8ef7'}}></span>
            <span>Get Starters Back</span>
            <span className="sidebar-count">4</span>
          </a>
          <a href="#bets" className={`sidebar-link ${activeSection === 'bets' && activeTab === 't2' ? 'active' : ''}`} onClick={(e) => switchTab('t2', e)}>
            <span className="swatch" style={{background:'#b06ef5'}}></span>
            <span>AI Guidance</span>
            <span className="sidebar-count">6</span>
          </a>
          <a href="#bets" className={`sidebar-link ${activeSection === 'bets' && activeTab === 't3' ? 'active' : ''}`} onClick={(e) => switchTab('t3', e)}>
            <span className="swatch" style={{background:'#2ec98a'}}></span>
            <span>Relationships</span>
            <span className="sidebar-count">6</span>
          </a>
          <a href="#bets" className={`sidebar-link ${activeSection === 'bets' && activeTab === 't4' ? 'active' : ''}`} onClick={(e) => switchTab('t4', e)}>
            <span className="swatch" style={{background:'#ff8c42'}}></span>
            <span>Get More Signers</span>
            <span className="sidebar-count">5</span>
          </a>

          <div className="sidebar-section">Delivery</div>
          <a href="#eng-panel" className={`sidebar-link ${sidebarLinkActive('#eng-panel')}`}><span className="swatch" style={{background:'#6c7a96'}}></span>Engineering</a>

          <div className="sidebar-footer">
            <div className="sidebar-northstar">
              <div className="sidebar-northstar-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                North Star
              </div>
              <div className="sidebar-northstar-val">Week 2 Starter Retention</div>
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <div className="main">

          {/* HERO */}
          <section id="hero" className="hero">
            <div className="hero-kicker"><span></span>Q2 2026 Strategy &amp; Prioritization</div>
            <h1 className="hero-h1">Starter Experience<br /><em>Q2 Strategy</em></h1>
            <div className="hero-cards">
              <div className="hero-card h2">
                <div className="hero-card-label">H2 Vision</div>
                <div className="hero-card-val">AI co-pilot for starters — dynamic guidance unified into one cohesive experience</div>
              </div>
              <div className="hero-card">
                <div className="hero-card-label" style={{color:'#f5c542'}}>North Star</div>
                <div className="hero-card-val">Week 2 Starter Retention</div>
              </div>
              <div className="hero-card q2">
                <div className="hero-card-label">Q2 Question</div>
                <div className="hero-card-val">What do we need to learn and build this quarter to make H2&apos;s co-pilot possible? Use the scoring to surface where we have conviction and where we don&apos;t.</div>
              </div>
            </div>
          </section>

          {/* SCORING */}
          <section id="scoring" className="scoring-strip">
            <h2>Prioritization Scoring</h2>
            <div className="formula-row">
              <div className="f-chip ri">
                <span className="f-chip-name">Retention Impact</span>
                <span className="f-chip-val">1 → 3</span>
                <span className="f-chip-sub">weak → direct</span>
              </div>
              <span className="f-op-sym">×</span>
              <div className="f-chip co">
                <span className="f-chip-name">Confidence</span>
                <span className="f-chip-val">1 → 3</span>
                <span className="f-chip-sub">hypothesis → validated</span>
              </div>
              <span className="f-op-sym">×</span>
              <div className="f-chip sf">
                <span className="f-chip-name">Strategic Fit</span>
                <span className="f-chip-val">1 → 3</span>
                <span className="f-chip-sub">nice-to-have → H2 essential</span>
              </div>
              <span className="f-op-sym">÷</span>
              <div className="f-chip ef">
                <span className="f-chip-name">Effort</span>
                <span className="f-chip-val">1 → 3</span>
                <span className="f-chip-sub">large → quick</span>
              </div>
              <span className="f-op-sym">=</span>
              <div className="f-chip res">
                <span className="f-chip-name">Score</span>
                <span className="f-chip-val">Priority</span>
                <span className="f-chip-sub">pending team session</span>
              </div>
            </div>
            <div className="scoring-note">Draft scores are shown below — pending team scoring session to calibrate.</div>
          </section>

          {/* PRIORITY SNAPSHOT */}
          <section className="priority-snapshot-section">
            <PrioritySnapshot />
          </section>

          {/* BETS TABS */}
          <section id="bets" className="bets-area">

            <div className="tab-bar">
              <button className={`tab-btn t1${activeTab === 't1' ? ' active' : ''}`} onClick={() => switchTab('t1')}>
                <span className="t-dot"></span><span>Bet 1 · Notifications</span>
              </button>
              <button className={`tab-btn t2${activeTab === 't2' ? ' active' : ''}`} onClick={() => switchTab('t2')}>
                <span className="t-dot"></span><span>Bet 2 · AI Guidance</span>
              </button>
              <button className={`tab-btn t3${activeTab === 't3' ? ' active' : ''}`} onClick={() => switchTab('t3')}>
                <span className="t-dot"></span><span>Bet 3 · Relationships</span>
              </button>
              <button className={`tab-btn t4${activeTab === 't4' ? ' active' : ''}`} onClick={() => switchTab('t4')}>
                <span className="t-dot"></span><span>Bet 4 · Growth</span>
              </button>
            </div>

            {/* BET 1 */}
            <div className={`bet-panel t1${activeTab === 't1' ? ' active' : ''}`} id="panel-t1">
              <div className="bet-panel-header">
                <div className="bet-num-big">1</div>
                <div className="bet-panel-meta">
                  <div className="bet-panel-eyebrow">Bet 1 · Notifications</div>
                  <div className="bet-panel-title">Get Starters Back</div>
                  <div className="bet-panel-q">&ldquo;How do we get Starters back to Change.org to continue investing in their campaign? This is about new mediums (eg SMS), better triggers, and the onsite experience.&rdquo;</div>
                </div>
              </div>
              <div className="init-grid t1">
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">1</div></div>
                  <ScoreBadge bet={1} num={1} />
                  <div className="init-card-name">App push notifications — improve</div>
                  <div className="init-card-desc">Better timing, triggers, and content for existing app push, with a focus on specific trigger events that create natural pull-back in the Week 2 window. Another idea is streaks?</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Deep links</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">2</div></div>
                  <ScoreBadge bet={1} num={2} />
                  <div className="init-card-name">Web / in-dashboard notifications — improve + expand</div>
                  <div className="init-card-desc">In-dashboard notification surface for starters. Systematizes different notification types (passive vs action needed): kickstarter moments, DM added, signature milestones, supporter comments, share activity.</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Is notifications infra part of this?</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top">
                    <div className="init-card-num">3</div>
                    <div className="init-card-badges"><span className="badge badge-new">New</span><span className="badge badge-infra">Infra</span></div>
                  </div>
                  <ScoreBadge bet={1} num={3} />
                  <div className="init-card-name">SMS / text notifications — new capability</div>
                  <div className="init-card-desc">Reach starters with no app via text. Key strategic question: can SMS close the gap between app (~50% Week 4 return) and web (~15%) for non-app users? 50% of GoFundMe starters opt in. Biggest new infrastructure investment in this bet.</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> WhatsApp would replace SMS outside the US. How well does Iterable handle this? Can it do WhatsApp?</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">4</div></div>
                  <ScoreBadge bet={1} num={4} />
                  <div className="init-card-name">Dynamic / notifications+checklist hybrid</div>
                  <div className="init-card-desc">Contextual, coach-like tips that respond to what&apos;s happening on the petition — e.g., &apos;Your petition may get media attention — add photos now.&apos; The UX approach across all notification surfaces; complements the AI guidance.</div>
                </div>
              </div>
            </div>

            {/* BET 2 */}
            <div className={`bet-panel t2${activeTab === 't2' ? ' active' : ''}`} id="panel-t2">
              <div className="bet-panel-header">
                <div className="bet-num-big">2</div>
                <div className="bet-panel-meta">
                  <div className="bet-panel-eyebrow">Bet 2 · AI Guidance</div>
                  <div className="bet-panel-title">Guide Starters to Success</div>
                  <div className="bet-panel-q">&ldquo;How can we best organize our experience and produce high quality content so that Starters know what to do next at every stage of their campaign? This is about UX, quality process, and areas of the experience we can improve with AI.&rdquo;</div>
                </div>
              </div>
              <div className="init-grid t2">
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">1</div><div className="init-card-badges"><span className="badge badge-ai">AI</span></div></div>
                  <ScoreBadge bet={2} num={1} />
                  <div className="init-card-name">AI guidance: UX experimentation beyond checklist</div>
                  <div className="init-card-desc">Test UX formats explored in Q4 concept research. The beta tests content quality; Q2 tests the experience. What format best drives return and action beyond a traditional task list?</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Curious about a one task at a time situation. Good for AI.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">2</div><div className="init-card-badges"><span className="badge badge-ai">AI</span></div></div>
                  <ScoreBadge bet={2} num={2} />
                  <div className="init-card-name">AI guidance: Dynamic behavior</div>
                  <div className="init-card-desc">Signature based or petition activity based dynamic behavior.</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> This might be more H2 because it is more complicated.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">3</div><div className="init-card-badges"><span className="badge badge-ai">AI</span><span className="badge badge-infra">Infra</span></div></div>
                  <ScoreBadge bet={2} num={3} />
                  <div className="init-card-name">AI guidance: Scaling needs</div>
                  <div className="init-card-desc">Work needed to make AI guidance ready for more starters — including how we assess output quality (speed and accuracy) and building a more ongoing HITL process as well as prepare for scale.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">4</div></div>
                  <ScoreBadge bet={2} num={4} />
                  <div className="init-card-name">Decision maker guidance</div>
                  <div className="init-card-desc">Who to contact, when, and how to communicate at different campaign stages. From 38-interview research: starters are confused about the platform&apos;s role.</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Evaluate overlap with AI guidance and Scaled Media before scoping. One focus area TBD: first email to decision maker, improving &apos;downloaded signatures&apos; artifact, etc.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">5</div><div className="init-card-badges"><span className="badge badge-ai">AI</span></div></div>
                  <ScoreBadge bet={2} num={5} />
                  <div className="init-card-name">AI-powered petition editing workflows</div>
                  <div className="init-card-desc">Improve the experience for starters who want to update, refine, or enhance their petition post-launch. Would need to be in partnership with Supporter Experience.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">6</div></div>
                  <ScoreBadge bet={2} num={6} />
                  <div className="init-card-name">Starter analytics improvements / Insights</div>
                  <div className="init-card-desc">Better data and insights for starters: who signed, where shares are coming from, what&apos;s driving momentum. Feeds AI guidance quality and may reduce the decision maker guidance scope.</div>
                </div>
              </div>
            </div>

            {/* BET 3 */}
            <div className={`bet-panel t3${activeTab === 't3' ? ' active' : ''}`} id="panel-t3">
              <div className="bet-panel-header">
                <div className="bet-num-big">3</div>
                <div className="bet-panel-meta">
                  <div className="bet-panel-eyebrow">Bet 3 · Relationships</div>
                  <div className="bet-panel-title">Deepen the Starter-Supporter Relationship</div>
                  <div className="bet-panel-q">&ldquo;How can we strengthen the starter and supporter relationship so that both sides feel the momentum of the cause and campaign? This one is special because both sides benefit when there are improvements here.&rdquo;</div>
                </div>
              </div>
              <div className="init-grid t3">
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">1</div><div className="init-card-badges"><span className="badge badge-ai">AI</span></div></div>
                  <ScoreBadge bet={3} num={1} />
                  <div className="init-card-name">Starter-to-signer updates — improve the experience</div>
                  <div className="init-card-desc">Make it easier and more compelling for starters to send updates. Q2 experiment: an AI-generated prompt (&apos;here&apos;s what you could say today&apos;) on a dedicated updates tab, linked from the AI guidance checklist.</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Good for AI first.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">2</div></div>
                  <ScoreBadge bet={3} num={2} />
                  <div className="init-card-name">Supporters asking for things from starters</div>
                  <div className="init-card-desc">Enable signers to signal what they want — updates, actions, next steps. Turns petition from one-way broadcast into a two-way relationship. Collaborate with Supporter Experience team.</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Would this include things like the ability for Starters to reply to comments?</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">3</div></div>
                  <ScoreBadge bet={3} num={3} />
                  <div className="init-card-name">Auto-thank supporters</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Would be nice if they could draft a message or record video/audio.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">4</div></div>
                  <ScoreBadge bet={3} num={4} />
                  <div className="init-card-name">Starter reply to comments</div>
                  <div className="init-card-desc" style={{color:'#aaa',fontStyle:'italic'}}>Details to be scoped.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">5</div></div>
                  <ScoreBadge bet={3} num={5} />
                  <div className="init-card-name">Starter videos on petition page</div>
                  <div className="init-card-desc">Let starters add a short video to their petition. Increases emotional resonance, signer connection, and perceived authenticity. Collaborate with supporter experience team.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">6</div></div>
                  <ScoreBadge bet={3} num={6} />
                  <div className="init-card-name">Starter video/audio &ldquo;Why I started this petition&rdquo;</div>
                  <div className="init-card-desc">Video is consistently seen on both the starter and supporter side as meaningful. Allow Starters to add a video or audio clip about why they started the petition. Collaborate with supporter exp. team.</div>
                </div>
              </div>
            </div>

            {/* BET 4 */}
            <div className={`bet-panel t4${activeTab === 't4' ? ' active' : ''}`} id="panel-t4">
              <div className="bet-panel-header">
                <div className="bet-num-big">4</div>
                <div className="bet-panel-meta">
                  <div className="bet-panel-eyebrow">Bet 4 · Growth</div>
                  <div className="bet-panel-title">Get More Signers</div>
                  <div className="bet-panel-q">&ldquo;Starters&apos; number-one ask is more signers. This bet is also where the co-pilot gets its growth intelligence: the recommender capabilities and the app infrastructure our most engaged starters rely on.&rdquo;</div>
                </div>
              </div>
              <div className="init-grid t4">
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">1</div></div>
                  <ScoreBadge bet={4} num={1} />
                  <div className="init-card-name">Endorsements + coalition/org recommender system</div>
                  <div className="init-card-desc">Product recommends potential endorsers, aligned organizations/coalitions, or influencers to starters. MVP endorsements feature ships Q1.</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Would need to determine if authentication is part of this.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">2</div></div>
                  <ScoreBadge bet={4} num={2} />
                  <div className="init-card-name">Expand share recommendations beyond Facebook + Reddit</div>
                  <div className="init-card-desc">Expand to additional platforms and communities where petition audiences live. Direct, measurable distribution play — impact shows in share rate and 7-day share recruits.</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">3</div></div>
                  <ScoreBadge bet={4} num={3} />
                  <div className="init-card-name">Uploading contacts on starter dashboard</div>
                  <div className="init-card-desc">Allow starters to upload personal contacts and send targeted one-to-one share requests. GoFundMe CPO data: 20% adoption, 5% conversion — one-to-one personal shares consistently outperform social broadcast.</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Do 50% of GFM users opt into SMS or 50% sync their contacts?</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">4</div><div className="init-card-badges"><span className="badge badge-new">New</span></div></div>
                  <ScoreBadge bet={4} num={4} />
                  <div className="init-card-name">App(s) Global Rollout</div>
                  <div className="init-card-desc">Roll the apps out in key countries globally. Q2 extends the proven playbook internationally. Highest-confidence lever for Week 2 retention at scale.</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Start with English only version??</div>
                </div>
                <div className="init-card">
                  <div className="init-card-top"><div className="init-card-num">5</div></div>
                  <ScoreBadge bet={4} num={5} />
                  <div className="init-card-name">Improving promotions (paid promotion product)</div>
                  <div className="init-card-desc">Improve Change.org&apos;s paid promotion product for starters who want to amplify reach. Likely Revenue team led. Early exploration stage — pending further scoping.</div>
                  <div className="init-card-notes"><span className="notes-lbl">Notes:</span> Big opportunity to get starters to understand promotions through doing — even a few dollars could make a big impact.</div>
                </div>
              </div>
            </div>

          </section>

          {/* ENGINEERING */}
          <section id="eng-panel">
            <div className="eng-header">
              <div className="eng-eyebrow">Engineering-Led</div>
              <div className="eng-title">Engineering Initiatives</div>
              <div className="eng-sub">&ldquo;Initiatives primarily scoped and driven by engineering. Not strategic bets — important delivery work that supports the quarter.&rdquo;</div>
            </div>
            <div className="eng-list">
              <div className="eng-item">
                <div className="eng-item-n">01</div>
                <div className="eng-item-name">On demand ready-to-share assets</div>
                <div className="eng-item-desc">Engineering-led initiative for Starter Experience. Scoped by Karl + Axolotl Web Engineers. Details to be finalized.</div>
              </div>
              <div className="eng-item">
                <div className="eng-item-n">02</div>
                <div className="eng-item-name">Recommended Groups for Facebook — Provider Migration &amp; Refactor</div>
                <div className="eng-item-desc">Refactor away from exa.ai. Redesign architecture, migrate provider, harden for Global Rollout.</div>
              </div>
              <div className="eng-item">
                <div className="eng-item-n">03</div>
                <div className="eng-item-name">Global all current features</div>
                <div className="eng-item-desc">Ready to share - English, country by country. Recommended groups - English. AI guidance.</div>
              </div>
              <div className="eng-item">
                <div className="eng-item-n">04</div>
                <div className="eng-item-name">Sunrise Android</div>
                <div className="eng-item-desc">Details to be scoped.</div>
              </div>
              <div className="eng-item">
                <div className="eng-item-n">05</div>
                <div className="eng-item-name">A/B testing in the apps</div>
                <div className="eng-item-desc">Details to be scoped.</div>
              </div>
              <div className="eng-item">
                <div className="eng-item-n">06</div>
                <div className="eng-item-name">Better deep linking</div>
                <div className="eng-item-desc">Details to be scoped.</div>
              </div>
              <div className="eng-item">
                <div className="eng-item-n">07</div>
                <div className="eng-item-name">Regression test on the web</div>
                <div className="eng-item-desc">All are on legacy dashboard; we do have visual tests with Percy; right now we trust we are not breaking things on every deploy.</div>
              </div>
            </div>
          </section>

          <footer>
            <strong>Starter Experience — Q2 2026 Strategy &amp; Prioritization</strong> &nbsp;·&nbsp; North Star: Week 2 Starter Retention &nbsp;·&nbsp; H2 Vision: AI Co-Pilot for Starters
          </footer>

        </div>{/* /main */}
      </div>{/* /layout */}
    </div>
  );
}
