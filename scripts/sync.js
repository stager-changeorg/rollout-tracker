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
    `${JIRA_BASE}/issue/${key}?fields=status,assignee,summary,priority,comment`,
    { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(`Jira ${key}: HTTP ${res.status}`);
  const data = await res.json();
  const fields = data.fields;
  const comments = fields.comment?.comments ?? [];
  const latestComment = comments.length
    ? comments[comments.length - 1]
    : null;
  return {
    status:        fields.status?.name ?? null,
    assignee:      fields.assignee?.displayName ?? 'Unassigned',
    priority:      fields.priority?.name ?? null,
    latestComment: latestComment
      ? { author: latestComment.author?.displayName, body: latestComment.body?.content?.[0]?.content?.[0]?.text ?? '' }
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

async function syncAmplitude() {
  const result = {};
  await Promise.allSettled(
    AMP_CHARTS.map(async chartId => {
      try {
        const d = await fetchAmplitudeChart(chartId);
        if (d) {
          result[chartId] = d;
          console.log(`  ✓ Amplitude ${chartId}: latest=${d.latestRaw} trend=${d.trend}`);
        }
      } catch (e) {
        console.error(`  ✗ Amplitude ${chartId}: ${e.message}`);
      }
    })
  );
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

  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ syncedData.json updated (${new Date().toLocaleTimeString()})`);
}

main().catch(e => { console.error(e); process.exit(1); });
