import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sync from './sync_structured_data.js';

const { extractFaq, buildFaqJsonLd, buildProjectsJsonLd, upsertJsonLd } = sync;

const faqHtml = `
<div class="faq-accordion">
  <div class="faq-item">
    <button><span lang="de">Frage <em>eins</em>?</span><span lang="en">Question one?</span></button>
    <div class="faq-panel" id="p1"><div class="faq-content">
      <p lang="de">Antwort &amp; mehr.</p><p lang="en">Answer.</p>
    </div></div>
  </div>
  <div class="faq-item">
    <button><span lang="de">Frage zwei?</span></button>
    <div class="faq-panel" id="p2"><div class="faq-content"><p lang="de">Zwei.</p></div></div>
  </div>
</div></div></section>`;

describe('extractFaq', () => {
    it('liest Frage und deutsche Antwort ohne Markup', () => {
        expect(extractFaq(faqHtml)).toEqual([
            { question: 'Frage eins ?', answer: 'Antwort & mehr.' },
            { question: 'Frage zwei?', answer: 'Zwei.' },
        ]);
    });

    it('findet alle Einträge der echten Seite', () => {
        const html = fs.readFileSync(path.join(__dirname, '..', 'pages', 'ausbildungsablauf.html'), 'utf8');
        expect(extractFaq(html).length).toBe((html.match(/<div class="faq-item">/g) || []).length);
    });
});

describe('JSON-LD builder', () => {
    it('baut eine FAQPage', () => {
        const ld = buildFaqJsonLd([{ question: 'Q', answer: 'A' }]);
        expect(ld['@type']).toBe('FAQPage');
        expect(ld.mainEntity[0].acceptedAnswer.text).toBe('A');
    });

    it('baut eine ItemList mit absoluten URLs und maskiertem Repo-Namen', () => {
        const ld = buildProjectsJsonLd([{ repoName: 'Wohnungssuche KI', titleDe: 'W' }]);
        expect(ld.numberOfItems).toBe(1);
        expect(ld.itemListElement[0].url).toBe(
            'https://www.max-schenk.tech/pages/projekt-detail.html?repo=Wohnungssuche%20KI'
        );
    });
});

describe('upsertJsonLd', () => {
    it('fügt vor </head> ein und ersetzt beim zweiten Lauf denselben Block', () => {
        const once = upsertJsonLd('<head>\n</head>', 'ld-x', { a: 1 });
        expect(once).toContain('id="ld-x"');
        const twice = upsertJsonLd(once, 'ld-x', { a: 2 });
        expect(twice.match(/ld-x/g)).toHaveLength(1);
        expect(twice).toContain('"a": 2');
        expect(upsertJsonLd(twice, 'ld-x', { a: 2 })).toBe(twice);
    });

    it('behält CRLF bei', () => {
        const out = upsertJsonLd('<head>\r\n</head>', 'ld-x', { a: 1 });
        expect(out.replace(/\r\n/g, '')).not.toContain('\n');
    });
});
