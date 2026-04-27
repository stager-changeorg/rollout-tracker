import synced from './syncedData.json';

// ─── Merge helpers ─────────────────────────────────────────────────────────────
function applyJiraSync(tickets) {
  if (!tickets?.length) return tickets;
  return tickets.map(t => {
    const live = synced.jira?.[t.key];
    if (!live) return t;
    return {
      ...t,
      status:        live.status      ?? t.status,
      assignee:      live.assignee    ?? t.assignee,
      priority:      live.priority    ?? t.priority,
      updatedAt:     live.updatedAt   ?? t.updatedAt,
      description:   live.description ?? t.description,
      latestComment: live.latestComment ?? t.latestComment,
    };
  });
}

function applyAmplitudeSync(kpis) {
  if (!kpis?.length) return kpis;
  return kpis.map(kpi => {
    // Extract chart ID from URL — preserve 'new/' prefix for new-editor charts
    const urlParts = kpi.chartUrl?.split('/chart/');
    const rawId = urlParts?.[1];
    const chartId = rawId ?? kpi.chartUrl?.split('/').pop();
    const live = chartId && synced.amplitude?.[chartId];
    if (!live) return kpi;
    const formatted = formatKpiValue(live.latestRaw, kpi.value);
    return {
      ...kpi,
      value:    formatted ?? kpi.value,
      sparkline: live.sparkline ?? kpi.sparkline,
      trend:    live.trend ?? kpi.trend,
    };
  });
}

function formatKpiValue(raw, existingValue) {
  if (raw == null) return null;
  if (existingValue?.endsWith('%')) return `${Math.round(raw)}%`;
  if (/\d+(\.\d+)?K$/i.test(existingValue)) {
    return raw >= 1000 ? `~${(raw / 1000).toFixed(1)}K` : `~${Math.round(raw)}`;
  }
  return `${Math.round(raw)}`;
}

function applySheetBugs(market) {
  const sheetBugs = synced.sheets?.qaTestPlan?.[market.code];
  if (!sheetBugs?.length) return market.bugs;
  // Merge: sheet bugs are authoritative for open/filed/passed status
  return sheetBugs.map(b => ({ type: b.type, tag: b.tag, text: b.text, status: b.status, page: b.page, notes: b.notes }));
}

function syncMarket(market) {
  return {
    ...market,
    jiraTickets:  applyJiraSync(market.jiraTickets),
    linkedBugs:   applyJiraSync(market.linkedBugs),
    bugs:         applySheetBugs(market),
    analyticsData: market.analyticsData
      ? { ...market.analyticsData, kpis: applyAmplitudeSync(market.analyticsData.kpis) }
      : market.analyticsData,
  };
}

export const lastSynced = synced.lastSynced;

export const JIRA_EPIC = {
  key: 'CHANGE-83693',
  summary: 'Sunrise Dashboard Globally',
  status: 'Implementation',
  assignee: 'Sarahi Mireles',
  dueDate: 'Mar 31, 2026',
  priority: 'P2 - Significant',
  url: 'https://change.atlassian.net/browse/CHANGE-83693',
};

export const AXOLOTL_EPIC = {
  key: 'CHANGE-83975',
  summary: '🚩 Axolotl Q1\'26',
  status: 'In Progress',
  assignee: 'Oscar López',
  dueDate: 'Mar 31, 2026',
  url: 'https://change.atlassian.net/browse/CHANGE-83975',
};

// Pipeline step states: 'done' | 'live' | 'active' | 'warn' | 'pending'
// Bug types: 'translation' | 'visual' | 'passed'

