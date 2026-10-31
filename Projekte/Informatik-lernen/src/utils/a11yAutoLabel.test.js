// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { applyAutoLabels, hasAccessibleName, inferAccessibleName, observeAutoLabels } from './a11yAutoLabel';

let root;
beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
  root = document.getElementById('root');
});

describe('a11yAutoLabel', () => {
  it('benennt Slider anhand des vorangehenden Texts', () => {
    root.innerHTML = '<div><span>Bandbreite (Mbit/s):</span><input type="range"></div>';
    expect(applyAutoLabels(root)).toBe(1);
    expect(root.querySelector('input').getAttribute('aria-label')).toBe('Bandbreite (Mbit/s)');
  });

  it('nutzt placeholder vor Kontext', () => {
    root.innerHTML = '<span>Foo</span><input type="text" placeholder="Hostname">';
    applyAutoLabels(root);
    expect(root.querySelector('input').getAttribute('aria-label')).toBe('Hostname');
  });

  it('lässt korrekt beschriftete Elemente unverändert', () => {
    root.innerHTML =
      '<label for="a">Name</label><input id="a"><label>Wrap<input type="checkbox"></label><button>OK</button><select aria-label="X"></select>';
    expect(applyAutoLabels(root)).toBe(0);
    expect(root.querySelectorAll('[data-auto-label]').length).toBe(0);
  });

  it('benennt Icon-Buttons nach dem Lucide-Icon', () => {
    root.innerHTML = '<button><svg class="lucide lucide-trash-2"></svg></button>';
    applyAutoLabels(root);
    expect(root.querySelector('button').getAttribute('aria-label')).toBe('Trash 2');
  });

  it('fällt auf Typ-Namen zurück und überspringt hidden/submit', () => {
    root.innerHTML = '<input type="number"><input type="hidden"><input type="submit" value="Go">';
    expect(applyAutoLabels(root)).toBe(1);
    expect(root.querySelector('input').getAttribute('aria-label')).toBe('Zahlenwert');
  });

  it('erkennt Namen über title, aria-labelledby und Button-Text', () => {
    root.innerHTML = '<button title="Schließen"></button><button>Los</button><input aria-labelledby="x">';
    root.querySelectorAll('button,input').forEach((el) => expect(hasAccessibleName(el)).toBe(true));
    expect(hasAccessibleName(document.createElement('select'))).toBe(false);
    expect(inferAccessibleName(document.createElement('select'))).toBe('Auswahl');
  });

  it('beschriftet später eingefügte Elemente per MutationObserver', async () => {
    const stop = observeAutoLabels(root);
    root.innerHTML = '<span>Lautstärke</span><input type="range">';
    await new Promise((r) => setTimeout(r, 50));
    expect(root.querySelector('input').getAttribute('aria-label')).toBe('Lautstärke');
    stop();
  });
});
