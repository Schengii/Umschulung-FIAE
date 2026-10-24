import fs from 'node:fs';
import { describe, it, expect } from 'vitest';
import checker from './check_bilingual.js';

const { findUnpairedLanguageElements } = checker;

describe('findUnpairedLanguageElements', () => {
    it('accepts a complete pair, in either order', () => {
        expect(findUnpairedLanguageElements('<p><span lang="de">Hallo</span><span lang="en">Hello</span></p>')).toEqual(
            []
        );
        expect(
            findUnpairedLanguageElements('<p><span lang="en">Hello</span> <span lang="de">Hallo</span></p>')
        ).toEqual([]);
    });

    it('reports a German span without an English partner', () => {
        const problems = findUnpairedLanguageElements('<p><span lang="de">Nur deutsch</span></p>');
        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain('Nur deutsch');
        expect(problems[0]).toContain('lang="en"');
    });

    it('reports an English span without a German partner', () => {
        expect(findUnpairedLanguageElements('<p><span lang="en">English only</span></p>')).toHaveLength(1);
    });

    it('does not accept a partner with another tag or in another parent', () => {
        expect(findUnpairedLanguageElements('<div><span lang="de">A</span><p lang="en">A</p></div>')).toHaveLength(2);
        expect(
            findUnpairedLanguageElements('<div><span lang="de">A</span></div><div><span lang="en">A</span></div>')
        ).toHaveLength(2);
    });

    it('ignores the lang attribute of the html element', () => {
        expect(findUnpairedLanguageElements('<html lang="de"><body><p>Text</p></body></html>')).toEqual([]);
    });

    it('sees the pairs of a real page, so an empty result there means something', () => {
        const html = fs.readFileSync('pages/home.html', 'utf8');
        expect(html.match(/lang="de"/g)?.length).toBeGreaterThan(10);
        expect(findUnpairedLanguageElements(html)).toEqual([]);
    });
});
