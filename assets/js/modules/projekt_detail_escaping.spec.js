import { test, expect } from '@playwright/test';

// projekt-detail.html merges projects.json with the GitHub API response (cached in
// localStorage). Topics and the homepage of a repository are free text there, so the page must
// render them as text and must not link a `javascript:` homepage.
test.describe('Projektdetail: Daten aus der GitHub-API werden escaped', () => {
    test('Topics mit HTML erscheinen als Text, javascript:-Homepage wird verworfen', async ({ page }) => {
        let dialogShown = false;
        page.on('dialog', async (dialog) => {
            dialogShown = true;
            await dialog.dismiss();
        });

        const payload = '<img src=x id="pwn" onerror="alert(1)">';
        await page.addInitScript((topic) => {
            localStorage.setItem(
                'github_projects_cache',
                JSON.stringify([
                    {
                        name: 'Amazon-2.0',
                        stargazers_count: 3,
                        html_url: 'https://github.com/Schengii/Amazon-2.0',
                        updated_at: '2026-10-01T00:00:00Z',
                        topics: [topic],
                        homepage: 'javascript:alert(1)',
                    },
                ])
            );
            localStorage.setItem('github_projects_cache_time', String(Date.now()));
        }, payload);

        await page.goto('/pages/projekt-detail.html?repo=Amazon-2.0');

        const container = page.locator('#project-detail-container');
        await expect(container.locator('.tech-tag', { hasText: '<img src=x' })).toHaveCount(1);
        await expect(page.locator('#pwn')).toHaveCount(0);
        await expect(container.locator('a[href^="javascript:"]')).toHaveCount(0);
        expect(dialogShown).toBe(false);
    });
});
