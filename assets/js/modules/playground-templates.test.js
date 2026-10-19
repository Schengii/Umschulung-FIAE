import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PLAYGROUND_TEMPLATES } from './playground-templates.js';

const root = path.resolve(__dirname, '..', '..', '..');
const playgroundHtml = fs.readFileSync(path.join(root, 'pages', 'playground.html'), 'utf8');
const buttonKeys = [...playgroundHtml.matchAll(/data-template="([^"]+)"/g)].map((match) => match[1]);

describe('playground templates', () => {
    it('has a template for every button on the playground page', () => {
        expect(buttonKeys.length).toBeGreaterThan(0);
        for (const key of buttonKeys) {
            expect(PLAYGROUND_TEMPLATES[key], `no template for button "${key}"`).toBeDefined();
        }
    });

    it('has a button for every template', () => {
        for (const key of Object.keys(PLAYGROUND_TEMPLATES)) {
            expect(buttonKeys, `template "${key}" has no button`).toContain(key);
        }
    });

    it.each(Object.entries(PLAYGROUND_TEMPLATES))(
        '"%s" carries a bilingual title and the three editor sources',
        (_key, template) => {
            for (const field of ['titleDe', 'titleEn', 'html', 'css', 'js']) {
                expect(template[field], `missing ${field}`).toBeTypeOf('string');
                expect(template[field].trim().length, `${field} is empty`).toBeGreaterThan(0);
            }
        }
    );

    it.each(Object.entries(PLAYGROUND_TEMPLATES))('"%s" has JavaScript that parses', (_key, template) => {
        // Syntax check only: the code is not run (it needs a browser and the template's own markup).
        expect(() => new Function(template.js)).not.toThrow();
    });
});
