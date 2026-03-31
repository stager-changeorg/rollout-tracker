import { useState, useEffect, useRef } from 'react';
import './V1.css';
import PrioritySnapshot, { ScoreBadge } from './PrioritySnapshot';

function InitiativeItem({ bet, num, name, tags, desc, notes, betClass }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`initiative-item${open ? ' open' : ''}`}>
      <button className="initiative-header" onClick={() => setOpen(o => !o)}>
        <div className="initiative-num">{num}</div>
        <div className="initiative-name">{name}</div>
        <div className="initiative-tags">
          {tags && tags.map((t, i) => <span key={i} className={`tag tag-${t.toLowerCase()}`}>{t}</span>)}
        </div>
        <div className="expand-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </button>
      <div className="initiative-body">
        <div className="initiative-body-inner">
          <ScoreBadge bet={bet} num={num} />
          {desc && <p className="initiative-desc">{desc}</p>}
          {notes && <div className="initiative-notes"><span className="notes-label">Notes</span> {notes}</div>}
        </div>
      </div>
    </div>
  );
}

export default function V1() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Scroll animation observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    root.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

    // Active nav highlighting
    const sections = root.querySelectorAll('section[id]');
    const navLinks = root.querySelectorAll('.nav-links a');

    const handleScroll = () => {
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 80;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });
      navLinks.forEach(link => {
        link.style.fontWeight = link.getAttribute('href') === '#' + current ? '700' : '500';
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="v1-root" ref={rootRef}>
      {/* NAV */}
      <nav>
        <div className="nav-logo">Starter Experience · Q2 2026</div>
        <ul className="nav-links">
          <li><a href="#scoring">Scoring</a></li>
          <li><a href="#bet1" className="bet1">Bet 1: Notifications</a></li>
          <li><a href="#bet2" className="bet2">Bet 2: AI Guidance</a></li>
          <li><a href="#bet3" className="bet3">Bet 3: Relationships</a></li>
          <li><a href="#bet4" className="bet4">Bet 4: Growth</a></li>
          <li><a href="#eng">Engineering</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-label">Q2 2026 Strategy &amp; Prioritization</div>
        <h1 className="hero-title">Starter Experience<br /><span>Strategy &amp; Priorities</span></h1>

        <div className="north-star-card">
          <div className="north-star-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            North Star
          </div>
          <div className="north-star-text">Week 2 Starter Retention</div>
        </div>

        <div className="h2-vision">
          <div className="h2-vision-label">H2 Vision</div>
          <div className="h2-vision-text">AI co-pilot for starters — dynamic guidance unified into one cohesive experience</div>
        </div>

        <div className="q2-question">
          <strong style={{color: 'var(--text)'}}>Q2 Question:</strong> What do we need to learn and build this quarter to make H2&apos;s co-pilot possible? Use the scoring to surface where we have conviction and where we don&apos;t.
        </div>

        <div className="bets-overview">
          <a href="#bet1" className="bet-chip b1">
            <div className="bet-chip-num">Bet 1</div>
            <div className="bet-chip-title">Get Starters Back · Notifications</div>
            <div className="bet-chip-count">4 initiatives</div>
          </a>
          <a href="#bet2" className="bet-chip b2">
            <div className="bet-chip-num">Bet 2</div>
            <div className="bet-chip-title">Guide Starters · AI Guidance</div>
            <div className="bet-chip-count">6 initiatives</div>
          </a>
          <a href="#bet3" className="bet-chip b3">
            <div className="bet-chip-num">Bet 3</div>
            <div className="bet-chip-title">Starter-Supporter Relationship</div>
            <div className="bet-chip-count">6 initiatives</div>
          </a>
          <a href="#bet4" className="bet-chip b4">
            <div className="bet-chip-num">Bet 4</div>
            <div className="bet-chip-title">Get More Signers</div>
            <div className="bet-chip-count">5 initiatives</div>
          </a>
        </div>
      </section>

      {/* SCORING */}
      <section id="scoring" className="scoring-section">
        <div className="section-label">Prioritization Framework</div>
        <div className="scoring-card animate-in">
          <div className="scoring-title">How initiatives are scored</div>
          <div className="formula-display">
            <div className="formula-part ri">
              <div className="formula-part-name">Retention Impact</div>
              <div className="formula-part-value">1 → 3</div>
              <div className="formula-part-desc">weak → direct</div>
            </div>
            <div className="formula-op">×</div>
            <div className="formula-part co">
              <div className="formula-part-name">Confidence</div>
              <div className="formula-part-value">1 → 3</div>
              <div className="formula-part-desc">hypothesis → validated</div>
            </div>
            <div className="formula-op">×</div>
            <div className="formula-part sf">
              <div className="formula-part-name">Strategic Fit</div>
              <div className="formula-part-value">1 → 3</div>
              <div className="formula-part-desc">nice-to-have → H2 essential</div>
            </div>
            <div className="formula-op">÷</div>
            <div className="formula-part ef">
              <div className="formula-part-name">Effort</div>
              <div className="formula-part-value">1 → 3</div>
              <div className="formula-part-desc">large → quick</div>
            </div>
            <div className="formula-op">=</div>
            <div className="formula-result">
              <div className="formula-result-name">Score</div>
              <div className="formula-result-value">Priority</div>
            </div>
          </div>
          <div style={{color: 'var(--muted)', fontSize: '0.8rem'}}>Individual initiative scores are draft estimates — pending team scoring sessions.</div>
        </div>
      </section>

      {/* PRIORITY SNAPSHOT */}
      <section className="priority-snapshot-section">
        <PrioritySnapshot />
      </section>

      {/* BET 1 */}
      <section id="bet1" className="bet-section b1">
        <div className="bet-section-inner">
          <div className="bet-header animate-in">
            <div className="bet-number-badge">1</div>
            <div className="bet-title-group">
              <div className="bet-eyebrow">Bet 1 · Notifications</div>
              <h2 className="bet-title">Get Starters Back</h2>
              <p className="bet-question">&ldquo;How do we get Starters back to Change.org to continue investing in their campaign? This is about new mediums (eg SMS), better triggers, and the onsite experience.&rdquo;</p>
            </div>
          </div>
          <div className="initiatives-list b1 animate-in">
            <InitiativeItem bet={1} num={1} name="App push notifications — improve"
              desc="Better timing, triggers, and content for existing app push, with a focus on specific trigger events that create natural pull-back in the Week 2 window. Another idea is streaks?"
              notes="Deep links" />
            <InitiativeItem bet={1} num={2} name="Web / in-dashboard notifications — improve + expand"
              desc="In-dashboard notification surface for starters. Systematizes different notification types (passive vs action needed): kickstarter moments, DM added, signature milestones, supporter comments, share activity."
              notes="Is notifications infra part of this?" />
            <InitiativeItem bet={1} num={3} name="SMS / text notifications — new capability"
              tags={['New', 'Infra']}
              desc="Reach starters with no app via text. Key strategic question: can SMS close the gap between app (~50% Week 4 return) and web (~15%) for non-app users? Note: 50% of GoFundMe starters opt in. Biggest new infrastructure investment in this bet."
              notes="WhatsApp would replace SMS outside the US. How well does Iterable handle this? Can it do WhatsApp?" />
            <InitiativeItem bet={1} num={4} name="Dynamic / notifications+checklist hybrid"
              desc="Contextual, coach-like tips that respond to what's happening on the petition — e.g., 'Your petition may get media attention — add photos now.' The UX approach across all notification surfaces; complements the AI guidance." />
          </div>
        </div>
      </section>

      <div className="bet-divider"></div>

      {/* BET 2 */}
      <section id="bet2" className="bet-section b2">
        <div className="bet-section-inner">
          <div className="bet-header animate-in">
            <div className="bet-number-badge">2</div>
            <div className="bet-title-group">
              <div className="bet-eyebrow">Bet 2 · AI Guidance</div>
              <h2 className="bet-title">Guide Starters to Success</h2>
              <p className="bet-question">&ldquo;How can we best organize our experience and produce high quality content so that Starters know what to do next at every stage of their campaign, and that we&apos;ll be there to help them do it? This is about UX, quality process, and areas of the experience we can improve with AI.&rdquo;</p>
            </div>
          </div>
          <div className="initiatives-list b2 animate-in">
            <InitiativeItem bet={2} num={1} name="AI guidance: UX experimentation beyond checklist"
              tags={['AI']}
              desc="Test UX formats explored in Q4 concept research (and other hypotheses). The beta tests content quality; Q2 tests the experience. What format best drives return and action beyond a traditional task list?"
              notes="Curious about a one task at a time situation. Good for AI." />
            <InitiativeItem bet={2} num={2} name="AI guidance: Dynamic behavior"
              tags={['AI']}
              desc="Signature based or petition activity based dynamic behavior."
              notes="This might be more H2 because it is more complicated." />
            <InitiativeItem bet={2} num={3} name="AI guidance: Scaling needs"
              tags={['AI', 'Infra']}
              desc="Work needed to make AI guidance ready for more starters — including how we assess output quality (speed and accuracy) and building a more ongoing HITL process as well as prepare for scale." />
            <InitiativeItem bet={2} num={4} name="Decision maker guidance"
              desc="Who to contact, when, and how to communicate at different campaign stages. From 38-interview research: starters are confused about the platform's role."
              notes="Discuss if there is one thing we want to focus on: Draft the first email to the decision maker, improving the 'downloaded signatures' artifact, etc. Evaluate overlap with AI guidance and Scaled Media before scoping." />
            <InitiativeItem bet={2} num={5} name="AI-powered petition editing workflows"
              tags={['AI']}
              desc="Improve the experience for starters who want to update, refine, or enhance their petition post-launch. Could enable richer petition pages and more effective updates, or enables new capabilities on the petition page — which would need to be in partnership with Supporter Experience." />
            <InitiativeItem bet={2} num={6} name="Starter analytics improvements / Insights"
              desc="Better data and insights for starters: who signed, where shares are coming from, what's driving momentum. Feeds AI guidance quality and may reduce the decision maker guidance scope by surfacing actionable intel directly." />
          </div>
        </div>
      </section>

      <div className="bet-divider"></div>

      {/* BET 3 */}
      <section id="bet3" className="bet-section b3">
        <div className="bet-section-inner">
          <div className="bet-header animate-in">
            <div className="bet-number-badge">3</div>
            <div className="bet-title-group">
              <div className="bet-eyebrow">Bet 3 · Relationships</div>
              <h2 className="bet-title">Deepen the Starter-Supporter Relationship</h2>
              <p className="bet-question">&ldquo;How can we strengthen the starter and supporter relationship so that both sides feel the momentum of the cause and campaign? This one is special because both sides benefit when there are improvements here. There are lots of potential opportunities here — where do we start?&rdquo;</p>
            </div>
          </div>
          <div className="initiatives-list b3 animate-in">
            <InitiativeItem bet={3} num={1} name="Starter-to-signer updates — improve the experience"
              tags={['AI']}
              desc="Make it easier and more compelling for starters to send updates. Q2 experiment: an AI-generated prompt ('here's what you could say today') on a dedicated updates tab, linked from the AI guidance checklist. Both starter success AND signer retention play."
              notes="Good for AI first." />
            <InitiativeItem bet={3} num={2} name="Supporters asking for things from starters"
              desc="Enable signers to signal what they want — updates, actions, next steps. Drives signer retention and gives starters a direct signal to return and respond. Turns petition from one-way broadcast into a two-way relationship. Need to collaborate with Supporter Experience team."
              notes="Would this include things like the ability for Starters to reply to comments?" />
            <InitiativeItem bet={3} num={3} name="Auto-thank supporters"
              notes="Would be nice if they could draft a message or record video/audio." />
            <InitiativeItem bet={3} num={4} name="Starter reply to comments"
              desc="Details to be scoped." />
            <InitiativeItem bet={3} num={5} name="Starter videos on petition page"
              desc="Let starters add a short video to their petition. Increases emotional resonance, signer connection, and perceived authenticity. Hypothesis: more emotionally compelling petitions attract more endorsers and shares. Need to collaborate with supporter experience team." />
            <InitiativeItem bet={3} num={6} name='Starter video/audio "Why I started this petition"'
              desc="Video is consistently seen on both the starter and supporter side as meaningful. Allow Starters to add a video or audio clip about why they started the petition to help supporters connect more emotionally to the cause on a personal level. Need to collaborate with supporter exp. team." />
          </div>
        </div>
      </section>

      <div className="bet-divider"></div>

      {/* BET 4 */}
      <section id="bet4" className="bet-section b4">
        <div className="bet-section-inner">
          <div className="bet-header animate-in">
            <div className="bet-number-badge">4</div>
            <div className="bet-title-group">
              <div className="bet-eyebrow">Bet 4 · Growth</div>
              <h2 className="bet-title">Get More Signers</h2>
              <p className="bet-question">&ldquo;Starters&apos; number-one ask is more signers, and audience growth is where they feel the gap most acutely. This bet is also where the co-pilot gets its growth intelligence: the recommender capabilities (who to reach, which audiences already care) and the app infrastructure our most engaged starters rely on. Where should we invest to move the needle on growth — and which of those investments also builds toward H2?&rdquo;</p>
            </div>
          </div>
          <div className="initiatives-list b4 animate-in">
            <InitiativeItem bet={4} num={1} name="Endorsements + coalition/org recommender system"
              desc="Product recommends potential endorsers, aligned organizations/coalitions, or influencers to starters. MVP endorsements feature ships Q1. This could drive credibility and distribution simultaneously."
              notes="Would need to determine if authentication is part of this." />
            <InitiativeItem bet={4} num={2} name="Expand share recommendations beyond Facebook + Reddit"
              desc="Expand to additional platforms and communities where petition audiences live. Direct, measurable distribution play — impact shows in share rate and 7-day share recruits." />
            <InitiativeItem bet={4} num={3} name="Uploading contacts on starter dashboard"
              desc="Allow starters to upload personal contacts and send targeted one-to-one share requests. GoFundMe CPO data: 20% adoption, 5% conversion — one-to-one personal shares consistently outperform social broadcast."
              notes="Do 50% of GFM users opt into SMS or 50% sync their contacts? Curious how they use those contacts later on in the journey." />
            <InitiativeItem bet={4} num={4} name="App(s) Global Rollout"
              tags={['New']}
              desc="Roll the apps out in key countries globally, need to determine countries / locales. Q2 extends the proven playbook internationally. Highest-confidence lever for Week 2 retention at scale."
              notes="Start with English only version??" />
            <InitiativeItem bet={4} num={5} name="Improving promotions (paid promotion product)"
              desc="Improve Change.org's paid promotion product for starters who want to amplify reach. Likely Revenue team led. Early exploration stage — pending further scoping on what improvement means."
              notes="Big opportunity to get starters to understand promotions through doing. Even if they have just a few dollars to kickstart sharing for their cause, it could make a big impact on success/revenue." />
          </div>
        </div>
      </section>

      {/* ENGINEERING */}
      <section id="eng" className="eng-section">
        <div className="eng-section-inner">
          <div className="eng-header animate-in">
            <div className="eng-eyebrow">Engineering-Led</div>
            <h2 className="eng-title">Engineering Initiatives</h2>
            <p className="eng-subtitle">&ldquo;Initiatives primarily scoped and driven by engineering. Not strategic bets — important delivery work that supports the quarter.&rdquo;</p>
          </div>
          <div className="eng-grid animate-in">
            <div className="eng-item">
              <div className="eng-item-num">1</div>
              <div className="eng-item-name">On demand ready-to-share assets</div>
              <div className="eng-item-desc">Engineering-led initiative for Starter Experience. Scoped by Karl + Axolotl Web Engineers. Details to be finalized.</div>
            </div>
            <div className="eng-item">
              <div className="eng-item-num">2</div>
              <div className="eng-item-name">Recommended Groups for Facebook — Provider Migration &amp; Architecture Refactor</div>
              <div className="eng-item-desc">Engineering-led refactor of the Recommended Groups pipeline. Current implementation relies on exa.ai. This initiative will redesign the architecture, migrate away from exa.ai, and harden for Global Rollout.</div>
            </div>
            <div className="eng-item">
              <div className="eng-item-num">3</div>
              <div className="eng-item-name">Global all current features</div>
              <div className="eng-item-desc">Ready to share - English, country by country. Recommended groups - English. AI guidance.</div>
            </div>
            <div className="eng-item">
              <div className="eng-item-num">4</div>
              <div className="eng-item-name">Sunrise Android</div>
              <div className="eng-item-desc">Details to be scoped.</div>
            </div>
            <div className="eng-item">
              <div className="eng-item-num">5</div>
              <div className="eng-item-name">A/B testing in the apps</div>
              <div className="eng-item-desc">Details to be scoped.</div>
            </div>
            <div className="eng-item">
              <div className="eng-item-num">6</div>
              <div className="eng-item-name">Better deep linking</div>
              <div className="eng-item-desc">Details to be scoped.</div>
            </div>
            <div className="eng-item">
              <div className="eng-item-num">7</div>
              <div className="eng-item-name">Regression test on the web</div>
              <div className="eng-item-desc">All are on legacy dashboard; we do have visual tests with Percy; right now we trust we are not breaking things on every deploy.</div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div style={{marginBottom: '0.5rem'}}>Starter Experience — Q2 2026 Strategy &amp; Prioritization</div>
        <div>North Star: Week 2 Starter Retention · H2 Vision: AI Co-Pilot for Starters</div>
      </footer>
    </div>
  );
}
