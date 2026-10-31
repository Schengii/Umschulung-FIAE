// @ts-check
/**
 * Tastaturbedienung für klickbare Nicht-Button-Elemente (Karten, Listen-
 * einträge mit `role="button"` und `tabIndex={0}`): Enter und Leertaste
 * lösen dieselbe Aktion aus wie ein Klick, wie bei einem nativen <button>.
 *
 * @template {{ key: string, preventDefault: () => void }} E
 * @param {(event: E) => void} handler - derselbe Handler wie bei onClick
 * @returns {(event: E) => void} onKeyDown-Handler
 */
export const onActivationKey = (handler) => (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    // Leertaste würde sonst die Seite scrollen
    event.preventDefault();
    handler(event);
  }
};
