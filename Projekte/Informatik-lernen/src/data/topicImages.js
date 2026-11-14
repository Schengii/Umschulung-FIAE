// Abbildungen der Wissensartikel (SVG in src/assets/topics/). Im Artikel-Markdown
// werden sie nur mit Dateinamen referenziert: ![Alt-Text](osi-modell.svg "Bildunterschrift").
// Vite hängt beim Build einen Hash an; kleine Dateien landen als data-URI im Code.
const IMAGES = import.meta.glob('../assets/topics/*.svg', { eager: true, query: '?url', import: 'default' });

const BY_NAME = new Map(Object.entries(IMAGES).map(([path, url]) => [path.split('/').pop(), /** @type {string} */ (url)]));

/**
 * @param {string} name - Dateiname, z. B. `osi-modell.svg`
 * @returns {string | null}
 */
export function resolveTopicImage(name) {
  return BY_NAME.get(name) ?? null;
}

export const TOPIC_IMAGE_NAMES = [...BY_NAME.keys()];
