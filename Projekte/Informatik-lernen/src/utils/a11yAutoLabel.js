// Barrierefreiheits-Sicherheitsnetz: vergibt `aria-label` an Steuerelemente,
// die weder Label noch zugänglichen Namen haben (z. B. Range-Slider neben
// einem <span>, Icon-Buttons, Selects ohne <label for>). Der Name wird aus dem
// Kontext abgeleitet (placeholder, Text davor, Lucide-Icon-Klasse).
// Bereits korrekt beschriftete Elemente werden NIE verändert.

const CONTROL_SELECTOR =
  'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea, button, [role="button"]';

const TYPE_FALLBACK = {
  range: 'Regler',
  number: 'Zahlenwert',
  checkbox: 'Kontrollkästchen',
  radio: 'Option',
  text: 'Texteingabe',
  search: 'Suche',
  file: 'Datei auswählen',
  color: 'Farbe',
  date: 'Datum',
  time: 'Uhrzeit',
  password: 'Passwort',
  email: 'E-Mail',
  url: 'URL'
};

const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();
const shorten = (text, max = 80) => {
  const t = clean(text);
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

/** true, wenn das Element bereits einen zugänglichen Namen besitzt. */
export function hasAccessibleName(el) {
  if (clean(el.getAttribute('aria-label'))) return true;
  if (clean(el.getAttribute('aria-labelledby'))) return true;
  if (clean(el.getAttribute('title'))) return true;
  if (el.labels && el.labels.length > 0 && [...el.labels].some((l) => clean(l.textContent))) return true;
  const tag = el.tagName.toLowerCase();
  if (tag === 'button' || el.getAttribute('role') === 'button') {
    if (clean(el.textContent)) return true;
    const img = el.querySelector('img[alt]');
    if (img && clean(img.getAttribute('alt'))) return true;
    const svgTitle = el.querySelector('svg title');
    if (svgTitle && clean(svgTitle.textContent)) return true;
  }
  return false;
}

// Text direkt vor dem Element: vorherige Geschwister, dann Geschwister der Eltern.
function precedingText(el) {
  let node = el;
  for (let depth = 0; node && depth < 3; depth += 1) {
    let sib = node.previousSibling;
    while (sib) {
      const t = shorten(sib.textContent);
      if (t && t.length <= 80) return t;
      sib = sib.previousSibling;
    }
    node = node.parentElement;
    if (!node || node.tagName === 'MAIN' || node.tagName === 'BODY') break;
    // Eltern mit kurzem Eigentext (z. B. <label>-ähnliche Container) direkt nutzen
    const own = shorten(
      [...node.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ')
    );
    if (own) return own;
  }
  return '';
}

function iconName(el) {
  const svg = el.querySelector('svg');
  if (!svg) return '';
  const cls = [...svg.classList].find((c) => c.startsWith('lucide-') && c !== 'lucide');
  if (!cls) return '';
  return cls.replace(/^lucide-/, '').replace(/-icon$/, '').replace(/[-_]+/g, ' ').trim();
}

/** Leitet einen sinnvollen Namen ab (leerer String, wenn nichts Passendes gefunden). */
export function inferAccessibleName(el) {
  const tag = el.tagName.toLowerCase();
  if (tag === 'button' || el.getAttribute('role') === 'button') {
    const icon = iconName(el);
    if (icon) return icon.charAt(0).toUpperCase() + icon.slice(1);
    return 'Schaltfläche';
  }
  const placeholder = clean(el.getAttribute('placeholder'));
  if (placeholder) return placeholder;
  const before = precedingText(el);
  if (before) return before.replace(/[:：]\s*$/, '');
  if (tag === 'select') return 'Auswahl';
  if (tag === 'textarea') return 'Texteingabe';
  return TYPE_FALLBACK[(el.getAttribute('type') || 'text').toLowerCase()] || 'Eingabe';
}

/** Beschriftet alle unbenannten Steuerelemente unterhalb von `root`; liefert die Anzahl. */
export function applyAutoLabels(root) {
  if (!root || !root.querySelectorAll) return 0;
  let count = 0;
  root.querySelectorAll(CONTROL_SELECTOR).forEach((el) => {
    if (hasAccessibleName(el)) return;
    const name = inferAccessibleName(el);
    if (!name) return;
    el.setAttribute('aria-label', name);
    el.setAttribute('data-auto-label', '');
    count += 1;
  });
  return count;
}

/**
 * Beobachtet `root` und beschriftet nachträglich hinzugekommene Elemente.
 * Gibt eine Cleanup-Funktion zurück.
 */
export function observeAutoLabels(root) {
  if (!root || typeof MutationObserver === 'undefined') return () => {};
  let scheduled = false;
  const run = () => {
    scheduled = false;
    applyAutoLabels(root);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(run, 0);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  applyAutoLabels(root);
  return () => observer.disconnect();
}
