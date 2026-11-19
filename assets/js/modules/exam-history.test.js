import { describe, it, expect } from 'vitest';
import {
    MAX_HISTORY,
    parseHistory,
    addRunToHistory,
    historyTopics,
    rateSeries,
    chartPoints,
    buildLineChartSvg,
} from './exam-history.js';

const run = (percent, topics = [{ topic: 'sql', total: 4, correct: 3 }]) => ({ mode: 'ap1', percent, topics });
const at = (day) => new Date(`2026-11-${String(day).padStart(2, '0')}T10:00:00Z`);

describe('parseHistory', () => {
    it('reads valid entries and clamps values', () => {
        const raw = JSON.stringify([
            {
                date: '2026-11-01T10:00:00Z',
                mode: 'ap1',
                percent: 140,
                topics: [{ topic: 'sql', total: 3, correct: 9 }],
            },
        ]);
        expect(parseHistory(raw)).toEqual([
            {
                date: '2026-11-01T10:00:00Z',
                mode: 'ap1',
                percent: 100,
                topics: [{ topic: 'sql', total: 3, correct: 3 }],
            },
        ]);
    });

    it('skips broken entries and yields an empty list for damaged data', () => {
        const raw = JSON.stringify([
            null,
            'x',
            { date: 'nope', mode: 'ap1', percent: 50 },
            { date: '2026-11-01T10:00:00Z', mode: 5, percent: 50 },
            { date: '2026-11-01T10:00:00Z', mode: 'ap2', percent: 60, topics: [{ topic: 1 }, 'x'] },
        ]);
        expect(parseHistory(raw)).toEqual([{ date: '2026-11-01T10:00:00Z', mode: 'ap2', percent: 60, topics: [] }]);
        expect(parseHistory('{not json')).toEqual([]);
        expect(parseHistory('{"a":1}')).toEqual([]);
        expect(parseHistory(null)).toEqual([]);
    });
});

describe('addRunToHistory', () => {
    it('appends without touching the input and keeps at most MAX_HISTORY runs', () => {
        const before = [];
        const after = addRunToHistory(before, run(70), at(1));
        expect(before).toHaveLength(0);
        expect(after).toEqual([
            {
                date: '2026-11-01T10:00:00.000Z',
                mode: 'ap1',
                percent: 70,
                topics: [{ topic: 'sql', total: 4, correct: 3 }],
            },
        ]);
        let long = [];
        for (let i = 0; i < MAX_HISTORY + 5; i++) long = addRunToHistory(long, run(i % 100), at(1));
        expect(long).toHaveLength(MAX_HISTORY);
        expect(long.at(-1).percent).toBe((MAX_HISTORY + 4) % 100);
    });
});

describe('series', () => {
    const history = [
        ...addRunToHistory([], run(40, [{ topic: 'sql', total: 5, correct: 1 }]), at(1)),
        ...addRunToHistory([], run(60, [{ topic: 'net', total: 2, correct: 2 }]), at(2)),
        ...addRunToHistory([], run(80, [{ topic: 'sql', total: 4, correct: 3 }]), at(3)),
    ];

    it('lists topics by number of answers', () => {
        expect(historyTopics(history)).toEqual(['sql', 'net']);
    });

    it('gives the overall rate or the rate of one topic', () => {
        expect(rateSeries(history).map((p) => p.percent)).toEqual([40, 60, 80]);
        expect(rateSeries(history, 'sql').map((p) => p.percent)).toEqual([20, 75]);
        expect(rateSeries(history, 'unknown')).toEqual([]);
    });
});

describe('chart', () => {
    const box = { width: 200, height: 100, padding: 10 };

    it('puts 0 % at the bottom, 100 % at the top and spaces runs evenly', () => {
        const points = chartPoints(
            [
                { date: '2026-11-01T00:00:00Z', percent: 0 },
                { date: '2026-11-02T00:00:00Z', percent: 100 },
                { date: '2026-11-09T00:00:00Z', percent: 50 },
            ],
            box
        );
        expect(points.map((p) => p.x)).toEqual([10, 100, 190]);
        expect(points.map((p) => p.y)).toEqual([90, 10, 50]);
        expect(points[0].label).toBe('2026-11-01: 0 %');
    });

    it('centres a single run', () => {
        expect(chartPoints([{ date: '2026-11-01T00:00:00Z', percent: 50 }], box)[0].x).toBe(100);
    });

    it('builds an SVG with line, dots and pass mark, or nothing for an empty series', () => {
        expect(buildLineChartSvg([])).toBe('');
        const svg = buildLineChartSvg(
            [
                { date: '2026-11-01T00:00:00Z', percent: 40 },
                { date: '2026-11-02T00:00:00Z', percent: 70 },
            ],
            { title: 'Verlauf <b>' }
        );
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('class="history-line"');
        expect(svg.match(/class="history-dot"/g)).toHaveLength(2);
        expect(svg).toContain('class="history-pass"');
        expect(svg).toContain('<title>Verlauf b</title>');
        expect(svg).not.toContain('<b>');
    });
});
