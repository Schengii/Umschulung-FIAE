/**
 * @file summarize_playwright_flaky.js
 * @description CI retries failed E2E tests twice (playwright.config.js), so a test that only
 * passes on a retry shows up as green. This lists such "flaky" tests in the GitHub step
 * summary so they stay visible instead of silently accumulating.
 *
 * Usage: node scripts/summarize_playwright_flaky.js [path/to/results.json]
 */

const fs = require('fs');

const reportPath = process.argv[2] || 'playwright-report/results.json';

/** @param {any} suite @param {string[]} flaky */
function collect(suite, flaky) {
    for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
            if (test.status === 'flaky') flaky.push(`${test.projectName} › ${suite.file || ''} › ${spec.title}`);
        }
    }
    for (const child of suite.suites || []) collect(child, flaky);
}

if (!fs.existsSync(reportPath)) {
    console.log(`No Playwright report at ${reportPath}.`);
    process.exit(0);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const flaky = [];
for (const suite of report.suites || []) collect(suite, flaky);

let md = `### Flaky E2E tests (passed only after a retry): ${flaky.length}\n\n`;
if (flaky.length) md += flaky.map((name) => `- ${name}`).join('\n') + '\n';

console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
