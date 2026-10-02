/**
 * @file e2e-helpers.js
 * @description Shared helpers for the Playwright specs in assets/js/modules.
 * Lives in scripts/ (not next to the specs) so the service-worker precache and
 * the production build never pick it up.
 */

/**
 * Answers every api.github.com request immediately with a 403 "rate limit" reply.
 *
 * Pages such as projekt-detail and the recruiter filter call the unauthenticated GitHub
 * API. On shared CI runners that is slow or rate-limited, which stalled
 * `waitForLoadState('networkidle')` (30 s timeouts, mostly in Firefox). The app handles a
 * non-OK reply with its documented fallback (cached/mock data), so a fast, deterministic
 * 403 exercises the same path without depending on a third party.
 *
 * @param {import('@playwright/test').Page} page
 */
async function stubGithubApi(page) {
    await page.route('https://api.github.com/**', (route) =>
        route.fulfill({
            status: 403,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body: JSON.stringify({ message: 'API rate limit exceeded (stubbed in E2E)' }),
        })
    );
}

module.exports = { stubGithubApi };
