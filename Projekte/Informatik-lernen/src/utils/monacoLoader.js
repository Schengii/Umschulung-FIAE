// Lädt den Monaco-Editor aus dem eigenen Bundle statt vom CDN (jsDelivr), das
// @monaco-editor/react standardmäßig nutzt. Hintergrund: Die Produktions-CSP
// (vercel.json) erlaubt keine Fremd-Skripte, und die PWA soll offline laufen.
// Der Import erfolgt dynamisch, damit Monaco nur im Monaco-Lab geladen wird.
import { loader } from '@monaco-editor/react';

let pending = null;

/**
 * Registriert die lokale Monaco-Instanz beim React-Wrapper.
 * Lehnt ab, wenn kein Web Worker verfügbar ist (z. B. jsdom in Unit-Tests).
 * @returns {Promise<unknown>}
 */
export function loadLocalMonaco() {
  if (typeof Worker === 'undefined') {
    return Promise.reject(new Error('Web Worker nicht verfügbar'));
  }
  if (!pending) {
    pending = (async () => {
      const [monaco, editorWorker, jsonWorker] = await Promise.all([
        import('monaco-editor/editor/editor.api'),
        import('monaco-editor/editor/editor.worker?worker'),
        import('monaco-editor/language/json/json.worker?worker'),
        // Syntax-Highlighting (JS, Python, HTML, ...) und JSON-Sprachdienst.
        import('monaco-editor/basic-languages/monaco.contribution'),
        import('monaco-editor/language/json/monaco.contribution')
      ]);
      self.MonacoEnvironment = {
        getWorker: (_workerId, label) =>
          label === 'json' ? new jsonWorker.default() : new editorWorker.default()
      };
      loader.config({ monaco });
      return loader.init();
    })().catch((error) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}
