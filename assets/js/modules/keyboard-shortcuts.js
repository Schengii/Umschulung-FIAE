/**
 * Keyboard Shortcuts Module — Global hotkeys for power users
 * Ctrl+K: Open command palette / search
 * T: Toggle theme
 * L: Toggle language
 * Arrow keys: Flashcard navigation
 * ?: Show shortcuts help
 */
function initKeyboardShortcuts() {
    let helpModal = null;

    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;

        // Ctrl+K or Cmd+K — Focus search bar
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchBar = document.getElementById('searchbar') || document.getElementById('portfolio-searchbar');
            if (searchBar) {
                searchBar.focus();
                searchBar.select();
            }
            return;
        }

        // T — Toggle theme
        if (e.key === 't' || e.key === 'T') {
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.click();
            return;
        }

        // L — Toggle language
        if (e.key === 'l' || e.key === 'L') {
            const langToggle = document.getElementById('lang-toggle');
            if (langToggle) langToggle.click();
            return;
        }

        // ? — Show shortcuts help
        if (e.key === '?') {
            toggleShortcutsHelp();
            return;
        }

        // Arrow keys for flashcard navigation
        if (e.key === 'ArrowLeft') {
            const prevBtn = document.getElementById('btn-prev');
            if (prevBtn) { prevBtn.click(); return; }
        }
        if (e.key === 'ArrowRight') {
            const nextBtn = document.getElementById('btn-next');
            if (nextBtn) { nextBtn.click(); return; }
        }

        // Space to flip flashcard
        if (e.key === ' ' || e.key === 'Space') {
            const flashcard = document.getElementById('flashcard');
            if (flashcard) {
                e.preventDefault();
                flashcard.click();
                return;
            }
        }

        // Escape — close modals/help
        if (e.key === 'Escape') {
            if (helpModal && helpModal.style.display !== 'none') {
                helpModal.style.display = 'none';
            }
            const projectModal = document.getElementById('project-modal');
            if (projectModal && projectModal.classList.contains('show')) {
                const closeBtn = projectModal.querySelector('.modal-close');
                if (closeBtn) closeBtn.click();
            }
        }
    });

    function toggleShortcutsHelp() {
        if (!helpModal) {
            helpModal = document.createElement('div');
            helpModal.id = 'shortcuts-help-modal';
            helpModal.className = 'modal';
            helpModal.style.display = 'none';
            helpModal.innerHTML = `
                <div class="modal-content" style="max-width: 480px;">
                    <button class="modal-close" aria-label="Close" onclick="document.getElementById('shortcuts-help-modal').style.display='none'">&times;</button>
                    <h3 style="margin-bottom: 1rem;">
                        <i class="fa fa-keyboard-o" aria-hidden="true"></i>
                        <span lang="de">Tastaturkürzel</span>
                        <span lang="en">Keyboard Shortcuts</span>
                    </h3>
                    <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.5rem;"><kbd style="background: var(--bg-page); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border); font-family: monospace;">Ctrl+K</kbd></td>
                                <td style="padding: 0.5rem;"><span lang="de">Suche fokussieren</span><span lang="en">Focus search</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.5rem;"><kbd style="background: var(--bg-page); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border); font-family: monospace;">T</kbd></td>
                                <td style="padding: 0.5rem;"><span lang="de">Theme umschalten</span><span lang="en">Toggle theme</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.5rem;"><kbd style="background: var(--bg-page); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border); font-family: monospace;">L</kbd></td>
                                <td style="padding: 0.5rem;"><span lang="de">Sprache umschalten</span><span lang="en">Toggle language</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.5rem;"><kbd style="background: var(--bg-page); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border); font-family: monospace;">←</kbd> <kbd style="background: var(--bg-page); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border); font-family: monospace;">→</kbd></td>
                                <td style="padding: 0.5rem;"><span lang="de">Lernkarten blättern</span><span lang="en">Navigate flashcards</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.5rem;"><kbd style="background: var(--bg-page); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border); font-family: monospace;">Space</kbd></td>
                                <td style="padding: 0.5rem;"><span lang="de">Lernkarte umdrehen</span><span lang="en">Flip flashcard</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.5rem;"><kbd style="background: var(--bg-page); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border); font-family: monospace;">?</kbd></td>
                                <td style="padding: 0.5rem;"><span lang="de">Hilfe anzeigen</span><span lang="en">Show shortcuts</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 0.5rem;"><kbd style="background: var(--bg-page); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border); font-family: monospace;">Esc</kbd></td>
                                <td style="padding: 0.5rem;"><span lang="de">Modal schließen</span><span lang="en">Close modal</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            document.body.appendChild(helpModal);
        }

        helpModal.style.display = helpModal.style.display === 'none' ? 'flex' : 'none';
    }
}
