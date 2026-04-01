#!/usr/bin/env node
/**
 * sync.js — fetches live data from Jira and Amplitude, writes src/data/syncedData.json
 * Run: node scripts/sync.js
 * Requires env vars: JIRA_EMAIL, JIRA_TOKEN, AMPLITUDE_API_KEY, AMPLITUDE_API_SECRET
 */

import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '../src/data/syncedData.json');

const JIRA_BASE = 'https://change.atlassian.net/rest/api/3';
const AMPLITUDE_BASE = 'https://amplitude.com/api/3/chart';

const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_TOKEN = process.env.JIRA_TOKEN;
const AMP_KEY    = process.env.AMPLITUDE_API_KEY;
const AMP_SECRET = process.env.AMPLITUDE_API_SECRET;

const missingJira = !JIRA_EMAIL || !JIRA_TOKEN;
const missingAmp  = !AMP_KEY || !AMP_SECRET;

if (missingJira) console.warn('⚠ JIRA_EMAIL / JIRA_TOKEN not set — skipping Jira sync');
if (missingAmp)  console.warn('⚠ AMPLITUDE_API_KEY / AMPLITUDE_API_SECRET not set — skipping Amplitude sync');

// ─── All Jira ticket keys referenced in rolloutData.js ────────────────────────
const JIRA_KEYS = [
  // Epics
  'CHANGE-83693', 'CHANGE-83975',
  // QA tickets
  'CHANGE-87836', 'CHANGE-87835', 'CHANGE-87839', 'CHANGE-87840',
  'CHANGE-87841', 'CHANGE-87843', 'CHANGE-87847', 'CHANGE-87842',
  'CHANGE-87846', 'CHANGE-87850', 'CHANGE-87849', 'CHANGE-87844',
  'CHANGE-87845', 'CHANGE-87848',
  // Bug tickets
  'CHANGE-88796', 'CHANGE-88788', 'CHANGE-88891', 'CHANGE-89248',
];

// ─── All Amplitude chart IDs referenced in rolloutData.js ─────────────────────
const AMP_CHARTS = [
  // AU
  'wdyh390a', 'qq7s3q9d', '6xmfzdk7', 'btlur15n', 'xt2fc3wd', 'oi5iuwx6',
  // CA
  '7szsy01i', '7i72zzcm', 'bxowtz7z', 'tuxtnx8g', '87rkc2oo', '1xnuxtp6',
  // IN-ENG
  '91v4ihxt', 'j7uki6fe', 'gxmbpfnf', 'xn9jv01v', 'szegbgar', 'za0kyme6',
  // GB
  '821tb682', 'v3095j4s', 'ifl6qyx4', 'p6btbilu', 'bjty2uwk', '7250v5eh',
  // MX
  '19y8zw4l', 'mhrwrb2s', 'rb5xm2vt', '65yosuok', 'ty6b0qum', 'hjp7l2nk',
  // DE
  'cagoy3ki', 'mrb4y339', '6onhsh3k', '77tpkaa0', '26a0azrl', 'x41mkdke',
  // RU
  'tkgv4edf', '7id5986h', '6jgwltx8', 'nnc3e049', '2gnt8iip', 'xa2kk3f0',
];

