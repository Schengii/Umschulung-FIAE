import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/e2e-helpers.js';

// QR codes are rendered in the browser. The sync QR encodes the learning progress, so no request
// may go to a QR web service (C01).
function trackQrServiceRequests(page) {
    const requests = [];
    page.on('request', (request) => {
        if (request.url().includes('qrserver')) requests.push(request.url());
    });
    return requests;
}

test.describe('QR-Codes lokal erzeugen', () => {
    test('Dashboard: QR-Sync rendert lokal und ohne Drittanbieter-Anfrage', async ({ page }) => {
        const qrServiceRequests = trackQrServiceRequests(page);
        await page.goto('/pages/dashboard.html', { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => localStorage.setItem('quiz_best_score', '4'));
        await page.reload({ waitUntil: 'domcontentloaded' });
        await settle(page);

        const img = page.locator('#backup-qr-img');
        // progress-backup.js is a lazy module: a click that lands before its handler is bound does
        // nothing, so retry the (idempotent) click until the code appears.
        await expect(async () => {
            await page.locator('#backup-qr-btn').click();
            await expect(img).toBeVisible({ timeout: 1000 });
        }).toPass({ timeout: 15000 });
        await expect(img).toHaveAttribute('src', /^data:image\/svg\+xml/);
        // Decoding a data: URL is asynchronous, Firefox reports `complete` a moment after `visible`.
        await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
        expect(qrServiceRequests).toEqual([]);
    });

    test('Links: Recruiter-QR rendert lokal und lässt sich herunterladen', async ({ page }) => {
        const qrServiceRequests = trackQrServiceRequests(page);
        await page.goto('/pages/links.html', { waitUntil: 'domcontentloaded' });
        await settle(page);

        await page.locator('#qr-company-input').fill('Testfirma');
        const img = page.locator('#qr-code-image-container img');
        await expect(img).toHaveAttribute('src', /^data:image\/svg\+xml/);

        const downloadPromise = page.waitForEvent('download');
        await page.locator('#qr-download-btn').click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe('qr_code_testfirma.svg');
        expect(qrServiceRequests).toEqual([]);
    });
});
