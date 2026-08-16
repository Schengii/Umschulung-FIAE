import { storage } from '../storage.js';

export const commandPalette = {
    isOpen: false,
    selectedIndex: 0,
    commands: [],

    init(appInstance) {
        this.app = appInstance;
        this.createPaletteDom();
        this.bindEvents();
    },

    createPaletteDom() {
        if (document.getElementById('command-palette-modal')) return;

        const modalHtml = `
            <div id="command-palette-modal" class="modal-overlay command-palette-overlay hide">
                <div class="command-palette-container glass-card">
                    <div class="command-palette-header">
                        <i data-lucide="search" class="palette-search-icon"></i>
                        <input type="text" id="command-palette-input" placeholder="Tippe einen Befehl oder suche nach Jobs (z. B. 'Dashboard', 'Anschreiben', 'Frontend')..." autocomplete="off">
                        <span class="keyboard-badge">ESC zum Schließen</span>
                    </div>
                    <div id="command-palette-results" class="command-palette-results">
                        <!-- Results populated dynamically -->
                    </div>
                    <div class="command-palette-footer">
                        <span><kbd>↑</kbd> <kbd>↓</kbd> Navigieren</span>
                        <span><kbd>↵</kbd> Auswählen</span>
                        <span><kbd>ESC</kbd> Schließen</span>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    bindEvents() {
        // Global Keyboard Shortcut: Ctrl+K or Cmd+K
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        const overlay = document.getElementById('command-palette-modal');
        const input = document.getElementById('command-palette-input');

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }

        if (input) {
            input.addEventListener('input', () => this.onInput());
            input.addEventListener('keydown', (e) => this.onKeyDown(e));
        }
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        this.isOpen = true;
        const overlay = document.getElementById('command-palette-modal');
        const input = document.getElementById('command-palette-input');

        if (overlay) overlay.classList.remove('hide');
        if (input) {
            input.value = '';
            input.focus();
        }

        this.updateCommandsList('');
    },

    close() {
        this.isOpen = false;
        const overlay = document.getElementById('command-palette-modal');
        if (overlay) overlay.classList.add('hide');
    },

    updateCommandsList(query) {
        const q = query.toLowerCase().trim();
        const jobs = storage.getJobs();
        const list = [];

        // 1. Navigation Commands
        const navItems = [
            { id: 'nav-dashboard', label: 'Wechsle zu: Dashboard', icon: 'layout-dashboard', action: () => this.app.switchToView('dashboard') },
            { id: 'nav-kanban', label: 'Wechsle zu: Kanban-Board', icon: 'kanban-square', action: () => this.app.switchToView('kanban') },
            { id: 'nav-comparer', label: 'Wechsle zu: Job-Vergleicher', icon: 'git-compare', action: () => this.app.switchToView('comparer') },
            { id: 'nav-calendar', label: 'Wechsle zu: Kalender', icon: 'calendar', action: () => this.app.switchToView('calendar') },
            { id: 'nav-finder', label: 'Wechsle zu: Job-Suche & Aggregator', icon: 'compass', action: () => this.app.switchToView('finder') },
            { id: 'nav-copilot', label: 'Wechsle zu: Bewerbungs-Copilot', icon: 'sparkles', action: () => this.app.switchToView('copilot') }
        ];

        // 2. Action Commands
        const actionItems = [
            { id: 'act-add-job', label: 'Aktion: Neuen Job hinzufügen', icon: 'plus-circle', action: () => { this.app.openJobModal(); } },
            { id: 'act-profile', label: 'Aktion: Mein Profil & Skills öffnen', icon: 'user', action: () => { this.app.openProfileModal(); } },
            { id: 'act-theme-dark', label: 'Theme: Dark Glass Mode', icon: 'moon', action: () => { this.app.setThemeMode('dark'); } },
            { id: 'act-theme-light', label: 'Theme: Daylight Light Mode', icon: 'sun', action: () => { this.app.setThemeMode('light'); } },
            { id: 'act-theme-oled', label: 'Theme: OLED High Contrast Mode', icon: 'zap', action: () => { this.app.setThemeMode('oled'); } }
        ];

        // Filter Nav & Actions
        navItems.forEach(item => {
            if (!q || item.label.toLowerCase().includes(q)) {
                list.push(item);
            }
        });

        actionItems.forEach(item => {
            if (!q || item.label.toLowerCase().includes(q)) {
                list.push(item);
            }
        });

        // 3. Search Jobs
        jobs.forEach(job => {
            const titleMatch = job.title.toLowerCase().includes(q);
            const companyMatch = job.company.toLowerCase().includes(q);
            if (q && (titleMatch || companyMatch)) {
                list.push({
                    id: `job-${job.id}`,
                    label: `Job öffnen: ${job.title} (${job.company})`,
                    icon: 'briefcase',
                    action: () => {
                        this.app.switchToView('copilot', job.id);
                    }
                });
            }
        });

        this.commands = list;
        this.selectedIndex = 0;
        this.renderResults();
    },

    renderResults() {
        const container = document.getElementById('command-palette-results');
        if (!container) return;

        if (this.commands.length === 0) {
            container.innerHTML = `
                <div class="palette-empty-state">
                    <p>Keine passenden Befehle oder Jobs gefunden.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.commands.map((cmd, idx) => `
            <div class="palette-item ${idx === this.selectedIndex ? 'selected' : ''}" data-idx="${idx}">
                <div class="palette-item-left">
                    <i data-lucide="${cmd.icon}"></i>
                    <span>${cmd.label}</span>
                </div>
                <span class="palette-item-action">↵ Auswählen</span>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();

        // Mouse hover interaction
        container.querySelectorAll('.palette-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.getAttribute('data-idx'));
                this.executeCommand(idx);
            });
        });
    },

    onInput() {
        const input = document.getElementById('command-palette-input');
        if (input) {
            this.updateCommandsList(input.value);
        }
    },

    onKeyDown(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex + 1) % this.commands.length;
            this.renderResults();
            this.scrollToSelected();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex - 1 + this.commands.length) % this.commands.length;
            this.renderResults();
            this.scrollToSelected();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this.executeCommand(this.selectedIndex);
        }
    },

    scrollToSelected() {
        const container = document.getElementById('command-palette-results');
        const selectedEl = container?.querySelector('.palette-item.selected');
        if (selectedEl && container) {
            selectedEl.scrollIntoView({ block: 'nearest' });
        }
    },

    executeCommand(idx) {
        if (this.commands[idx]) {
            const cmd = this.commands[idx];
            this.close();
            cmd.action();
        }
    }
};
