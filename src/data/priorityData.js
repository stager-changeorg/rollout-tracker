// Draft priority scores — pending team scoring session
// Formula: (Retention Impact × Confidence × Strategic Fit) ÷ Effort
// Each factor: 1 (low) → 3 (high). Effort: 1 (large) → 3 (quick)

export const BET_COLORS = {
  1: '#4f8ef7',
  2: '#b06ef5',
  3: '#2ec98a',
  4: '#ff8c42',
};

export const initiatives = [
  // BET 1 — Notifications
  { bet: 1, num: 1, name: 'App push notifications — improve',          ri: 3, co: 3, sf: 2, ef: 2 },
  { bet: 1, num: 2, name: 'Web / in-dashboard notifications',          ri: 2, co: 2, sf: 2, ef: 2 },
  { bet: 1, num: 3, name: 'SMS / text notifications — new capability', ri: 3, co: 2, sf: 3, ef: 1 },
  { bet: 1, num: 4, name: 'Dynamic notifications + checklist hybrid',  ri: 2, co: 2, sf: 3, ef: 2 },
  // BET 2 — AI Guidance
  { bet: 2, num: 1, name: 'AI guidance: UX experimentation',           ri: 3, co: 2, sf: 3, ef: 2 },
  { bet: 2, num: 2, name: 'AI guidance: Dynamic behavior',             ri: 3, co: 1, sf: 3, ef: 1 },
  { bet: 2, num: 3, name: 'AI guidance: Scaling needs',                ri: 2, co: 3, sf: 2, ef: 2 },
  { bet: 2, num: 4, name: 'Decision maker guidance',                   ri: 2, co: 2, sf: 2, ef: 2 },
  { bet: 2, num: 5, name: 'AI-powered petition editing workflows',      ri: 2, co: 1, sf: 2, ef: 2 },
  { bet: 2, num: 6, name: 'Starter analytics / Insights',              ri: 2, co: 2, sf: 3, ef: 2 },
  // BET 3 — Relationships
  { bet: 3, num: 1, name: 'Starter-to-signer updates',                 ri: 3, co: 2, sf: 3, ef: 2 },
  { bet: 3, num: 2, name: 'Supporters asking for things from starters',ri: 2, co: 1, sf: 2, ef: 1 },
  { bet: 3, num: 3, name: 'Auto-thank supporters',                     ri: 2, co: 2, sf: 2, ef: 2 },
  { bet: 3, num: 4, name: 'Starter reply to comments',                 ri: 1, co: 2, sf: 1, ef: 2 },
  { bet: 3, num: 5, name: 'Starter videos on petition page',           ri: 2, co: 1, sf: 1, ef: 2 },
  { bet: 3, num: 6, name: 'Video "Why I started this petition"',       ri: 2, co: 1, sf: 1, ef: 2 },
  // BET 4 — Growth
  { bet: 4, num: 1, name: 'Endorsements + coalition/org recommender',  ri: 2, co: 2, sf: 3, ef: 2 },
  { bet: 4, num: 2, name: 'Expand share recommendations',              ri: 3, co: 3, sf: 2, ef: 2 },
  { bet: 4, num: 3, name: 'Uploading contacts on starter dashboard',   ri: 2, co: 3, sf: 2, ef: 2 },
  { bet: 4, num: 4, name: 'App(s) Global Rollout',                     ri: 3, co: 3, sf: 3, ef: 3 },
  { bet: 4, num: 5, name: 'Improving promotions (paid)',               ri: 2, co: 1, sf: 1, ef: 2 },
].map(i => ({ ...i, score: parseFloat(((i.ri * i.co * i.sf) / i.ef).toFixed(1)) }))
  .sort((a, b) => b.score - a.score);

export const MAX_SCORE = 9; // max achievable = 3×3×3÷3 = 9
