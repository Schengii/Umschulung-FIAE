import { test, expect } from '@playwright/test';

// Regression: a global print rule once hid every child of <body>, so "Als PDF exportieren" on the
// CV page printed an empty page.
test('Lebenslauf bleibt in der Druckansicht sichtbar und zeigt das Stand-Datum', async ({ page }) => {
    await page.goto('/pages/lebenslauf.html');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.print-header h1')).toBeVisible();
    await expect(page.locator('.cv-stand time:visible')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
});
