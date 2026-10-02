import { describe, it, expect, beforeAll } from 'vitest';

// constants.js is a classic script: it publishes its helpers on `window`
// instead of exporting them, and resolveAssetPath reads window.location at
// call time, so one import plus a switchable pathname covers every case.
const win = { location: { pathname: '/' } };
let resolveAssetPath;

beforeAll(async () => {
    globalThis.window = win;
    await import('../constants.js');
    resolveAssetPath = win.resolveAssetPath;
});

const onPage = (pathname) => {
    win.location.pathname = pathname;
};

describe('resolveAssetPath on a page inside /pages/', () => {
    it('prefixes root-relative asset paths with ../', () => {
        onPage('/pages/home.html');
        expect(resolveAssetPath('assets/images/a.webp')).toBe('../assets/images/a.webp');
    });

    it('rewrites ./ to ../', () => {
        onPage('/pages/home.html');
        expect(resolveAssetPath('./assets/a.js')).toBe('../assets/a.js');
    });

    it('keeps paths that already start with ../', () => {
        onPage('/pages/home.html');
        expect(resolveAssetPath('../assets/a.js')).toBe('../assets/a.js');
    });

    it('recognises Windows-style separators', () => {
        onPage('C:\\site\\pages\\home.html');
        expect(resolveAssetPath('assets/a.js')).toBe('../assets/a.js');
    });
});

describe('resolveAssetPath on a root page', () => {
    it('prefixes bare paths with ./', () => {
        onPage('/index.html');
        expect(resolveAssetPath('assets/a.js')).toBe('./assets/a.js');
    });

    it('keeps ./ paths and strips a leading ../', () => {
        onPage('/index.html');
        expect(resolveAssetPath('./assets/a.js')).toBe('./assets/a.js');
        expect(resolveAssetPath('../assets/a.js')).toBe('assets/a.js');
    });
});

describe('resolveAssetPath passthrough', () => {
    it.each(['https://example.com/a.png', 'http://example.com/a.png', 'data:image/png;base64,AAAA', 'blob:abc'])(
        'returns %s unchanged',
        (url) => {
            onPage('/pages/home.html');
            expect(resolveAssetPath(url)).toBe(url);
        }
    );

    it('returns empty and non-string input unchanged', () => {
        expect(resolveAssetPath('')).toBe('');
        expect(resolveAssetPath(undefined)).toBe(undefined);
        expect(resolveAssetPath(null)).toBe(null);
    });
});
