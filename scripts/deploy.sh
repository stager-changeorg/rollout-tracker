#!/bin/bash
set -e

DEPLOY_DIR="/tmp/rollout-deploy"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"

echo "Building..."
cd "$ROOT"
npm run build

# Inject 404.html for SPA routing on GitHub Pages
cat > "$DIST/404.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
<script>
  var seg = window.location.pathname.replace('/rollout-tracker', '');
  var query = window.location.search;
  var hash = window.location.hash;
  window.location.replace('/rollout-tracker/?p=' + encodeURIComponent(seg) + (query ? '&q=' + encodeURIComponent(query.slice(1)) : '') + hash);
</script>
</head>
</html>
EOF

echo "Deploying..."
cd "$DEPLOY_DIR"
git fetch origin gh-pages
git reset --hard origin/gh-pages
rm -rf *
cp -r "$DIST/." .
git add -A
git diff --cached --quiet && echo "No changes to deploy." && exit 0
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')"
git push origin gh-pages
echo "✓ Live at https://stager-changeorg.github.io/rollout-tracker/#/rollout"
