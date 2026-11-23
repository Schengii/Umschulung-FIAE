import { describe, it, expect } from 'vitest';
import checker from './check_innerhtml.js';

const { findUnescaped } = checker;

describe('findUnescaped', () => {
    it('ignoriert statisches Markup und Zuweisungen ohne Interpolation', () => {
        expect(findUnescaped("el.innerHTML = '<b>fest</b>';\nel.textContent = `${name}`;")).toEqual([]);
    });

    it('akzeptiert Ausdrücke, die durch einen Escape-Helfer laufen', () => {
        const source = 'el.innerHTML = `<p>${escapeHtml(name)}</p><a href="${escUrl(url)}">${esc(label)}</a>`;';
        expect(findUnescaped(source)).toEqual([]);
    });

    it('meldet rohe Interpolation samt Zeile und Ausdruck', () => {
        const source = ['const a = 1;', 'el.innerHTML = `<p>${userInput}</p>`;'].join('\n');
        expect(findUnescaped(source)).toEqual([{ line: 2, expressions: ['userInput'] }]);
    });

    it('erkennt mehrzeilige Vorlagen und insertAdjacentHTML', () => {
        const source = ['box.insertAdjacentHTML(', "  'beforeend',", '  `<li>${item.title}</li>`', ');'].join('\n');
        const hits = findUnescaped(source);
        expect(hits).toHaveLength(1);
        expect(hits[0].expressions).toEqual(['item.title']);
    });

    it('meldet nur die ungeschützten Ausdrücke einer Stelle', () => {
        const source = 'el.innerHTML += `${escapeHtml(a)} ${b}`;';
        expect(findUnescaped(source)[0].expressions).toEqual(['b']);
    });
});
