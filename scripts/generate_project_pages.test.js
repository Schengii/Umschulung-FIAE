import { describe, it, expect } from 'vitest';
import { validateCaseStudies, slugFor, pageNameFor, isGeneratedPage } from './generate_project_pages.js';
import fs from 'node:fs';
import path from 'node:path';

const full = Object.fromEntries(
    ['situation', 'role', 'decision', 'result', 'learned'].flatMap((field) => [
        [`${field}De`, 'Text'],
        [`${field}En`, 'Text'],
    ])
);

describe('Projektseiten: Namen', () => {
    it('bildet Slug und Dateiname aus dem Repo-Namen', () => {
        expect(slugFor('Wohnungssuche-KI')).toBe('wohnungssuche-ki');
        expect(slugFor('Amazon 2.0')).toBe('amazon-2-0');
        expect(pageNameFor('EcoChef')).toBe('projekt-ecochef.html');
    });

    it('hält projekt-detail.html aus den generierten Seiten heraus', () => {
        expect(isGeneratedPage('projekt-ecochef.html')).toBe(true);
        expect(isGeneratedPage('projekt-detail.html')).toBe(false);
        expect(isGeneratedPage('portfolio.html')).toBe(false);
    });
});

describe('Fallstudien', () => {
    it('akzeptiert vollständige Einträge zu bekannten Projekten', () => {
        expect(validateCaseStudies({ EcoChef: full }, ['EcoChef'])).toEqual([]);
    });

    it('meldet fehlende Felder und unbekannte Projekte', () => {
        const broken = { ...full, roleEn: '  ' };
        delete broken.learnedDe;
        const problems = validateCaseStudies({ EcoChef: broken, Ghost: full }, ['EcoChef']);
        expect(problems).toContain('Fallstudie EcoChef: roleEn fehlt');
        expect(problems).toContain('Fallstudie EcoChef: learnedDe fehlt');
        expect(problems).toContain('Fallstudie "Ghost" gehört zu keinem Projekt');
    });

    it('die gepflegten Fallstudien sind vollständig', () => {
        const root = path.resolve(__dirname, '..');
        const studies = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/case-studies.json'), 'utf8'));
        const projects = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/projects.json'), 'utf8'));
        expect(
            validateCaseStudies(
                studies,
                projects.map((p) => p.repoName)
            )
        ).toEqual([]);
        expect(Object.keys(studies)).toContain('EcoChef');
    });
});
