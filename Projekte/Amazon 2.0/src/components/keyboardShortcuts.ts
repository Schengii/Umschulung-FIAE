// ============================================================
// Amazon 2.0 – Keyboard Shortcuts Overlay Component
// ============================================================

let shortcutsModalEl: HTMLElement | null = null;

function getShortcutsModal(): HTMLElement {
  if (!shortcutsModalEl) {
    shortcutsModalEl = document.createElement('div');
    shortcutsModalEl.id = 'shortcutsModal';
    shortcutsModalEl.className = 'modal-overlay';
    shortcutsModalEl.setAttribute('role', 'dialog');
    shortcutsModalEl.setAttribute('aria-modal', 'true');
    shortcutsModalEl.setAttribute('aria-label', 'Tastaturkürzel');
    document.body.appendChild(shortcutsModalEl);

    shortcutsModalEl.addEventListener('click', (e) => {
      if (e.target === shortcutsModalEl) closeShortcutsModal();
    });
  }
  return shortcutsModalEl;
}

export function closeShortcutsModal(): void {
  if (shortcutsModalEl) shortcutsModalEl.classList.remove('open');
}

export function openShortcutsModal(): void {
  const modal = getShortcutsModal();
  modal.innerHTML = `
    <div class="modal-dialog shortcuts-dialog">
      <button class="modal-close" id="shortcutsModalClose" aria-label="Schließen">✕</button>

      <div class="shortcuts-header">
        <span class="shortcuts-icon">⌨️</span>
        <h2>Tastaturkürzel (Cheat-Sheet)</h2>
        <p class="shortcuts-sub">Navigiere mit Turbo-Geschwindigkeit durch Amazon 2.0!</p>
      </div>

      <div class="shortcuts-grid">
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>?</kbd></div>
          <span class="shortcut-desc">Diese Übersicht öffnen</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>/</kbd></div>
          <span class="shortcut-desc">Sofort in Suchleiste springen</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd></div>
          <span class="shortcut-desc">Command Palette öffnen</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>C</kbd></div>
          <span class="shortcut-desc">Warenkorb ein- / ausklappen</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>O</kbd></div>
          <span class="shortcut-desc">Meine Bestellungen öffnen</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>W</kbd></div>
          <span class="shortcut-desc">Wunschliste anzeigen</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>T</kbd></div>
          <span class="shortcut-desc">Dark- / Light-Theme umschalten</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>G</kbd></div>
          <span class="shortcut-desc">Guthaben & Geschenkkarten</span>
        </div>
        <div class="shortcut-row">
          <div class="shortcut-keys"><kbd>Esc</kbd></div>
          <span class="shortcut-desc">Aktives Fenster / Modal schließen</span>
        </div>
      </div>
    </div>
  `;

  modal.querySelector('#shortcutsModalClose')?.addEventListener('click', closeShortcutsModal);
  modal.classList.add('open');
}

export function initGlobalShortcuts(callbacks: {
  openCart: () => void;
  openOrders: () => void;
  openWishlist: () => void;
  openGiftCards: () => void;
  toggleTheme: () => void;
}): void {
  window.addEventListener('keydown', (e) => {
    // Ignore when user is typing in an input, textarea, or contenteditable
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable) {
      if (e.key === 'Escape') {
        (e.target as HTMLElement).blur();
      }
      return;
    }

    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      openShortcutsModal();
    } else if (e.key === '/') {
      e.preventDefault();
      const searchInput = document.getElementById('headerSearchInput');
      if (searchInput) (searchInput as HTMLInputElement).focus();
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      callbacks.openCart();
    } else if (e.key === 'o' || e.key === 'O') {
      e.preventDefault();
      callbacks.openOrders();
    } else if (e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      callbacks.openWishlist();
    } else if (e.key === 'g' || e.key === 'G') {
      e.preventDefault();
      callbacks.openGiftCards();
    } else if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      callbacks.toggleTheme();
    }
  });
}
