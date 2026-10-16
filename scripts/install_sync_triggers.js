const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DESKTOP_PROJECTS_DIR = 'c:/Users/sche-/Desktop/Programmieren Projekte';

const PROJECTS = [
    'Amazon 2.0',
    'EcoChef',
    'ElektroCheck AI',
    'Finanzenportfolio',
    'Informatik-lernen',
    'ManuFaktur',
    'Minecraft',
    'Wohnungssuche KI',
];

const WORKFLOW_CONTENT = `name: Notify Portfolio Sync

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  notify-portfolio:
    name: Trigger Portfolio Monorepo Update
    runs-on: ubuntu-latest
    steps:
      - name: Dispatch Event to Portfolio Monorepo
        continue-on-error: true
        env:
          SYNC_TOKEN: \${{ secrets.PORTFOLIO_SYNC_PAT }}
        run: |
          if [ -n "$SYNC_TOKEN" ]; then
            echo "Triggering automated portfolio sync in Schengii/Umschulung-FIAE..."
            curl -s -X POST \\
              -H "Accept: application/vnd.github+json" \\
              -H "Authorization: Bearer $SYNC_TOKEN" \\
              https://api.github.com/repos/Schengii/Umschulung-FIAE/dispatches \\
              -d '{"event_type":"subproject-updated","client_payload":{"project":"\${{ github.repository }}","sha":"\${{ github.sha }}"}}'
          else
            echo "PORTFOLIO_SYNC_PAT not set in repository secrets. Falling back to daily automated cron sync in Portfolio."
          fi
`;

function install() {
    console.log('Installing GitHub Action sync dispatchers into standalone projects...\n');

    for (const project of PROJECTS) {
        const projectPath = path.join(DESKTOP_PROJECTS_DIR, project);
        if (!fs.existsSync(projectPath)) {
            console.log(`⚠️ Project folder not found: ${projectPath}`);
            continue;
        }

        const workflowsDir = path.join(projectPath, '.github', 'workflows');
        if (!fs.existsSync(workflowsDir)) {
            fs.mkdirSync(workflowsDir, { recursive: true });
        }

        const targetWorkflowPath = path.join(workflowsDir, 'notify-portfolio.yml');
        fs.writeFileSync(targetWorkflowPath, WORKFLOW_CONTENT, 'utf8');
        console.log(`✅ ${project}: .github/workflows/notify-portfolio.yml installed.`);

        // Auto commit & push if it is a git repo
        try {
            execSync('git add .github/workflows/notify-portfolio.yml', { cwd: projectPath, stdio: 'ignore' });
            execSync('git commit -m "ci: add automated portfolio dispatch trigger on push"', {
                cwd: projectPath,
                stdio: 'ignore',
            });
            console.log(`   ➔ Committed in ${project}`);
            execSync('git push origin HEAD', { cwd: projectPath, stdio: 'ignore' });
            console.log(`   ➔ Pushed to origin in ${project}`);
        } catch (e) {
            console.log(`   ℹ️ No commit/push needed or already committed (${e.message})`);
        }
    }

    console.log('\nAll projects configured with sync notification workflow!');
}

install();
