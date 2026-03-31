// Watches dist/ for changes (triggered by vite build --watch) and auto-pushes to GitHub Pages
import { watch } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const DEPLOY_DIR = '/tmp/rollout-deploy';

let debounce = null;

function deploy() {
  try {
    execSync(`cd "${DEPLOY_DIR}" && rm -rf * && cp -r "${DIST}/." . && git add -A`, { stdio: 'inherit' });
    const diff = execSync(`cd "${DEPLOY_DIR}" && git diff --cached --name-only`).toString().trim();
    if (!diff) {
      console.log('[watch-deploy] No changes.');
      return;
    }
    execSync(`cd "${DEPLOY_DIR}" && git commit -m "Auto-deploy $(date '+%Y-%m-%d %H:%M:%S')" && git push origin gh-pages`, { stdio: 'inherit' });
    console.log('[watch-deploy] ✓ Deployed → https://stager-changeorg.github.io/rollout-tracker/rollout');
  } catch (e) {
    console.error('[watch-deploy] Deploy failed:', e.message);
  }
}

watch(DIST, { recursive: true }, (event, filename) => {
  if (!filename || filename.includes('.git')) return;
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    console.log(`[watch-deploy] Change detected: ${filename}`);
    deploy();
  }, 1500);
});

console.log('[watch-deploy] Watching dist/ for changes. Saves will auto-deploy.');
