import { test, expect } from '@playwright/test';

// Dashboard: Verlauf der Prüfungsergebnisse als SVG-Liniendiagramm.
test.describe('Dashboard: Verlauf der Prüfungsergebnisse', () => {
    test('zeigt ohne Läufe einen Hinweis statt eines Diagramms', async ({ page }) => {
        await page.goto('/pages/dashboard.html');
        await expect(page.locator('#exam-history-empty')).toBeVisible();
        await expect(page.locator('#exam-history-body')).toBeHidden();
    });

    test('zeichnet die Quote je Lauf und je Themengebiet', async ({ page }) => {
        await page.addInitScript(() => {
            if (localStorage.getItem('spec_seeded')) return;
            localStorage.setItem('spec_seeded', '1');
            const topic = (name, total, correct) => ({ topic: name, total, correct });
            localStorage.setItem(
                'exam_history',
                JSON.stringify([
                    { date: '2026-11-01T10:00:00Z', mode: 'ap1', percent: 40, topics: [topic('sql', 5, 1)] },
                    {
                        date: '2026-11-05T10:00:00Z',
                        mode: 'ap1',
                        percent: 60,
                        topics: [topic('sql', 5, 3), topic('net', 2, 2)],
                    },
                    { date: '2026-11-09T10:00:00Z', mode: 'ap1', percent: 80, topics: [topic('sql', 4, 4)] },
                ])
            );
        });
        await page.goto('/pages/dashboard.html');

        const chart = page.locator('#exam-history-chart svg.history-chart');
        await expect(chart).toBeVisible();
        await expect(chart.locator('circle.history-dot')).toHaveCount(3);
        await expect(chart.locator('line.history-pass')).toHaveCount(1);
        await expect(page.locator('#exam-history-caption')).toContainText('3 Läufe, zuletzt 80 %');

        // Ein Themengebiet filtert auf die Läufe, die es gefragt haben.
        await page.locator('#exam-history-topic').selectOption('net');
        await expect(chart.locator('circle.history-dot')).toHaveCount(1);
        await page.locator('#exam-history-topic').selectOption('sql');
        await expect(chart.locator('circle.history-dot')).toHaveCount(3);

        // Das Diagramm trägt eine zugängliche Beschriftung.
        await expect(chart).toHaveAttribute('role', 'img');
        await expect(chart.locator('title').first()).toContainText('Quote je Lauf');
    });

    test('kommt mit beschädigten gespeicherten Daten zurecht', async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('exam_history', '{kaputt'));
        await page.goto('/pages/dashboard.html');
        await expect(page.locator('#exam-history-empty')).toBeVisible();
    });
});
