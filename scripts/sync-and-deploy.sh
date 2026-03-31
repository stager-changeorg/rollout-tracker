#!/bin/bash
# Runs sync + deploy. Called by system cron every hour.
# Logs to /tmp/rollout-sync.log

cd /Users/samaratager/Claude/Projects/q2-strategy

export JIRA_EMAIL="stager@change.org"
export JIRA_TOKEN="ATATT3xFfGF04j8PhpFUSTRFMN5-hlcl2iPfmtxja1Tsdc46W3kCidUyFyTB3B71NGVk5icFdfpmK9L6Vha5smKu-lVMkLiBhO1UWherDkUwNyklr-SlAySjab5m4SerhD2YsFUVXVD8SP3ehh-y2HOoGDcFAP6QohNZ3MJzK27wdFcdzWSxUBY=0719F37C"
export AMPLITUDE_API_KEY="90adafdcdd52630bc3d0f88290a596c1"
export AMPLITUDE_API_SECRET="90adafdcdd52630bc3d0f88290a596c1"

echo "=== $(date) ===" >> /tmp/rollout-sync.log
node scripts/sync.js >> /tmp/rollout-sync.log 2>&1
npm run deploy >> /tmp/rollout-sync.log 2>&1
echo "Done." >> /tmp/rollout-sync.log
