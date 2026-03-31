#!/bin/bash
# Runs sync + deploy. Called by system cron every hour.
# Logs to /tmp/rollout-sync.log

cd /Users/samaratager/Claude/Projects/q2-strategy

export JIRA_EMAIL="stager@change.org"
export JIRA_TOKEN="ATATT3xFfGF04j8PhpFUSTRFMN5-hlcl2iPfmtxja1Tsdc46W3kCidUyFyTB3B71NGVk5icFdfpmK9L6Vha5smKu-lVMkLiBhO1UWherDkUwNyklr-SlAySjab5m4SerhD2YsFUVXVD8SP3ehh-y2HOoGDcFAP6QohNZ3MJzK27wdFcdzWSxUBY=0719F37C"
export AMPLITUDE_API_KEY="de5cb28b6827a5150539cb21e04e8f61"
export AMPLITUDE_API_SECRET="7e6c775d6da42239b2fce3bfb848673c"

echo "=== $(date) ===" >> /tmp/rollout-sync.log
node scripts/sync.js >> /tmp/rollout-sync.log 2>&1
npm run deploy >> /tmp/rollout-sync.log 2>&1
echo "Done." >> /tmp/rollout-sync.log