// ─── Jira fetch ────────────────────────────────────────────────────────────────
async function fetchJiraIssue(key) {
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');
  const res = await fetch(
    `${JIRA_BASE}/issue/${key}?fields=status,assignee,summary,priority,comment,description,updated,created`,
    { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(`Jira ${key}: HTTP ${res.status}`);
  const data = await res.json();
  const fields = data.fields;
  const comments = fields.comment?.comments ?? [];
  const latestComment = comments.length
    ? comments[comments.length - 1]
    : null;

  // Extract plain text from Atlassian Document Format description
  function extractText(node) {
    if (!node) return '';
    if (node.type === 'text') return node.text ?? '';
    if (node.content) return node.content.map(extractText).join(' ');
    return '';
  }
  const descriptionText = extractText(fields.description).replace(/\s+/g, ' ').trim();

  return {
    status:        fields.status?.name ?? null,
    assignee:      fields.assignee?.displayName ?? 'Unassigned',
    assigneeEmail: fields.assignee?.emailAddress ?? null,
    priority:      fields.priority?.name ?? null,
    updatedAt:     fields.updated ?? null,
    createdAt:     fields.created ?? null,
    description:   descriptionText.slice(0, 500) || null,
    latestComment: latestComment
      ? {
          author: latestComment.author?.displayName,
          body: extractText(latestComment.body).replace(/\s+/g, ' ').trim().slice(0, 300),
          created: latestComment.created ?? null,
        }
      : null,
  };
}

async function syncJira() {
  const result = {};
  await Promise.allSettled(
    JIRA_KEYS.map(async key => {
      try {
        result[key] = await fetchJiraIssue(key);
        console.log(`  ✓ Jira ${key}: ${result[key].status}`);
      } catch (e) {
        console.error(`  ✗ Jira ${key}: ${e.message}`);
      }
    })
  );
  return result;
}

// ─── Amplitude fetch ───────────────────────────────────────────────────────────
function formatValue(raw, existingValue) {
  if (existingValue?.endsWith('%')) {
    return `${Math.round(raw)}%`;
  }
  if (existingValue?.toUpperCase().endsWith('K')) {
    return raw >= 1000 ? `~${(raw / 1000).toFixed(1)}K` : `~${Math.round(raw)}`;
  }
  if (existingValue?.toUpperCase().endsWith('M')) {
    return raw >= 1000000 ? `~${(raw / 1000000).toFixed(1)}M` : `~${(raw / 1000).toFixed(1)}K`;
  }
  return `${Math.round(raw)}`;
}

function calcTrend(series) {
  if (!series || series.length < 2) return 'neutral';
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  if (!prev || prev === 0) return 'neutral';
  const pct = (last - prev) / prev;
  if (pct > 0.05) return 'up';
  if (pct < -0.05) return 'down';
  return 'neutral';
}

async function fetchAmplitudeChart(chartId) {
  const auth = Buffer.from(`${AMP_KEY}:${AMP_SECRET}`).toString('base64');
  const res = await fetch(`${AMPLITUDE_BASE}/${chartId}/query`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`Amplitude ${chartId}: HTTP ${res.status}`);
  const data = await res.json();

  // Amplitude returns: data.series = array of series, each series is array of {value, date}
  const series = data?.data?.series?.[0];
  if (!series || series.length === 0) return null;

  const sparkline = series.map(pt => typeof pt === 'object' ? pt.value : pt).filter(v => v != null);
  const latest = sparkline[sparkline.length - 1];
  const trend = calcTrend(sparkline);

  return { sparkline: sparkline.slice(-30), latestRaw: latest, trend };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function syncAmplitude() {
  const result = {};
  // Sequential with 300ms gap to avoid 429 rate limiting
  for (const chartId of AMP_CHARTS) {
    try {
      const d = await fetchAmplitudeChart(chartId);
      if (d) {
        result[chartId] = d;
        console.log(`  ✓ Amplitude ${chartId}: latest=${d.latestRaw} trend=${d.trend}`);
      }
    } catch (e) {
      console.error(`  ✗ Amplitude ${chartId}: ${e.message}`);
    }
    await sleep(300);
  }
  return result;
}

// ─── Google Sheets sync ────────────────────────────────────────────────────────

const SHEETS = {
  qaTestPlan: {
    url: 'https://docs.google.com/spreadsheets/d/1sigXxrV7IB2D27IAjiGmB2hHW6F7_DmN/export?format=csv&gid=642014652',
    label: 'QA Test Plan',
  },
  translationTracking: {
    url: 'https://docs.google.com/spreadsheets/d/1MZMLxVp_ZRmotExGS0gR-7m2qOcbWKub_tyxj3pWGBA/export?format=csv&gid=1015843822',
    label: 'Translation Tracking',
  },
};

// Map sheet locale headers → rolloutData.js market codes
const LOCALE_TO_CODE = {
  'deutsch': 'de',
  'germany': 'de',
  'de-de': 'de',
  'australia': 'au',
  'en-au': 'au',
  'canada': 'ca',
  'en-ca': 'ca',
  'united kingdom': 'gb',
  'en-gb': 'gb',
  'india': 'in-eng',
  'en-in': 'in-eng',
  'español (espana': 'es',
  'es-es': 'es',
  'español (latinoamerica': 'mx',
  'es-419': 'mx',
  'español (argentina': 'ar',
  'es-ar': 'ar',
  'français': 'fr',
  'fr-fr': 'fr',
  'hindi': 'in-hi',
  'hi-in': 'in-hi',
  'bahasa indonesia': 'id',
  'id-id': 'id',
  'italiano': 'it',
  'it-it': 'it',
  '日本語': 'jp',
  'ja-jp': 'jp',
  'português': 'br',
  'pt-br': 'br',
  'pусский': 'ru',
  'russia': 'ru',
  'ru-ru': 'ru',
  'ภาษาไทย': 'th',
  'th-th': 'th',
  'türkçe': 'tr',
  'tr-tr': 'tr',
};

function detectMarket(row) {
  const text = row[0]?.toLowerCase() ?? '';
  for (const [key, code] of Object.entries(LOCALE_TO_CODE)) {
    if (text.includes(key)) return code;
  }
  return null;
}

function classifyBug(text) {
  const t = text.toLowerCase();
  if (t.includes('translat') || t.includes('should be') || t.includes('incorrect') || t.includes('spelling') || t.includes('tense') || t.includes('plural') || t.includes('gender')) return 'translation';
  return 'visual';
}

function parseQATestPlan(csv) {
  const lines = csv.split('\n');
  const bugs = {}; // marketCode → [{type, tag, text, page, section, status, retestDate, notes}]
  let currentMarket = null;

  for (const line of lines) {
    // Parse CSV row (handle quoted fields)
    const cols = line.match(/(".*?"|[^,]*)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) ?? [];
    if (!cols.length) continue;

    // Detect market header row
    const market = detectMarket(cols);
    if (market) { currentMarket = market; continue; }

    // Skip headers, empty rows, end markers
    const issue = cols[0];
    if (!issue || issue === 'Issue' || issue === 'End of Section' || issue.startsWith('[Global')) continue;

    // Skip rows that are just dashes (no issue)
    const retestStatus = cols[5]?.trim();
    if (issue === '' && retestStatus !== 'Pass') continue;
    if (!currentMarket || !issue) continue;

    if (!bugs[currentMarket]) bugs[currentMarket] = [];

    const isPassed = retestStatus === 'Pass';
    bugs[currentMarket].push({
      type:       isPassed ? 'passed' : classifyBug(issue),
      tag:        isPassed ? 'P' : classifyBug(issue) === 'translation' ? 'T' : 'V',
      text:       issue,
      page:       cols[2] || null,
      section:    cols[3] || null,
      status:     isPassed ? 'passed' : (cols[7]?.toLowerCase().includes('filed') ? 'filed' : 'open'),
      retestDate: cols[6] || null,
      notes:      cols[7] || null,
    });
  }
  return bugs;
}

function parseTranslationTracking(csv) {
  const lines = csv.split('\n');
  const suggestions = []; // flat list — no market header in this sheet on this tab

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].match(/(".*?"|[^,]*)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) ?? [];
    const issue = cols[0];
    if (!issue) continue;
    suggestions.push({
      tab:         cols[0] || null,
      section:     cols[1] || null,
      component:   cols[2] || null,
      currentText: cols[3] || null,
      suggested:   cols[4] || null,
      issueDesc:   cols[5] || null,
      blocking:    cols[6] || null,
      fixed:       cols[7] || null,
    });
  }
  return suggestions;
}

async function fetchSheetCSV(url) {
  // Google Sheets export redirects — follow the redirect
  const res1 = await fetch(url, { redirect: 'follow' });
  if (!res1.ok) throw new Error(`Sheet fetch failed: ${res1.status}`);
  return res1.text();
}

async function syncSheets() {
  const result = { qaTestPlan: {}, translationSuggestions: [] };

  try {
    console.log('  Fetching QA Test Plan...');
    const csv1 = await fetchSheetCSV(SHEETS.qaTestPlan.url);
    result.qaTestPlan = parseQATestPlan(csv1);
    const total = Object.values(result.qaTestPlan).reduce((s, arr) => s + arr.length, 0);
    console.log(`  ✓ QA Test Plan: ${total} issues across ${Object.keys(result.qaTestPlan).length} markets`);
  } catch (e) {
    console.error(`  ✗ QA Test Plan: ${e.message}`);
  }

  try {
    console.log('  Fetching Translation Tracking...');
    const csv2 = await fetchSheetCSV(SHEETS.translationTracking.url);
    result.translationSuggestions = parseTranslationTracking(csv2);
    console.log(`  ✓ Translation Tracking: ${result.translationSuggestions.length} suggestions`);
  } catch (e) {
    console.error(`  ✗ Translation Tracking: ${e.message}`);
  }

  return result;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Syncing data sources...\n');

  // Load existing syncedData to preserve last-known values on partial failures
  let existing = {};
  try {
    existing = JSON.parse(readFileSync(OUT_FILE, 'utf8'));
  } catch {}

  const output = {
    lastSynced: new Date().toISOString(),
    jira:      existing.jira      ?? {},
    amplitude: existing.amplitude ?? {},
    sheets:    existing.sheets    ?? {},
  };

  if (!missingJira) {
    console.log('📋 Fetching Jira...');
    const jiraData = await syncJira();
    output.jira = { ...existing.jira, ...jiraData };
  }

  if (!missingAmp) {
    console.log('\n📊 Fetching Amplitude...');
    const ampData = await syncAmplitude();
    output.amplitude = { ...existing.amplitude, ...ampData };
  }

  console.log('\n📝 Fetching Google Sheets...');
  output.sheets = await syncSheets();

  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ syncedData.json updated (${new Date().toLocaleTimeString()})`);
}

main().catch(e => { console.error(e); process.exit(1); });