const _markets = {
  au: {
    code: 'au',
    amplitudeDashboardId: '01ee25p3',
    analyticsData: {
      lastUpdated: 'Mar 24, 2026',
      dashboardUrl: 'https://app.amplitude.com/analytics/change/dashboard/01ee25p3',
      insights: [
        { type: 'positive', text: 'Day 1 retention jumped to 46% (week of Mar 16) — best in recent weeks and a strong signal that the dashboard is driving users back.' },
        { type: 'positive', text: 'Traffic stabilizing at ~5–6K/day this week. Mar 24 still in progress (632 so far) — trending consistent with recent patterns.' },
        { type: 'warning', text: 'Total Share CVR continues to decline: 8.5% this window vs 11.8% two weeks ago (-28%). Unique Share CVR also dipped to 38%. Requires attention.' },
        { type: 'positive', text: 'QPs returning to dashboard in week 1 recovered to 57% (up from 54% prior) — quality petitioners remain highly engaged.' },
      ],
      kpis: [
        {
          label: 'Daily Traffic',
          value: '~5.3K',
          sublabel: 'Mar 23 (Mar 24 in progress)',
          trend: 'neutral',
          trendLabel: '+50% vs pre-launch baseline',
          sparkline: [5158,5223,4913,4730,4618,3750,3683,4513,4621,4648,4732,4529,3972,3880,4767,8645,15172,11045,7904,6888,8150,8162,9872,9918,6780,5439,4343,4367,5331,632],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/wdyh390a',
        },
        {
          label: 'Day 1 Retention',
          value: '46%',
          sublabel: 'week of Mar 16',
          trend: 'up',
          trendLabel: '+6pp vs prior week',
          sparkline: [36,35,49,43,44,35,41,43,34,38,40,46],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/qq7s3q9d',
        },
        {
          label: 'Unique Share CVR',
          value: '38%',
          sublabel: 'week of Mar 16 (web)',
          trend: 'down',
          trendLabel: '-7pp vs Jan peak (45%)',
          sparkline: [37,41,41,45,43,44,42,40,41,39,39,38],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/6xmfzdk7',
        },
        {
          label: 'Day 0 → Quality Petition',
          value: '32%',
          sublabel: 'week of Mar 16',
          trend: 'neutral',
          trendLabel: 'stable ~30–35% range',
          sparkline: [26,32,41,41,30,36,31,38,31,35,29,32],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/btlur15n',
        },
        {
          label: 'QPs Return Week 1',
          value: '57%',
          sublabel: 'week of Mar 16',
          trend: 'up',
          trendLabel: '+3pp recovery from dip',
          sparkline: [59,64,62,63,60,62,59,60,60,61,54,57],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/xt2fc3wd',
        },
        {
          label: 'Total Share CVR',
          value: '8.5%',
          sublabel: 'this window (web)',
          trend: 'down',
          trendLabel: '-28% vs 2 weeks ago',
          sparkline: null,
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/oi5iuwx6',
        },
      ],
    },
    flag: '🇦🇺',
    name: 'Australia',
    lang: 'English',
    phase: 1,
    phaseColor: '#059669',
    status: 'live',
    launchDate: 'Mar 10, 2026',
    manager: 'Paige Mulholland',
    pipeline: [
      { label: 'Translations', state: 'done' },
      { label: 'QA Build', state: 'done' },
      { label: 'Launched', state: 'live' },
      { label: 'Country Review', state: 'active' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [
      { type: 'translation', tag: 'T', text: '"neighborhood" → "neighbourhood" — Share, petition in person' },
    ],
    jiraTickets: [],
  },

  ca: {
    code: 'ca',
    amplitudeDashboardId: 'n1resfdk',
    analyticsData: {
      lastUpdated: 'Mar 24, 2026',
      dashboardUrl: 'https://app.amplitude.com/analytics/change/dashboard/n1resfdk',
      insights: [
        { type: 'positive', text: 'Strong launch metrics across the board — Day 1 retention (42%), Unique Share CVR (40%), and QP return rate (64%) all meet or exceed Australia\'s benchmarks.' },
        { type: 'positive', text: 'Total Share CVR at 11.9% last complete week — significantly higher than AU\'s current 8.5%, indicating Canadian starters are sharing at a stronger rate.' },
        { type: 'positive', text: 'Quality petitioners returning to dashboard in week 1 at 64% — 7 percentage points above AU\'s 57%, the strongest engagement metric across both markets.' },
        { type: 'warning', text: 'Daily traffic at ~230–250/day reflects Canada\'s smaller market scale. Mar 24 in progress (54 so far). Volume will grow as the user base matures.' },
      ],
      kpis: [
        {
          label: 'Daily Traffic',
          value: '~250',
          sublabel: 'Mar 23 (Mar 24 in progress)',
          trend: 'up',
          trendLabel: 'consistent since Mar 17',
          sparkline: [231,262,248,244,249,182,169,217,222,239,229,226,204,207,249,251,298,246,242,212,205,227,229,250,244,256,194,199,250,54],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/new/7szsy01i',
        },
        {
          label: 'Day 1 Retention',
          value: '42%',
          sublabel: 'week of Mar 16',
          trend: 'neutral',
          trendLabel: 'on par with AU (46%)',
          sparkline: [38,39,41,38,38,35,42,40,42,43,32,42],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/new/7i72zzcm',
        },
        {
          label: 'Unique Share CVR',
          value: '40%',
          sublabel: 'week of Mar 16 (web)',
          trend: 'up',
          trendLabel: '+2pp vs AU (38%)',
          sparkline: [38,43,44,42,45,42,43,42,41,43,43,40],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/new/bxowtz7z',
        },
        {
          label: 'Day 0 → Quality Petition',
          value: '37%',
          sublabel: 'week of Mar 16',
          trend: 'up',
          trendLabel: '+5pp vs AU (32%)',
          sparkline: [27,42,39,33,32,31,35,32,34,39,30,37],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/new/tuxtnx8g',
        },
        {
          label: 'QPs Return Week 1',
          value: '64%',
          sublabel: 'week of Mar 16',
          trend: 'up',
          trendLabel: '+7pp vs AU (57%)',
          sparkline: [48,64,67,63,63,62,65,66,65,60,64,64],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/new/87rkc2oo',
        },
        {
          label: 'Total Share CVR',
          value: '11.9%',
          sublabel: 'last week (web)',
          trend: 'up',
          trendLabel: '+3.4pp vs AU (8.5%)',
          sparkline: null,
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/new/1xnuxtp6',
        },
      ],
    },
    // Note: CHANGE-87841 covers Canada French (FR-CA) separately
    flag: '🇨🇦',
    name: 'Canada',
    lang: 'English',
    phase: 2,
    phaseColor: '#2563eb',
    status: 'live',
    launchDate: 'Mar 16, 2026',
    manager: 'Terry Chemij',
    pipeline: [
      { label: 'Translations', state: 'done' },
      { label: 'QA Build', state: 'done' },
      { label: 'Launched', state: 'live' },
      { label: 'Country Review', state: 'active' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87836', summary: '[QA] Phase 1: Canada English (ENG-CA)', status: 'Done', assignee: 'Unassigned', url: 'https://change.atlassian.net/browse/CHANGE-87836' },
    ],
    linkedBugs: [
      {
        key: 'CHANGE-88796',
        summary: 'Incorrect British English (en-ca) spellings on Starter Dashboard',
        status: 'Implementation',
        priority: 'P2 - Significant',
        assignee: null,
        url: 'https://change.atlassian.net/browse/CHANGE-88796',
      },
    ],
  },

  'in-eng': {
    code: 'in-eng',
    amplitudeDashboardId: '6vq22o7w',
    analyticsData: {
      lastUpdated: 'Mar 26, 2026',
      dashboardUrl: 'https://app.amplitude.com/analytics/change/dashboard/6vq22o7w',
      insights: [
        { type: 'positive', text: 'Massive launch spike: 1,052 unique visitors on Mar 11 (launch +1 day), settling to a healthy ~120–200/day baseline. Strong initial demand signal.' },
        { type: 'positive', text: 'QPs returning to dashboard Week 1 at 47% (Mar 16) — quality petitioners are highly engaged, on par with AU (57%) and CA (64%).' },
        { type: 'warning', text: 'Day 0→QPs conversion at 3% (Mar 16) — lowest of all live markets. May reflect IN starter behavior or pre-launch data dilution. Worth monitoring post-stabilization.' },
        { type: 'warning', text: 'Day 1 Retention at 10% (Mar 16) and Unique Share CVR at 25% — both below other markets. Translation bugs (still open) may be contributing to lower re-engagement.' },
      ],
      kpis: [
        {
          label: 'Daily Traffic',
          value: '~120',
          sublabel: 'avg/day post-launch (web)',
          trend: 'neutral',
          trendLabel: 'settling after launch spike',
          sparkline: [117,131,111,96,71,88,94,69,78,86,110,84,69,316,1052,820,546,421,409,365,390,312,222,172,127,114,122,122,102,100],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/91v4ihxt',
        },
        {
          label: 'Day 1 Retention',
          value: '10%',
          sublabel: 'week of Mar 16',
          trend: 'down',
          trendLabel: 'below all other markets',
          sparkline: [13,13,12,16,14,12,11,12,13,19,8,10],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/j7uki6fe',
        },
        {
          label: 'Unique Share CVR',
          value: '25%',
          sublabel: 'week of Mar 16 (web)',
          trend: 'down',
          trendLabel: 'below AU (38%) + GB (42%)',
          sparkline: [30,36,34,35,34,31,32,36,38,39,32,25],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/gxmbpfnf',
        },
        {
          label: 'Day 0 → Quality Petition',
          value: '3%',
          sublabel: 'week of Mar 16',
          trend: 'down',
          trendLabel: 'lowest of all markets',
          sparkline: [6,10,11,9,9,5,6,7,9,12,2,3],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/xn9jv01v',
        },
        {
          label: 'QPs Return Week 1',
          value: '47%',
          sublabel: 'week of Mar 16',
          trend: 'neutral',
          trendLabel: 'on par with AU (57%)',
          sparkline: [57,71,48,51,51,62,68,55,53,62,34,47],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/szegbgar',
        },
        {
          label: 'Total Share CVR',
          value: '11.9%',
          sublabel: 'week of Mar 16 (web)',
          trend: 'neutral',
          trendLabel: 'above AU (8.5%)',
          sparkline: null,
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/za0kyme6',
        },
      ],
    },
    flag: '🇮🇳',
    name: 'India',
    lang: 'English',
    phase: 2,
    phaseColor: '#2563eb',
    status: 'live',
    launchDate: 'Mar 18, 2026',
    manager: null,
    pipeline: [
      { label: 'Translations', state: 'done' },
      { label: 'QA Build', state: 'done' },
      { label: 'Launched', state: 'live' },
      { label: 'Country Review', state: 'active' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [
      { type: 'translation', tag: 'T', text: '"Energize" → "Energise" — Post an update' },
      { type: 'translation', tag: 'T', text: '"personalized" → "personalised" — Share, social media content' },
      { type: 'translation', tag: 'T', text: '"neighborhood" → "neighbourhood" — Share, petition in person' },
      { type: 'translation', tag: 'T', text: '"we\'e" → "we\'re" (typo) — Contact DM' },
      { type: 'translation', tag: 'T', text: '"Please try again later" → "Kindly try again later" — Petition Activity error' },
      { type: 'translation', tag: 'T', text: '"Please enter a description" → "Kindly enter a description" — Declare Victory' },
      { type: 'passed', tag: 'P', text: 'Left/right columns unequal width — Home, Recent supporters (passed 03/18)' },
      { type: 'passed', tag: 'P', text: 'Missing Next Steps task items — Home (passed 03/17)' },
    ],
    jiraTickets: [],
  },

  gb: {
    code: 'gb',
    amplitudeDashboardId: 'lzeg6r0g',
    analyticsData: {
      lastUpdated: 'Mar 26, 2026',
      dashboardUrl: 'https://app.amplitude.com/analytics/change/dashboard/lzeg6r0g',
      insights: [
        { type: 'positive', text: 'QPs Return Week 1 at 71% (Mar 16) — highest of all live markets. GB quality petitioners are the most engaged cohort across the entire rollout.' },
        { type: 'positive', text: 'Day 0→QPs at 30% (Mar 16) — significantly above AU (32% is close) and 3× India (3%). GB starters convert to quality petitions at a very high rate.' },
        { type: 'positive', text: 'Day 1 Retention at 42% and Unique Share CVR at 42% — both consistently strong across 12 weeks. Traffic stable at ~500/day.' },
        { type: 'warning', text: 'Total Share CVR slipped to 7.8% (partial week of Mar 23) vs 10.4% the prior week — partial data may explain this. Watch for full-week figure.' },
      ],
      kpis: [
        {
          label: 'Daily Traffic',
          value: '~520',
          sublabel: 'avg/day post-launch (web)',
          trend: 'neutral',
          trendLabel: 'stable since launch Mar 18',
          sparkline: [467,464,472,416,409,441,465,495,528,493,469,475,530,601,646,610,545,488,471,553,555,539,562,492,447,444,528,550,527,527],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/821tb682',
        },
        {
          label: 'Day 1 Retention',
          value: '42%',
          sublabel: 'week of Mar 16',
          trend: 'neutral',
          trendLabel: 'consistent 36–43% range',
          sparkline: [36,38,42,38,38,42,43,37,43,37,37,42],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/v3095j4s',
        },
        {
          label: 'Unique Share CVR',
          value: '42%',
          sublabel: 'week of Mar 16 (web)',
          trend: 'neutral',
          trendLabel: 'highest of all markets',
          sparkline: [40,43,46,44,43,43,45,44,42,41,41,42],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/ifl6qyx4',
        },
        {
          label: 'Day 0 → Quality Petition',
          value: '30%',
          sublabel: 'week of Mar 16',
          trend: 'neutral',
          trendLabel: '2nd highest after DE (24%)',
          sparkline: [27,27,31,32,29,30,35,27,33,27,24,30],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/p6btbilu',
        },
        {
          label: 'QPs Return Week 1',
          value: '71%',
          sublabel: 'week of Mar 16',
          trend: 'up',
          trendLabel: 'best of all markets',
          sparkline: [56,65,65,65,65,69,67,65,69,68,60,71],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/bjty2uwk',
        },
        {
          label: 'Total Share CVR',
          value: '10.4%',
          sublabel: 'week of Mar 16 (web)',
          trend: 'neutral',
          trendLabel: 'above AU (8.5%)',
          sparkline: null,
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/7250v5eh',
        },
      ],
    },
    flag: '🇬🇧',
    name: 'Great Britain',
    lang: 'English',
    phase: 2,
    phaseColor: '#2563eb',
    status: 'live',
    launchDate: 'Mar 18, 2026',
    manager: 'Nick Mitchell',
    pipeline: [
      { label: 'Translations', state: 'done' },
      { label: 'QA Build', state: 'done' },
      { label: 'Launched', state: 'live' },
      { label: 'Country Review', state: 'active' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [
      { type: 'visual', tag: 'V', text: '"Room for improvement" breaks mid-word — Home, Petition Strength' },
      { type: 'visual', tag: 'V', text: '"Room for improvement" breaks mid-word — Edit petition, Strengthen your petition' },
      { type: 'passed', tag: 'P', text: 'Missing Next Steps task items — Home (passed 03/17)' },
    ],
    jiraTickets: [
      { key: 'CHANGE-87835', summary: '[QA] Phase 1: Great Britain (GB)', status: 'Done', assignee: 'Sarahi Mireles', url: 'https://change.atlassian.net/browse/CHANGE-87835' },
    ],
    linkedBugs: [
      {
        key: 'CHANGE-88788',
        summary: '"Room for improvement" text in Petition Strength widget breaks incorrectly across two lines.',
        status: 'ToDo',
        priority: 'P2 - Significant',
        assignee: null,
        url: 'https://change.atlassian.net/browse/CHANGE-88788',
      },
      {
        key: 'CHANGE-88891',
        summary: 'Task list missing task items',
        status: 'Closed',
        priority: 'P2 - Significant',
        assignee: null,
        url: 'https://change.atlassian.net/browse/CHANGE-88891',
      },
    ],
  },

  mx: {
    code: 'mx',
    amplitudeDashboardId: 'k4wluhtx',
    analyticsData: {
      lastUpdated: 'Mar 26, 2026',
      dashboardUrl: 'https://app.amplitude.com/analytics/change/dashboard/k4wluhtx',
      insights: [
        { type: 'positive', text: '100% rollout completed Mar 26 — very early data. Traffic running ~55–60/day in initial days, consistent with CA at launch scale.' },
        { type: 'positive', text: 'QPs Return Week 1 at 42% (partial Mar 23 week) — healthy engagement for a new market, above RU (33%) at the same stage.' },
        { type: 'warning', text: 'Day 0→QPs dipped to 7% (week of Mar 9–16, pre-launch period) — expect this to recover now that the dashboard is fully live and translated.' },
        { type: 'warning', text: 'Day 1 Retention at 9% (week of Mar 16) — low pre-launch figure. Post-launch retention is the key metric to watch over the next 2 weeks.' },
      ],
      kpis: [
        {
          label: 'Daily Traffic',
          value: '~55',
          sublabel: 'avg/day (launched Mar 26)',
          trend: 'up',
          trendLabel: 'growing post-100% launch',
          sparkline: [48,57,44,37,30,56,45,45,38,52,40,44,42,81,184,151,120,94,76,77,81,93,94,86,45,51,48,60,54,51],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/19y8zw4l',
        },
        {
          label: 'Day 1 Retention',
          value: '18%',
          sublabel: 'week of Mar 23 (partial)',
          trend: 'neutral',
          trendLabel: 'monitor post-launch',
          sparkline: [25,31,20,14,12,17,27,32,27,32,10,9],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/mhrwrb2s',
        },
        {
          label: 'Unique Share CVR',
          value: '34%',
          sublabel: 'week of Mar 23 (web)',
          trend: 'neutral',
          trendLabel: 'below AU peak (48%)',
          sparkline: [44,36,41,38,38,39,40,46,44,48,30,34],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/rb5xm2vt',
        },
        {
          label: 'Day 0 → Quality Petition',
          value: '15%',
          sublabel: 'week of Mar 23 (partial)',
          trend: 'up',
          trendLabel: 'recovering from pre-launch dip',
          sparkline: [17,20,18,15,8,13,25,28,21,27,5,7],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/65yosuok',
        },
        {
          label: 'QPs Return Week 1',
          value: '42%',
          sublabel: 'week of Mar 23 (partial)',
          trend: 'neutral',
          trendLabel: 'above RU (33%) at launch',
          sparkline: [55,61,41,38,33,53,36,56,44,49,51,45],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/ty6b0qum',
        },
        {
          label: 'Total Share CVR',
          value: '18.3%',
          sublabel: 'current week (partial)',
          trend: 'neutral',
          trendLabel: 'monitor full week',
          sparkline: null,
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/hjp7l2nk',
        },
      ],
    },
    flag: '🇲🇽',
    name: 'Mexico',
    lang: 'Spanish',
    phase: 3,
    phaseColor: '#9333ea',
    status: 'live',
    launchDate: 'Mar 24, 2026',
    manager: 'Alexander Navarro',
    pipeline: [
      { label: 'Translations', state: 'done' },
      { label: 'QA Build', state: 'done' },
      { label: 'Launched', state: 'live' },
      { label: 'Country Review', state: 'active' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [
      { type: 'translation', tag: 'T', text: '"Edit petiti8on" → "Editar petición" — Edit petition page title' },
      { type: 'translation', tag: 'T', text: '"Strengthen your petition" → "Fortalece tu petición" — Edit petition sub-header' },
      { type: 'translation', tag: 'T', text: '"Ask supporters to share with friends" → "Pide a tus seguidores que compartan…" — Post an update' },
      { type: 'translation', tag: 'T', text: '"Ask supporters to contact decision maker" → "Pide a tus seguidores que contacten…" — Post an update' },
      { type: 'translation', tag: 'T', text: '"Celebrate petition news and milestones" → "Celebra las noticias…" — Post an update' },
      { type: 'translation', tag: 'T', text: '"Stories" → "Historias" — Share petition, social media' },
      { type: 'translation', tag: 'T', text: '"Posts" → "Publicaciones" — Share petition, social media' },
      { type: 'translation', tag: 'T', text: 'Currency not localised — Next Steps, Boost reach task (shows USD)' },
      { type: 'translation', tag: 'T', text: 'English "Card Number" shown with country_code=ca, locale=es-419 — Promote page' },
      { type: 'visual', tag: 'V', text: 'Buttons not same height — Home, Next Steps' },
      { type: 'visual', tag: 'V', text: 'Screen jumps/stutters while scrolling — Home tab, Safari desktop' },
      { type: 'passed', tag: 'P', text: 'Petition activity badge persists after viewed — retested 03/18, resolved' },
    ],
    jiraTickets: [],
  },

  de: {
    code: 'de',
    amplitudeDashboardId: 'mbierxxw',
    analyticsData: {
      lastUpdated: 'Mar 26, 2026',
      dashboardUrl: 'https://app.amplitude.com/analytics/change/dashboard/mbierxxw',
      insights: [
        { type: 'positive', text: 'Exceptional Day 0→QPs at 24% (Mar 16) — German starters are the highest-quality converters of all markets. DE is 3× higher than RU and 8× higher than IN.' },
        { type: 'positive', text: 'QPs returning to dashboard in Week 1 at 69% (Mar 16) — tied with GB as best-in-class across all live markets. Quality German petitioners are highly engaged.' },
        { type: 'positive', text: 'Day 1 Retention at 38% and Unique Share CVR at 38% — both strong and consistent across 12 weeks. Dashboard just launched today; these are pre-launch baseline benchmarks.' },
        { type: 'warning', text: 'Total Share CVR at 10.7% (week of Mar 16) — solid but below AU (8.5% is the floor; DE is above average). Mar 23 week at 9.2% shows slight softening — monitor post-launch.' },
      ],
      kpis: [
        {
          label: 'Daily Traffic',
          value: '~250',
          sublabel: 'avg/day pre-launch baseline',
          trend: 'neutral',
          trendLabel: 'consistent ~230–295/day',
          sparkline: [276,241,259,209,203,241,243,249,262,252,238,219,234,294,350,292,294,245,260,276,271,274,248,234,226,224,233,241,264,255],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/cagoy3ki',
        },
        {
          label: 'Day 1 Retention',
          value: '38%',
          sublabel: 'week of Mar 16',
          trend: 'neutral',
          trendLabel: 'stable 35–44% range',
          sparkline: [35,40,37,45,24,42,36,35,41,44,29,38],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/mrb4y339',
        },
        {
          label: 'Unique Share CVR',
          value: '38%',
          sublabel: 'week of Mar 16 (web)',
          trend: 'neutral',
          trendLabel: 'consistent 36–44% range',
          sparkline: [40,42,42,44,38,40,36,39,35,38,37,38],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/6onhsh3k',
        },
        {
          label: 'Day 0 → Quality Petition',
          value: '24%',
          sublabel: 'week of Mar 16',
          trend: 'up',
          trendLabel: 'highest of all markets',
          sparkline: [25,29,29,34,15,27,30,23,30,31,19,24],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/77tpkaa0',
        },
        {
          label: 'QPs Return Week 1',
          value: '69%',
          sublabel: 'week of Mar 16',
          trend: 'up',
          trendLabel: 'best-in-class (tied GB)',
          sparkline: [67,67,59,71,54,65,60,70,65,65,75,69],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/26a0azrl',
        },
        {
          label: 'Total Share CVR',
          value: '10.7%',
          sublabel: 'week of Mar 16 (web)',
          trend: 'neutral',
          trendLabel: 'stable ~10% range',
          sparkline: null,
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/x41mkdke',
        },
      ],
    },
    flag: '🇩🇪',
    name: 'Germany',
    lang: 'Deutsch',
    phase: 4,
    phaseColor: '#ea580c',
    status: 'live',
    launchDate: 'Mar 26, 2026',
    manager: 'Ansgar Lahmann',
    pipeline: [
      { label: 'Translations', state: 'done' },
      { label: 'QA Build', state: 'done' },
      { label: 'Launched', state: 'live' },
      { label: 'Country Review', state: 'active' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [
      { type: 'visual', tag: 'V', text: 'Text and line wrapping issues — Home, Petition overview / Stats' },
      { type: 'visual', tag: 'V', text: 'Alignment: background box vs Download poster button — Share tab, QR module' },
      { type: 'translation', tag: 'T', text: '"Inhalt der petition" → "Inhalt der Petition" (capitalisation) — Edit petition page' },
      { type: 'translation', tag: 'T', text: 'Incorrect word break hyphenation in "Petitionsstärke" card — Edit petition, carousel' },
      { type: 'translation', tag: 'T', text: 'Formal "Ihre Neuigkeit" should be "Deine Neuigkeit" (du-form) — inconsistent usage' },
      { type: 'visual', tag: 'V', text: '"Liste exportieren" splits across 2 lines in button — Mobile' },
      { type: 'translation', tag: 'T', text: '"Mit Hilfe von" → "mithilfe von" (compound preposition) — Mobile' },
      { type: 'translation', tag: 'T', text: '"Anderer" → "Anderer Betrag" or "Eigener Betrag" for custom amount — Mobile' },
      { type: 'translation', tag: 'T', text: '"Ihre Neuigkeit" inconsistent — should be "Deine Neuigkeit" — Mobile' },
    ],
    jiraTickets: [
      { key: 'CHANGE-87839', summary: '[QA] Phase 3: Germany (DE)', status: 'Implementation', assignee: 'Courtney Atkinson', url: 'https://change.atlassian.net/browse/CHANGE-87839' },
    ],
  },

  fr: {
    code: 'fr',
    flag: '🇫🇷',
    name: 'France',
    lang: 'Français',
    phase: 4,
    phaseColor: '#ea580c',
    status: 'live',
    launchDate: 'Mar 31, 2026',
    amplitudeDashboardId: '5067kpzq',
    analyticsData: {
      lastUpdated: 'Mar 31, 2026',
      dashboardUrl: 'https://app.amplitude.com/analytics/change/dashboard/5067kpzq',
      insights: [],
      kpis: [],
    },
    manager: 'Maria Ieschenko',
    feedbackNote: 'Launched Mar 31, 2026. Courtney completed QA, bug tickets filed. Maria\'s translation suggestions incorporated by Olga into Weblate.',
    pipeline: [
      { label: 'Translations', state: 'done', note: 'Olga incorporated Maria\'s suggestions into Weblate' },
      { label: 'QA Build', state: 'done', note: 'Courtney QA complete, tickets filed' },
      { label: 'Country Review', state: 'done', note: 'Maria reviewed + shared suggestions' },
      { label: 'Launch', state: 'live', note: 'Mar 31, 2026' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87840', summary: '[QA] Phase 3: France (FR)', status: 'ToDo', assignee: 'Courtney Atkinson', url: 'https://change.atlassian.net/browse/CHANGE-87840' },
    ],
  },

  'ca-fr': {
    code: 'ca-fr',
    flag: '🇨🇦',
    name: 'Canada',
    lang: 'Français (Canada)',
    phase: 4,
    phaseColor: '#ea580c',
    status: 'live',
    launchDate: 'Mar 31, 2026',
    amplitudeDashboardId: 'n1resfdk',
    analyticsData: {
      lastUpdated: 'Mar 31, 2026',
      dashboardUrl: 'https://app.amplitude.com/analytics/change/dashboard/n1resfdk',
      insights: [],
      kpis: [],
    },
    manager: null,
    feedbackNote: 'Launched Mar 31, 2026 alongside France. Using CA dashboard for analytics.',
    pipeline: [
      { label: 'Translations', state: 'done' },
      { label: 'QA Build', state: 'done' },
      { label: 'Country Review', state: 'done' },
      { label: 'Launch', state: 'live', note: 'Mar 31, 2026' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87841', summary: '[QA] Phase 3: Canada French (FR-CA)', status: 'ToDo', assignee: 'Unassigned', url: 'https://change.atlassian.net/browse/CHANGE-87841' },
    ],
  },

  ru: {
    code: 'ru',
    amplitudeDashboardId: 'veh0y5i1',
    analyticsData: {
      lastUpdated: 'Mar 26, 2026',
      dashboardUrl: 'https://app.amplitude.com/analytics/change/dashboard/veh0y5i1',
      insights: [
        { type: 'positive', text: 'Total Share CVR at 14.1% (week of Mar 16) — highest of all markets. Russian starters who view the dashboard convert to sharing at an exceptional rate.' },
        { type: 'positive', text: 'Unique Share CVR at 39% (Mar 16) — on par with AU and CA benchmarks, strong for a pre-launch baseline.' },
        { type: 'warning', text: 'Day 1 Retention at 19% (Mar 16) — significantly lower than DE (38%) and GB (42%). New market; expected to improve post-launch as the user base matures.' },
        { type: 'warning', text: 'Day 0→QPs at 9% (Mar 16) — below DE (24%) and GB (30%). Dashboard just launched today (Mar 26); watch this metric over the first 2 weeks post-launch.' },
      ],
      kpis: [
        {
          label: 'Daily Traffic',
          value: '~75',
          sublabel: 'avg/day pre-launch baseline',
          trend: 'neutral',
          trendLabel: 'small base, will grow fast',
          sparkline: [88,76,81,61,78,83,74,86,86,78,60,46,56,75,112,93,78,74,73,81,72,71,79,70,57,66,60,93,64,69],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/tkgv4edf',
        },
        {
          label: 'Day 1 Retention',
          value: '19%',
          sublabel: 'week of Mar 16',
          trend: 'down',
          trendLabel: 'below DE (38%) + GB (42%)',
          sparkline: [20,20,22,22,26,26,23,21,23,21,15,19],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/7id5986h',
        },
        {
          label: 'Unique Share CVR',
          value: '39%',
          sublabel: 'week of Mar 16 (web)',
          trend: 'neutral',
          trendLabel: 'on par with AU + CA',
          sparkline: [33,36,37,31,39,39,37,31,38,32,30,39],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/6jgwltx8',
        },
        {
          label: 'Day 0 → Quality Petition',
          value: '9%',
          sublabel: 'week of Mar 16',
          trend: 'down',
          trendLabel: 'below DE (24%) + GB (30%)',
          sparkline: [8,9,16,11,10,11,10,9,12,11,6,9],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/nnc3e049',
        },
        {
          label: 'QPs Return Week 1',
          value: '33%',
          sublabel: 'week of Mar 16',
          trend: 'down',
          trendLabel: 'below DE (69%) + GB (71%)',
          sparkline: [46,65,40,49,42,41,41,45,48,37,43,33],
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/2gnt8iip',
        },
        {
          label: 'Total Share CVR',
          value: '14.1%',
          sublabel: 'week of Mar 16 (web)',
          trend: 'up',
          trendLabel: 'highest of all markets',
          sparkline: null,
          chartUrl: 'https://app.amplitude.com/analytics/change/chart/xa2kk3f0',
        },
      ],
    },
    flag: '🇷🇺',
    name: 'Russia',
    lang: 'Русский',
    phase: 4,
    phaseColor: '#ea580c',
    status: 'live',
    launchDate: 'Mar 26, 2026',
    manager: null,
    feedbackNote: 'Promotions bug (CHANGE-89248) deferred as fast-follow — promotions not enabled in RU so low risk.',
    pipeline: [
      { label: 'Translations', state: 'done' },
      { label: 'QA Build', state: 'done' },
      { label: 'Launched', state: 'live' },
      { label: 'Country Review', state: 'active' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [],
    jiraTickets: [],
    linkedBugs: [
      {
        key: 'CHANGE-89248',
        summary: 'Currency not in correct locale — Promotions (deferred fast-follow, promotions not enabled in RU)',
        status: 'ToDo',
        priority: 'P2 - Significant',
        assignee: 'Sarahi Mireles',
        url: 'https://change.atlassian.net/browse/CHANGE-89248',
      },
    ],
  },

  jp: {
    code: 'jp',
    flag: '🇯🇵',
    name: 'Japan',
    lang: '日本語',
    phase: 4,
    phaseColor: '#ea580c',
    status: 'live',
    launchDate: 'Apr 2, 2026',
    manager: 'AI Abe',
    feedbackNote: 'Launched Apr 2, 2026. Post-launch review via #watercooler.',
    amplitudeDashboardId: null,
    analyticsData: {
      lastUpdated: 'Apr 27, 2026',
      dashboardUrl: null,
      insights: [
        { type: 'warning', text: 'Amplitude dashboard not yet configured for Japan — add dashboard ID and chart IDs to enable analytics tracking.' },
      ],
      kpis: [],
    },
    pipeline: [
      { label: 'Translations', state: 'done' },
      { label: 'QA Build', state: 'done', note: 'Courtney completed' },
      { label: 'Country Review', state: 'active', note: 'Via #watercooler' },
      { label: 'Launch', state: 'live', note: 'Apr 2, 2026' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87843', summary: '[QA] Phase 4: Japan (JP)', status: 'Closed', assignee: 'Courtney Atkinson', url: 'https://change.atlassian.net/browse/CHANGE-87843' },
    ],
  },

  'in-hi': {
    code: 'in-hi',
    flag: '🇮🇳',
    name: 'India',
    lang: 'Hindi',
    phase: 4,
    phaseColor: '#ea580c',
    status: 'live',
    launchDate: 'Apr 2, 2026',
    manager: null,
    feedbackNote: 'Launched Apr 2, 2026. Post-launch review via #watercooler.',
    amplitudeDashboardId: null,
    analyticsData: {
      lastUpdated: 'Apr 27, 2026',
      dashboardUrl: null,
      insights: [
        { type: 'warning', text: 'Amplitude dashboard not yet configured for India (Hindi) — add dashboard ID and chart IDs to enable analytics tracking.' },
      ],
      kpis: [],
    },
    pipeline: [
      { label: 'Translations', state: 'done' },
      { label: 'QA Build', state: 'done', note: 'Courtney completed' },
      { label: 'Country Review', state: 'active', note: 'Via #watercooler' },
      { label: 'Launch', state: 'live', note: 'Apr 2, 2026' },
      { label: 'Post-Launch Monitoring', state: 'active' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87847', summary: '[QA] Phase 5: India (HI-IN)', status: 'Closed', assignee: 'Courtney Atkinson', url: 'https://change.atlassian.net/browse/CHANGE-87847' },
    ],
  },

  br: {
    code: 'br',
    flag: '🇧🇷',
    name: 'Brazil',
    lang: 'Português',
    phase: 5,
    phaseColor: '#db2777',
    status: 'upcoming',
    targetDate: 'Apr 2, 2026',
    manager: 'Monica Souza',
    feedbackNote: 'Remaining translations expected by Mar 27. Targeting rollout week of Mar 30.',
    pipeline: [
      { label: 'Translations', state: 'active', note: 'Expected by Mar 27' },
      { label: 'QA Build', state: 'pending' },
      { label: 'Launch', state: 'pending' },
      { label: 'Country Review', state: 'active', note: 'BE spike / tech setup' },
      { label: 'Post-Launch Monitoring', state: 'pending' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87842', summary: '[QA] Phase 4: Brazil (BR)', status: 'ToDo', assignee: 'Unassigned', url: 'https://change.atlassian.net/browse/CHANGE-87842' },
    ],
  },

  ar: {
    code: 'ar',
    flag: '🇦🇷',
    name: 'Argentina',
    lang: 'Español',
    phase: 5,
    phaseColor: '#db2777',
    status: 'upcoming',
    targetDate: 'Apr 2, 2026',
    manager: 'Milva Mazzocchi',
    pipeline: [
      { label: 'Translations', state: 'active' },
      { label: 'QA Build', state: 'pending' },
      { label: 'Launch', state: 'pending' },
      { label: 'Country Review', state: 'active', note: 'BE spike' },
      { label: 'Post-Launch Monitoring', state: 'pending' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87846', summary: '[QA] Phase 5: Argentina (AR)', status: 'ToDo', assignee: 'Unassigned', url: 'https://change.atlassian.net/browse/CHANGE-87846' },
    ],
  },

  th: {
    code: 'th',
    flag: '🇹🇭',
    name: 'Thailand',
    lang: 'ภาษาไทย',
    phase: 5,
    phaseColor: '#db2777',
    status: 'upcoming',
    targetDate: 'Apr 2, 2026',
    manager: null,
    pipeline: [
      { label: 'Translations', state: 'active' },
      { label: 'QA Build', state: 'pending' },
      { label: 'Launch', state: 'pending' },
      { label: 'Country Review', state: 'pending' },
      { label: 'Post-Launch Monitoring', state: 'pending' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87850', summary: '[QA] Phase 5: Thailand (TH)', status: 'ToDo', assignee: 'Unassigned', url: 'https://change.atlassian.net/browse/CHANGE-87850' },
    ],
  },

  tr: {
    code: 'tr',
    flag: '🇹🇷',
    name: 'Turkey',
    lang: 'Türkçe',
    phase: 5,
    phaseColor: '#db2777',
    status: 'upcoming',
    targetDate: 'Apr 2, 2026',
    manager: 'Didem',
    pipeline: [
      { label: 'Translations', state: 'active' },
      { label: 'QA Build', state: 'pending' },
      { label: 'Launch', state: 'pending' },
      { label: 'Country Review', state: 'pending' },
      { label: 'Post-Launch Monitoring', state: 'pending' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87849', summary: '[QA] Phase 5: Turkey (TR)', status: 'ToDo', assignee: 'Unassigned', url: 'https://change.atlassian.net/browse/CHANGE-87849' },
    ],
  },

  it: {
    code: 'it',
    flag: '🇮🇹',
    name: 'Italy',
    lang: 'Italiano',
    phase: 5,
    phaseColor: '#db2777',
    status: 'upcoming',
    targetDate: 'Apr 2, 2026',
    manager: 'Fiamma Goretti',
    pipeline: [
      { label: 'Translations', state: 'active' },
      { label: 'QA Build', state: 'pending' },
      { label: 'Launch', state: 'pending' },
      { label: 'Country Review', state: 'pending' },
      { label: 'Post-Launch Monitoring', state: 'pending' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87844', summary: '[QA] Phase 4: Italy (IT)', status: 'ToDo', assignee: 'Unassigned', url: 'https://change.atlassian.net/browse/CHANGE-87844' },
    ],
  },

  es: {
    code: 'es',
    flag: '🇪🇸',
    name: 'Spain',
    lang: 'Español',
    phase: 5,
    phaseColor: '#db2777',
    status: 'upcoming',
    targetDate: 'Apr 2, 2026',
    manager: 'Maria de la Cruz',
    pipeline: [
      { label: 'Translations', state: 'active' },
      { label: 'QA Build', state: 'pending' },
      { label: 'Launch', state: 'pending' },
      { label: 'Country Review', state: 'pending' },
      { label: 'Post-Launch Monitoring', state: 'pending' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87845', summary: '[QA] Phase 5: Spain (ES)', status: 'ToDo', assignee: 'Unassigned', url: 'https://change.atlassian.net/browse/CHANGE-87845' },
    ],
  },

  id: {
    code: 'id',
    flag: '🇮🇩',
    name: 'Indonesia',
    lang: 'Bahasa Indonesia',
    phase: 5,
    phaseColor: '#db2777',
    status: 'upcoming',
    targetDate: 'Apr 2, 2026',
    manager: null,
    pipeline: [
      { label: 'Translations', state: 'active' },
      { label: 'QA Build', state: 'pending' },
      { label: 'Launch', state: 'pending' },
      { label: 'Country Review', state: 'pending' },
      { label: 'Post-Launch Monitoring', state: 'pending' },
    ],
    bugs: [],
    jiraTickets: [
      { key: 'CHANGE-87848', summary: '[QA] Phase 5: Indonesia (ID)', status: 'ToDo', assignee: 'Unassigned', url: 'https://change.atlassian.net/browse/CHANGE-87848' },
    ],
  },
};

// Apply live synced data (Jira statuses, Amplitude KPIs) over static data
export const markets = Object.fromEntries(
  Object.entries(_markets).map(([k, v]) => [k, syncMarket(v)])
);
