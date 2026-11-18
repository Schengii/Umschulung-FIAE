import { describe, it, expect, vi, afterEach } from 'vitest';
import strategy from './sw-strategy.js';

const {
    chooseStrategy,
    evictionCount,
    runtimeCacheName,
    isCurrentCache,
    withTimeout,
    isDemoPath,
    RUNTIME_CACHE_LIMIT,
} = strategy;

const ORIGIN = 'https://www.max-schenk.tech';
const req = (path, extra = {}) => ({ method: 'GET', url: `${ORIGIN}${path}`, origin: ORIGIN, ...extra });

describe('chooseStrategy', () => {
    it('Seiten laufen network-first', () => {
        expect(chooseStrategy(req('/pages/home.html'))).toBe('network-first');
        expect(chooseStrategy(req('/'))).toBe('network-first');
        expect(chooseStrategy(req('/irgendwas', { accept: 'text/html,application/xhtml+xml' }))).toBe('network-first');
    });

    it('statische Dateien laufen stale-while-revalidate', () => {
        expect(chooseStrategy(req('/assets/css/style.css', { accept: 'text/css' }))).toBe('stale-while-revalidate');
        expect(chooseStrategy(req('/assets/data/projects.json'))).toBe('stale-while-revalidate');
    });

    it('lässt Nicht-GET, fremde Origins, Vercel-Routen und Demos aus', () => {
        expect(chooseStrategy(req('/pages/home.html', { method: 'POST' }))).toBe('bypass');
        expect(chooseStrategy({ method: 'GET', url: 'https://cdn.example/x.js', origin: ORIGIN })).toBe('bypass');
        expect(chooseStrategy(req('/_vercel/insights/script.js'))).toBe('bypass');
        expect(chooseStrategy(req('/Projekte/EcoChef/www/index.html', { accept: 'text/html' }))).toBe('bypass');
        expect(chooseStrategy(req('/Projekte/Amazon%202.0/dist/app.js'))).toBe('bypass');
    });

    it('lässt Range-Anfragen sowie Audio und Video aus', () => {
        expect(chooseStrategy(req('/assets/videos/a.mp4', { hasRange: true }))).toBe('bypass');
        expect(chooseStrategy(req('/assets/videos/a.mp4', { destination: 'video' }))).toBe('bypass');
        expect(chooseStrategy(req('/assets/audio/a.mp3', { destination: 'audio' }))).toBe('bypass');
    });
});

describe('isDemoPath', () => {
    it('erkennt nur den Ordner Projekte', () => {
        expect(isDemoPath('/Projekte/X/index.html')).toBe(true);
        expect(isDemoPath('/pages/portfolio.html')).toBe(false);
        expect(isDemoPath('/assets/Projekte-Liste.json')).toBe(false);
    });
});

describe('Cache-Verwaltung', () => {
    it('evictionCount zählt die Einträge über dem Limit', () => {
        expect(evictionCount(10, 120)).toBe(0);
        expect(evictionCount(120, 120)).toBe(0);
        expect(evictionCount(125, 120)).toBe(5);
        expect(evictionCount(RUNTIME_CACHE_LIMIT + 1)).toBe(1);
    });

    it('behält Precache und Laufzeit-Cache, löscht den Rest', () => {
        const name = 'umschulung-fiae-abc';
        expect(runtimeCacheName(name)).toBe('umschulung-fiae-abc-runtime');
        expect(isCurrentCache(name, name)).toBe(true);
        expect(isCurrentCache('umschulung-fiae-abc-runtime', name)).toBe(true);
        expect(isCurrentCache('umschulung-fiae-old', name)).toBe(false);
        expect(isCurrentCache('umschulung-fiae-old-runtime', name)).toBe(false);
    });
});

describe('withTimeout', () => {
    afterEach(() => vi.useRealTimers());

    it('liefert den Wert, wenn er rechtzeitig kommt', async () => {
        await expect(withTimeout(Promise.resolve('netz'), 1000, 'cache')).resolves.toBe('netz');
    });

    it('liefert den Rückfall nach Ablauf der Zeit', async () => {
        vi.useFakeTimers();
        const slow = new Promise((resolve) => setTimeout(() => resolve('netz'), 5000));
        const result = withTimeout(slow, 3000, 'cache');
        await vi.advanceTimersByTimeAsync(3000);
        await expect(result).resolves.toBe('cache');
    });

    it('reicht einen Fehler vor Ablauf der Zeit weiter', async () => {
        await expect(withTimeout(Promise.reject(new Error('offline')), 1000, 'cache')).rejects.toThrow('offline');
    });
});
