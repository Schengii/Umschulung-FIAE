import { storage } from './storage.js';
import { mockAi } from './mockAi.js';
import { db } from './utils/db.js';
import { dashboardView } from './views/dashboardView.js';
import { kanbanView } from './views/kanbanView.js';
import { comparerView } from './views/comparerView.js';
import { copilotView } from './views/copilotView.js';
import { calendarView } from './views/calendarView.js';
import { finderView } from './views/finderView.js';
import { commandPalette } from './utils/commandPalette.js';
import { i18n } from './utils/i18n.js';
import { speechRecognitionHelper } from './utils/speechRecognition.js';
import { backupManager } from './utils/backup.js';
import { geminiApi } from './utils/geminiApi.js';
import { webClipper } from './utils/webClipper.js';
import { printCurriculumVitae } from './utils/cvExport.js';

class App {
    constructor() {
        this.currentView = 'dashboard';
        this.activeSkills = [];
        this.modalTodos = [];
        this.modalInterviews = [];
        this.modalExpenses = [];
        this.modalDocuments = [];
        this.currentThemeMode = localStorage.getItem('jobmatch_theme_mode') || 'dark';
    }

    init() {
        window.app = this;
        this.initRouting();
        this.initMobileNav();
        this.initThemeToggle();
        this.initLanguageToggle();
        this.initRejectionModal();
        this.initModals();
        this.initGlobalSearch();
        this.initNotificationBell();
        this.initCvUpload();
        
        commandPalette.init(this);
        backupManager.createSnapshot('Auto Startup Backup').catch(() => {});

        // Check for Web Clipper payload in URL
        const urlParams = new URLSearchParams(window.location.search);
        const clippedPayload = urlParams.get('clip_job');
        if (clippedPayload) {
            const parsedJob = webClipper.parseClippedPayload(clippedPayload);
            if (parsedJob) {
                storage.addJob(parsedJob);
                alert(`Job "${parsedJob.title}" bei "${parsedJob.company}" wurde erfolgreich gecallt & gespeichert!`);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }



        this.renderCurrentView();
        i18n.updateDom();
        
        // Initial Icon setup
        lucide.createIcons();

        // Check deadlines for notifications
        this.checkDeadlines();
        this.requestNotificationPermissions();

        // Apply accessibility settings
        this.applyAccessibilitySettings();

        // PWA Service Worker registration
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker registered successfully.'))
                .catch(err => console.warn('Service Worker registration failed:', err));
        }
    }

    applyAccessibilitySettings() {
        const profile = storage.getProfile();
        
        // LRS Mode
        if (profile.lrsEnabled) {
            document.body.classList.add('lrs-mode');
        } else {
            document.body.classList.remove('lrs-mode');
        }
        
        // RGS Mode
        if (profile.rgsEnabled) {
            document.body.classList.add('rgs-mode');
        } else {
            document.body.classList.remove('rgs-mode');
        }

        // Apply Theme Mode (dark, light, oled)
        this.setThemeMode(this.currentThemeMode);
    }

    initMobileNav() {
        const mobileItems = document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item');
        mobileItems.forEach(item => {
            item.addEventListener('click', () => {
                const viewName = item.getAttribute('data-view');
                mobileItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.switchToView(viewName);
            });
        });
    }

    initThemeToggle() {
        const btn = document.getElementById('btn-theme-toggle');
        if (btn) {
            btn.addEventListener('click', () => {
                let nextTheme = 'dark';
                if (this.currentThemeMode === 'dark') nextTheme = 'light';
                else if (this.currentThemeMode === 'light') nextTheme = 'oled';
                else nextTheme = 'dark';

                this.setThemeMode(nextTheme);
            });
        }
    }

    setThemeMode(mode) {
        this.currentThemeMode = mode;
        document.body.classList.remove('theme-light', 'theme-oled');
        if (mode === 'light') {
            document.body.classList.add('theme-light');
        } else if (mode === 'oled') {
            document.body.classList.add('theme-oled');
        }
        localStorage.setItem('jobmatch_theme_mode', mode);
        
        const btn = document.getElementById('btn-theme-toggle');
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                if (mode === 'light') icon.setAttribute('data-lucide', 'sun');
                else if (mode === 'oled') icon.setAttribute('data-lucide', 'zap');
                else icon.setAttribute('data-lucide', 'moon');
                if (window.lucide) window.lucide.createIcons();
            }
        }
    }

    initLanguageToggle() {
        const btn = document.getElementById('btn-lang-toggle');
        if (btn) {
            btn.addEventListener('click', () => {
                const current = i18n.getLanguage();
                const next = current === 'de' ? 'en' : 'de';
                i18n.setLanguage(next);
                this.showToast(`Sprache gewechselt zu ${next.toUpperCase()}`, 'primary');
                this.renderCurrentView();
            });
        }
    }

    initRejectionModal() {
        const modal = document.getElementById('rejection-reason-modal');
        const btnClose = document.getElementById('btn-close-rejection-modal');
        const btnSkip = document.getElementById('btn-skip-rejection-reason');
        const btnSave = document.getElementById('btn-save-rejection-reason');

        if (btnClose) btnClose.addEventListener('click', () => this.closeModal('rejection-reason-modal'));
        if (btnSkip) btnSkip.addEventListener('click', () => this.closeModal('rejection-reason-modal'));

        if (btnSave) {
            btnSave.addEventListener('click', () => {
                const jobId = document.getElementById('rejection-job-id').value;
                const reason = document.getElementById('rejection-reason-select').value;
                const missingSkill = document.getElementById('rejection-missing-skill').value.trim();

                const jobs = storage.getJobs();
                const job = jobs.find(j => j.id === jobId);
                if (job) {
                    job.rejectionReason = reason;
                    if (missingSkill) {
                        job.missingSkillRecorded = missingSkill;
                    }
                    storage.saveJobs(jobs);
                    this.showToast('Absage-Grund gespeichert!', 'success');
                }
                this.closeModal('rejection-reason-modal');
            });
        }
    }

    openRejectionModal(jobId) {
        document.getElementById('rejection-job-id').value = jobId;
        const modal = document.getElementById('rejection-reason-modal');
        if (modal) modal.classList.remove('hide');
    }

    requestNotificationPermissions() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Push Notifications genehmigt.');
                }
            });
        }
    }

    // --- VIEW ROUTING ---
    initRouting() {
        const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const viewName = item.getAttribute('data-view');
                
                navItems.forEach(i => {
                    i.classList.remove('active');
                    i.setAttribute('aria-selected', 'false');
                });
                item.classList.add('active');
                item.setAttribute('aria-selected', 'true');

                this.switchToView(viewName);
            });
        });
    }

    switchToView(viewName, additionalParam = null) {
        this.currentView = viewName;
        
        // Toggle view visibility
        const views = document.querySelectorAll('.app-view');
        views.forEach(v => v.classList.remove('active'));
        
        const activeViewContainer = document.getElementById(`view-${viewName}`);
        if (activeViewContainer) {
            activeViewContainer.classList.add('active');
        }

        // Sync sidebar active state if triggered programmatically
        const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('data-view') === viewName) {
                item.classList.add('active');
                item.setAttribute('aria-selected', 'true');
            } else {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            }
        });

        this.renderCurrentView(additionalParam);
    }

    renderCurrentView(param = null) {
        const viewId = `view-${this.currentView}`;
        
        switch (this.currentView) {
            case 'dashboard':
                dashboardView.render(viewId);
                break;
            case 'kanban':
                kanbanView.render(viewId);
                break;
            case 'comparer':
                comparerView.render(viewId);
                break;
            case 'calendar':
                calendarView.render(viewId);
                break;
            case 'finder':
                finderView.render(viewId);
                break;
            case 'copilot':
                copilotView.render(viewId, param);
                break;
        }
    }

    // --- GLOBAL SEARCH ---
    initGlobalSearch() {
        const searchInput = document.getElementById('global-search');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            // Switch to Kanban view for visual search results
            if (this.currentView !== 'kanban' && query.length > 0) {
                this.switchToView('kanban');
            }

            // Filter cards inside Kanban board
            const cards = document.querySelectorAll('.kanban-card');
            cards.forEach(card => {
                const title = card.querySelector('.card-title') ? card.querySelector('.card-title').textContent.toLowerCase() : '';
                const company = card.querySelector('.card-company') ? card.querySelector('.card-company').textContent.toLowerCase() : '';
                const tagsText = card.querySelector('.card-tags-list') ? card.querySelector('.card-tags-list').textContent.toLowerCase() : '';
                const match = title.includes(query) || company.includes(query) || tagsText.includes(query);
                
                if (match) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    initModals() {
        // Form ranges visual sync
        const ranges = ['salary', 'commute', 'remote', 'culture', 'tech', 'theme-primary', 'theme-secondary', 'gemini-temperature'];
        ranges.forEach(key => {
            let inputId = `rate-${key}`;
            let spanId = `val-${key}`;
            if (key.includes('theme')) {
                inputId = `profile-theme-${key.split('-')[1]}`;
                spanId = `val-theme-${key.split('-')[1]}`;
            } else if (key.includes('gemini')) {
                inputId = `profile-gemini-${key.split('-')[1]}`;
                spanId = `val-gemini-${key.split('-')[1]}`;
            }
            
            const rangeInput = document.getElementById(inputId);
            const valSpan = document.getElementById(spanId);
            if (rangeInput && valSpan) {
                rangeInput.addEventListener('input', (e) => {
                    valSpan.textContent = e.target.value;
                    
                    // Live theme preview
                    if (key === 'theme-primary') {
                        document.documentElement.style.setProperty('--primary-hue', e.target.value);
                    } else if (key === 'theme-secondary') {
                        document.documentElement.style.setProperty('--secondary-hue', e.target.value);
                    }
                });
            }
        });

        // Test API Key button listener
        const testApiKeyBtn = document.getElementById('btn-test-api-key');
        if (testApiKeyBtn) {
            testApiKeyBtn.addEventListener('click', async () => {
                const apiKeyInput = document.getElementById('profile-api-key');
                const apiKey = apiKeyInput.value.trim();
                const feedbackDiv = document.getElementById('api-key-test-feedback');
                
                if (!apiKey) {
                    feedbackDiv.style.display = 'block';
                    feedbackDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                    feedbackDiv.style.color = '#f87171';
                    feedbackDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                    feedbackDiv.textContent = 'Bitte gib zuerst einen API-Key ein.';
                    return;
                }

                testApiKeyBtn.disabled = true;
                const originalContent = testApiKeyBtn.innerHTML;
                testApiKeyBtn.innerHTML = '<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span>...';
                
                feedbackDiv.style.display = 'block';
                feedbackDiv.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                feedbackDiv.style.color = '#60a5fa';
                feedbackDiv.style.border = '1px solid rgba(59, 130, 246, 0.3)';
                feedbackDiv.textContent = 'Testverbindung wird aufgebaut...';

                try {
                    const isValid = await mockAi.testApiKey(apiKey);
                    if (isValid) {
                        feedbackDiv.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                        feedbackDiv.style.color = '#34d399';
                        feedbackDiv.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                        feedbackDiv.textContent = 'Verbindung erfolgreich! Der API-Schlüssel ist gültig.';
                        this.showToast('API-Key erfolgreich verifiziert!', 'success');
                    }
                } catch (err) {
                    feedbackDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                    feedbackDiv.style.color = '#f87171';
                    feedbackDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                    feedbackDiv.textContent = 'Verbindung fehlgeschlagen: ' + err.message;
                    this.showToast('API-Key Verifizierung fehlgeschlagen.', 'danger');
                } finally {
                    testApiKeyBtn.disabled = false;
                    testApiKeyBtn.innerHTML = originalContent;
                }
            });
        }

        // Topbar & sidebar buttons triggers
        document.getElementById('btn-add-job-top').addEventListener('click', () => this.openJobModal());
        document.getElementById('btn-open-profile').addEventListener('click', () => this.openProfileModal());

        // Profile Switcher bindings
        const profileSelect = document.getElementById('profile-select');
        if (profileSelect) {
            profileSelect.addEventListener('change', (e) => {
                storage.setActiveProfileId(e.target.value);
                const activeProfile = storage.getProfile();
                this.loadProfileFields(activeProfile);
                this.applyAccessibilitySettings();
                this.showToast(`Zu Profil "${activeProfile.profileName}" gewechselt`, 'primary');
            });
        }

        const btnCreateProfile = document.getElementById('btn-create-profile');
        if (btnCreateProfile) {
            btnCreateProfile.addEventListener('click', () => {
                const nameInput = document.getElementById('new-profile-name-input');
                const name = nameInput.value.trim();
                if (!name) {
                    this.showToast('Bitte gib einen Profilnamen ein.', 'warning');
                    return;
                }
                const newProfile = storage.addProfile(name);
                nameInput.value = '';
                this.populateProfilesSelect();
                this.loadProfileFields(newProfile);
                this.applyAccessibilitySettings();
                this.showToast(`Profil "${name}" erfolgreich erstellt!`, 'success');
            });
        }

        const btnDeleteProfile = document.getElementById('btn-delete-current-profile');
        if (btnDeleteProfile) {
            btnDeleteProfile.addEventListener('click', () => {
                const currentId = storage.getActiveProfileId();
                const activeProfile = storage.getProfile();
                try {
                    storage.deleteProfile(currentId);
                    const newActiveProfile = storage.getProfile();
                    this.populateProfilesSelect();
                    this.loadProfileFields(newActiveProfile);
                    this.applyAccessibilitySettings();
                    this.showToast(`Profil "${activeProfile.profileName}" gelöscht.`, 'warning');
                } catch (err) {
                    this.showToast(err.message, 'danger');
                }
            });
        }

        // Close buttons
        document.getElementById('btn-close-job-modal').addEventListener('click', () => this.closeModal('job-modal'));
        document.getElementById('btn-cancel-job-modal').addEventListener('click', () => this.closeModal('job-modal'));
        document.getElementById('btn-close-profile-modal').addEventListener('click', () => this.closeModal('profile-modal'));

        // Backdrop click to close
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closeModal(backdrop.id);
                }
            });
        });

        // AI Job Parser Button
        const parseBtn = document.getElementById('btn-parse-job');
        if (parseBtn) {
            parseBtn.addEventListener('click', async () => {
                let rawText = document.getElementById('job-raw-text').value;
                const rawUrl = document.getElementById('job-raw-url').value.trim();

                if ((!rawText || !rawText.trim()) && !rawUrl) {
                    this.showToast('Bitte füge eine Stellenbeschreibung oder eine URL ein.', 'warning');
                    return;
                }

                parseBtn.disabled = true;
                parseBtn.innerHTML = '<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Parsen...';

                try {
                    if (rawUrl && (!rawText || !rawText.trim())) {
                        this.showToast('Lade Stellenbeschreibung von URL...', 'primary');
                        rawText = await mockAi.fetchJobDescriptionFromUrl(rawUrl);
                        document.getElementById('job-description').value = rawText;
                    }

                    const profile = storage.getProfile();
                    const parsedData = await mockAi.parseJobDescription(profile.geminiApiKey, rawText);
                    
                    if (parsedData.title) document.getElementById('job-title').value = parsedData.title;
                    if (parsedData.company) document.getElementById('job-company').value = parsedData.company;
                    if (parsedData.salary) document.getElementById('job-salary').value = parsedData.salary;
                    if (parsedData.location) document.getElementById('job-location').value = parsedData.location;
                    if (parsedData.workMode) document.getElementById('job-work-mode').value = parsedData.workMode;
                    if (parsedData.description) document.getElementById('job-description').value = parsedData.description;
                    if (parsedData.contact) document.getElementById('job-contact').value = parsedData.contact;
                    if (rawUrl) document.getElementById('job-url').value = rawUrl;

                    this.showToast('Stellenbeschreibung erfolgreich analysiert!', 'success');
                    
                    // Clear the textarea
                    document.getElementById('job-raw-text').value = '';
                    document.getElementById('job-raw-url').value = '';
                } catch (err) {
                    console.error(err);
                    this.showToast('Fehler beim Analysieren der Anzeige: ' + err.message, 'danger');
                } finally {
                    parseBtn.disabled = false;
                    parseBtn.innerHTML = '<i data-lucide="wand-2"></i> Parsen';
                    lucide.createIcons();
                }
            });
        }

        // AI E-Mail Parser Button
        const parseEmailBtn = document.getElementById('btn-parse-email');
        if (parseEmailBtn) {
            parseEmailBtn.addEventListener('click', async () => {
                const rawText = document.getElementById('job-raw-text').value;
                if (!rawText || !rawText.trim()) {
                    this.showToast('Bitte füge den Text der E-Mail ein.', 'warning');
                    return;
                }

                parseEmailBtn.disabled = true;
                parseEmailBtn.innerHTML = '<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span>...';

                try {
                    const profile = storage.getProfile();
                    const parsedMail = await mockAi.parseEmailText(profile.geminiApiKey, rawText);
                    
                    if (parsedMail.status) document.getElementById('job-status').value = parsedMail.status;
                    if (parsedMail.company && !document.getElementById('job-company').value) {
                        document.getElementById('job-company').value = parsedMail.company;
                    }
                    if (parsedMail.notes) {
                        const currentNotes = document.getElementById('job-notes').value;
                        document.getElementById('job-notes').value = currentNotes ? `${currentNotes}\n${parsedMail.notes}` : parsedMail.notes;
                    }

                    this.showToast(`E-Mail analysiert! Status auf "${parsedMail.status}" gesetzt.`, 'success');
                    document.getElementById('job-raw-text').value = '';
                } catch (err) {
                    console.error(err);
                    this.showToast('Fehler beim E-Mail Import: ' + err.message, 'danger');
                } finally {
                    parseEmailBtn.disabled = false;
                    parseEmailBtn.innerHTML = '<i data-lucide="mail"></i> E-Mail Import';
                    lucide.createIcons();
                }
            });
        }

        // Form Submit handlers
        document.getElementById('job-form').addEventListener('submit', (e) => this.handleJobSubmit(e));
        document.getElementById('btn-save-profile').addEventListener('click', () => this.handleProfileSubmit());
        document.getElementById('btn-export-cv').addEventListener('click', () => {
            const profile = storage.getProfile();
            try {
                printCurriculumVitae(profile);
                this.showToast('Lebenslauf-Druckdialog geöffnet!', 'success');
            } catch (err) {
                console.error(err);
                this.showToast('Fehler beim Lebenslauf-Export.', 'danger');
            }
        });

        // Add Skill button
        document.getElementById('btn-add-skill').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSkillAdd();
        });

        document.getElementById('new-skill-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSkillAdd();
            }
        });

        // Backup Buttons
        const exportDataBtn = document.getElementById('btn-export-data');
        if (exportDataBtn) exportDataBtn.addEventListener('click', () => this.handleDataExport());
        
        const triggerImportBtn = document.getElementById('btn-import-data') || document.getElementById('btn-trigger-import');
        if (triggerImportBtn) {
            triggerImportBtn.addEventListener('click', () => {
                const fileInput = document.getElementById('import-file-input');
                if (fileInput) fileInput.click();
            });
        }
        const importFileInput = document.getElementById('import-file-input');
        if (importFileInput) importFileInput.addEventListener('change', (e) => this.handleDataImport(e));

        // Sub-tabs in job modal (Phase 2)
        const modalTabBtns = document.querySelectorAll('.modal-tab-btn');
        const modalTabContents = document.querySelectorAll('.modal-tab-content');
        modalTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modalTabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.color = 'var(--text-secondary)';
                });
                modalTabContents.forEach(c => {
                    c.style.display = 'none';
                });
                
                btn.classList.add('active');
                btn.style.color = 'var(--text-primary)';
                const tabId = btn.getAttribute('data-modal-tab');
                const targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.style.display = 'block';
                }
            });
        });

        // Add Todo inside job modal (Phase 2)
        const btnAddTodo = document.getElementById('btn-modal-add-todo');
        if (btnAddTodo) {
            btnAddTodo.addEventListener('click', () => {
                const input = document.getElementById('modal-todo-input');
                const val = input.value.trim();
                if (!val) {
                    this.showToast('Bitte gib einen Aufgabentext ein.', 'warning');
                    return;
                }
                this.modalTodos.push({
                    id: Date.now().toString(),
                    text: val,
                    completed: false
                });
                input.value = '';
                this.renderModalTodos();
            });

            document.getElementById('modal-todo-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    btnAddTodo.click();
                }
            });
        }

        // Add Interview inside job modal (Phase 2)
        const btnAddInterview = document.getElementById('btn-modal-add-interview');
        if (btnAddInterview) {
            btnAddInterview.addEventListener('click', () => {
                const dateInput = document.getElementById('modal-interview-date');
                const roundInput = document.getElementById('modal-interview-round');
                const interviewerInput = document.getElementById('modal-interview-interviewer');
                const notesInput = document.getElementById('modal-interview-notes');

                const roundVal = roundInput.value.trim();
                if (!roundVal) {
                    this.showToast('Bitte gib die Gesprächsrunde an.', 'warning');
                    return;
                }

                this.modalInterviews.push({
                    id: Date.now().toString(),
                    date: dateInput.value,
                    round: roundVal,
                    interviewer: interviewerInput.value.trim(),
                    notes: notesInput.value.trim()
                });

                // Reset fields
                dateInput.value = '';
                roundInput.value = '';
                interviewerInput.value = '';
                notesInput.value = '';

                this.renderModalInterviews();
            });
        }

        // Add History inside job modal (Phase 2)
        const btnAddHistory = document.getElementById('btn-modal-add-history');
        if (btnAddHistory) {
            btnAddHistory.addEventListener('click', () => {
                const dateInput = document.getElementById('modal-history-date');
                const typeInput = document.getElementById('modal-history-type');
                const subjectInput = document.getElementById('modal-history-subject');
                const contentInput = document.getElementById('modal-history-content');

                const subjectVal = subjectInput.value.trim();
                const dateVal = dateInput.value;

                if (!dateVal) {
                    this.showToast('Bitte gib ein Datum an.', 'warning');
                    return;
                }
                if (!subjectVal) {
                    this.showToast('Bitte gib einen Betreff an.', 'warning');
                    return;
                }

                this.modalHistory.push({
                    id: Date.now().toString(),
                    date: dateVal,
                    type: typeInput.value,
                    subject: subjectVal,
                    content: contentInput.value.trim()
                });

                // Reset fields
                dateInput.value = '';
                subjectInput.value = '';
                contentInput.value = '';

                this.renderModalHistory();
            });
        }

        // Add Expense inside job modal
        const btnAddExpense = document.getElementById('btn-modal-add-expense');
        if (btnAddExpense) {
            btnAddExpense.addEventListener('click', () => {
                const dateInput = document.getElementById('modal-expense-date');
                const catInput = document.getElementById('modal-expense-category');
                const amtInput = document.getElementById('modal-expense-amount');
                const notesInput = document.getElementById('modal-expense-notes');

                const dateVal = dateInput.value;
                const amtVal = parseFloat(amtInput.value);

                if (!dateVal) {
                    this.showToast('Bitte gib ein Datum an.', 'warning');
                    return;
                }
                if (isNaN(amtVal) || amtVal <= 0) {
                    this.showToast('Bitte gib einen gültigen Betrag an.', 'warning');
                    return;
                }

                this.modalExpenses.push({
                    id: Date.now().toString(),
                    date: dateVal,
                    category: catInput.value,
                    amount: amtVal,
                    notes: notesInput.value.trim()
                });

                // Reset fields
                dateInput.value = '';
                amtInput.value = '';
                notesInput.value = '';

                this.renderModalExpenses();
            });
        }

        // Add Document upload inside job modal
        const btnTriggerDocUpload = document.getElementById('btn-trigger-doc-upload');
        const docUploadInput = document.getElementById('job-doc-upload');
        if (btnTriggerDocUpload && docUploadInput) {
            btnTriggerDocUpload.addEventListener('click', () => {
                docUploadInput.click();
            });

            docUploadInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (file.size > 10 * 1024 * 1024) {
                    this.showToast('Die Datei darf maximal 10 MB groß sein.', 'warning');
                    return;
                }

                const fileId = Date.now().toString();
                const jobId = document.getElementById('job-id').value || 'temp_' + fileId;

                try {
                    // Save to IndexedDB
                    await db.saveFile(fileId, jobId, file.name, file);

                    // Add metadata to modal list
                    this.modalDocuments.push({
                        id: fileId,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        uploadDate: new Date().toISOString()
                    });

                    this.showToast('Dokument erfolgreich hochgeladen!', 'success');
                    this.renderModalDocuments();
                } catch (err) {
                    console.error('IndexedDB upload failed', err);
                    this.showToast('Fehler beim Upload des Dokuments.', 'danger');
                } finally {
                    docUploadInput.value = ''; // reset file input
                }
            });
        }
    }

    openJobModal(jobId = null) {
        const modal = document.getElementById('job-modal');
        const form = document.getElementById('job-form');
        const titleEl = document.getElementById('modal-title');
        
        form.reset();
        document.getElementById('job-id').value = '';
        
        // Reset range value numbers manually to 5
        const ranges = ['salary', 'commute', 'remote', 'culture', 'tech'];
        ranges.forEach(key => {
            document.getElementById(`val-${key}`).textContent = '5';
        });

        // Reset sub-tabs display state to show the first tab by default
        const modalTabBtns = document.querySelectorAll('.modal-tab-btn');
        const modalTabContents = document.querySelectorAll('.modal-tab-content');
        modalTabBtns.forEach(b => {
            b.classList.remove('active');
            b.style.color = 'var(--text-secondary)';
        });
        modalTabContents.forEach(c => {
            c.style.display = 'none';
        });
        const detailsBtn = document.querySelector('[data-modal-tab="modal-tab-details"]');
        if (detailsBtn) {
            detailsBtn.classList.add('active');
            detailsBtn.style.color = 'var(--text-primary)';
        }
        const detailsContent = document.getElementById('modal-tab-details');
        if (detailsContent) {
            detailsContent.style.display = 'block';
        }

        if (jobId) {
            titleEl.textContent = 'Jobangebot bearbeiten';
            const jobs = storage.getJobs();
            const job = jobs.find(j => j.id === jobId);
            
            if (job) {
                document.getElementById('job-id').value = job.id;
                document.getElementById('job-title').value = job.title;
                document.getElementById('job-company').value = job.company;
                document.getElementById('job-location').value = job.location || '';
                document.getElementById('job-work-mode').value = job.workMode || 'Hybrid';
                document.getElementById('job-salary').value = job.salary || '';
                document.getElementById('job-url').value = job.url || '';
                document.getElementById('job-deadline').value = job.deadline || '';
                document.getElementById('job-description').value = job.description || '';
                document.getElementById('job-contact').value = job.contact || '';
                document.getElementById('job-tags').value = Array.isArray(job.tags) ? job.tags.join(', ') : (job.tags || '');
                document.getElementById('job-notes').value = job.notes || '';
                document.getElementById('job-status').value = job.status || 'saved';

                this.modalTodos = Array.isArray(job.todos) ? [...job.todos] : [];
                this.modalInterviews = Array.isArray(job.interviews) ? [...job.interviews] : [];
                this.modalHistory = Array.isArray(job.communicationLogs) ? [...job.communicationLogs] : [];
                this.modalExpenses = Array.isArray(job.expenses) ? [...job.expenses] : [];
                this.modalDocuments = Array.isArray(job.documents) ? [...job.documents] : [];

                // Populate ratings
                const r = job.ratings || { salary: 5, commute: 5, remote: 5, culture: 5, tech: 5 };
                ranges.forEach(key => {
                    const el = document.getElementById(`rate-${key}`);
                    const val = document.getElementById(`val-${key}`);
                    if (el && val) {
                        el.value = r[key];
                        val.textContent = r[key];
                    }
                });

                // Render Timeline History
                const timelineContainer = document.getElementById('job-history-timeline');
                const timelineNodes = document.getElementById('job-timeline-nodes');
                
                if (job.history && job.history.length > 0) {
                    const statusLabels = {
                        saved: 'Gespeichert (Interessant)',
                        prepared: 'Unterlagen bereit',
                        applied: 'Beworben',
                        interviewing: 'Gespräch / Interview',
                        offer: 'Angebot erhalten',
                        rejected: 'Absage'
                    };
                    
                    timelineNodes.innerHTML = job.history.map(h => {
                        const dateStr = new Date(h.timestamp).toLocaleString('de-DE', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });
                        const label = statusLabels[h.status] || h.status;
                        return `
                            <div class="timeline-node">
                                <span class="status-name">${label}</span>
                                <span class="status-date">${dateStr}</span>
                            </div>
                        `;
                    }).join('');
                    timelineContainer.style.display = 'block';
                } else {
                    timelineContainer.style.display = 'none';
                }
            }
        } else {
            titleEl.textContent = 'Neues Jobangebot eintragen';
            document.getElementById('job-status').value = 'saved';
            document.getElementById('job-history-timeline').style.display = 'none';
            this.modalTodos = [];
            this.modalInterviews = [];
            this.modalHistory = [];
            this.modalExpenses = [];
            this.modalDocuments = [];
        }

        this.renderModalTodos();
        this.renderModalInterviews();
        this.renderModalHistory();
        this.renderModalExpenses();
        this.renderModalDocuments();
        modal.classList.add('active');
    }

    editJob(id) {
        this.openJobModal(id);
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    handleJobSubmit(e) {
        e.preventDefault();
        
        const jobId = document.getElementById('job-id').value;
        const jobData = {
            title: document.getElementById('job-title').value,
            company: document.getElementById('job-company').value,
            location: document.getElementById('job-location').value,
            workMode: document.getElementById('job-work-mode').value,
            salary: document.getElementById('job-salary').value ? parseInt(document.getElementById('job-salary').value) : null,
            url: document.getElementById('job-url').value,
            deadline: document.getElementById('job-deadline').value,
            description: document.getElementById('job-description').value,
            contact: document.getElementById('job-contact').value,
            tags: document.getElementById('job-tags') ? document.getElementById('job-tags').value.split(',').map(t => t.trim()).filter(t => t.length > 0) : [],
            notes: document.getElementById('job-notes').value,
            status: document.getElementById('job-status').value,
            todos: this.modalTodos,
            interviews: this.modalInterviews,
            communicationLogs: this.modalHistory,
            expenses: this.modalExpenses || [],
            documents: this.modalDocuments || [],
            ratings: {
                salary: parseInt(document.getElementById('rate-salary').value),
                commute: parseInt(document.getElementById('rate-commute').value),
                remote: parseInt(document.getElementById('rate-remote').value),
                culture: parseInt(document.getElementById('rate-culture').value),
                tech: parseInt(document.getElementById('rate-tech').value)
            }
        };

        if (jobId) {
            // Edit existing
            const jobs = storage.getJobs();
            const originalJob = jobs.find(j => j.id === jobId);
            
            // Log history transitions
            let history = originalJob.history || [];
            if (!Array.isArray(history)) history = [];
            if (originalJob.status !== jobData.status) {
                history.push({ status: jobData.status, timestamp: new Date().toISOString() });
            }
            
            const updated = {
                ...originalJob,
                ...jobData,
                history: history
            };
            
            storage.updateJob(updated);
            this.showToast('Job erfolgreich aktualisiert', 'success');
        } else {
            // Create new
            const newJobData = {
                ...jobData,
                history: [{ status: jobData.status, timestamp: new Date().toISOString() }]
            };
            storage.addJob(newJobData);
            this.showToast('Neuer Job hinzugefügt!', 'success');
        }

        this.closeModal('job-modal');
        this.renderCurrentView();
    }

    // --- PROFILE MODAL ACTIONS ---
    populateProfilesSelect() {
        const select = document.getElementById('profile-select');
        if (!select) return;
        
        const profiles = storage.getProfiles();
        const activeId = storage.getActiveProfileId();
        
        select.innerHTML = profiles.map(p => `
            <option value="${p.id}" ${p.id === activeId ? 'selected' : ''}>${p.profileName}</option>
        `).join('');
    }

    loadProfileFields(profile) {
        document.getElementById('profile-name').value = profile.name || '';
        document.getElementById('profile-title').value = profile.title || '';
        document.getElementById('profile-experience').value = profile.experience || '';
        document.getElementById('profile-notifications').checked = !!profile.notificationsEnabled;
        document.getElementById('profile-api-key').value = profile.geminiApiKey || '';
        document.getElementById('profile-lrs').checked = !!profile.lrsEnabled;
        document.getElementById('profile-rgs').checked = !!profile.rgsEnabled;
        document.getElementById('profile-tax-class').value = profile.taxClass || '1';
        document.getElementById('profile-church-tax').value = profile.churchTax || '0';
        document.getElementById('profile-has-children').checked = !!profile.hasChildren;
        document.getElementById('profile-supabase-url').value = profile.supabaseUrl || '';
        document.getElementById('profile-supabase-key').value = profile.supabaseAnonKey || '';
        document.getElementById('profile-theme-primary').value = profile.themePrimaryHue || 239;
        document.getElementById('val-theme-primary').textContent = profile.themePrimaryHue || 239;
        document.getElementById('profile-theme-secondary').value = profile.themeSecondaryHue || 263;
        document.getElementById('val-theme-secondary').textContent = profile.themeSecondaryHue || 263;
        document.getElementById('profile-gemini-model').value = profile.geminiModel || 'gemini-1.5-flash';
        document.getElementById('profile-gemini-temperature').value = profile.geminiTemperature !== undefined ? profile.geminiTemperature : 0.7;
        document.getElementById('val-gemini-temperature').textContent = profile.geminiTemperature !== undefined ? profile.geminiTemperature : 0.7;
        document.getElementById('profile-gemini-instructions').value = profile.geminiCustomInstructions || '';
        
        this.activeSkills = [...(profile.skills || [])];
        this.renderSkillTags();
    }

    openProfileModal() {
        const modal = document.getElementById('profile-modal');
        const profile = storage.getProfile();

        this.populateProfilesSelect();
        this.loadProfileFields(profile);
        
        const feedbackDiv = document.getElementById('api-key-test-feedback');
        if (feedbackDiv) {
            feedbackDiv.style.display = 'none';
            feedbackDiv.textContent = '';
        }

        // Bind theme preset buttons
        modal.querySelectorAll('.btn-preset-theme').forEach(btn => {
            btn.addEventListener('click', () => {
                const primary = btn.getAttribute('data-primary');
                const secondary = btn.getAttribute('data-secondary');
                
                document.getElementById('profile-theme-primary').value = primary;
                document.getElementById('val-theme-primary').textContent = primary;
                document.getElementById('profile-theme-secondary').value = secondary;
                document.getElementById('val-theme-secondary').textContent = secondary;

                document.documentElement.style.setProperty('--primary-hue', primary);
                document.documentElement.style.setProperty('--secondary-hue', secondary);
                this.showToast('Farb-Preset angewendet!', 'success');
            });
        });

        modal.classList.add('active');
    }

    handleSkillAdd() {
        const input = document.getElementById('new-skill-input');
        const value = input.value.trim();
        
        if (value) {
            // Support comma separated values
            const splitSkills = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            
            splitSkills.forEach(skill => {
                if (!this.activeSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
                    this.activeSkills.push(skill);
                }
            });

            input.value = '';
            this.renderSkillTags();
        }
    }

    removeSkill(skillToRemove) {
        this.activeSkills = this.activeSkills.filter(s => s !== skillToRemove);
        this.renderSkillTags();
    }

    renderSkillTags() {
        const container = document.getElementById('profile-skills-list');
        container.innerHTML = this.activeSkills.map(skill => `
            <div class="skill-tag">
                <span>${skill}</span>
                <button type="button" class="btn-remove-skill" data-skill="${skill}">&times;</button>
            </div>
        `).join('');

        // Bind delete action
        container.querySelectorAll('.btn-remove-skill').forEach(btn => {
            btn.addEventListener('click', () => {
                const skill = btn.getAttribute('data-skill');
                this.removeSkill(skill);
            });
        });
    }

    async handleProfileSubmit() {
        const notificationsEnabled = document.getElementById('profile-notifications').checked;
        
        if (notificationsEnabled && Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                this.showToast('Benachrichtigungen wurden vom Browser blockiert.', 'warning');
            }
        }

        const activeProfile = storage.getProfile();
        const updatedProfile = {
            id: activeProfile.id,
            profileName: activeProfile.profileName,
            name: document.getElementById('profile-name').value,
            title: document.getElementById('profile-title').value,
            skills: this.activeSkills,
            experience: document.getElementById('profile-experience').value,
            notificationsEnabled: notificationsEnabled,
            geminiApiKey: document.getElementById('profile-api-key').value.trim(),
            geminiModel: document.getElementById('profile-gemini-model').value,
            geminiTemperature: parseFloat(document.getElementById('profile-gemini-temperature').value),
            geminiCustomInstructions: document.getElementById('profile-gemini-instructions').value,
            lrsEnabled: document.getElementById('profile-lrs').checked,
            rgsEnabled: document.getElementById('profile-rgs').checked,
            taxClass: document.getElementById('profile-tax-class').value,
            churchTax: document.getElementById('profile-church-tax').value,
            hasChildren: document.getElementById('profile-has-children').checked,
            supabaseUrl: document.getElementById('profile-supabase-url').value.trim(),
            supabaseAnonKey: document.getElementById('profile-supabase-key').value.trim(),
            themePrimaryHue: parseInt(document.getElementById('profile-theme-primary').value, 10),
            themeSecondaryHue: parseInt(document.getElementById('profile-theme-secondary').value, 10)
        };

        storage.saveProfile(updatedProfile);
        this.applyAccessibilitySettings();
        this.showToast('Profil und Skills gespeichert', 'success');
        this.closeModal('profile-modal');
        this.renderCurrentView();
    }

    // --- TOAST NOTIFICATIONS ---
    showToast(message, type = 'primary') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info';
        if (type === 'success') icon = 'check-circle2';
        else if (type === 'danger') icon = 'alert-octagon';
        else if (type === 'warning') icon = 'alert-triangle';

        toast.innerHTML = `
            <i data-lucide="${icon}" class="toast-icon"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        lucide.createIcons();

        // Animate out
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // --- BACKUP ACTIONS ---
    handleDataExport() {
        try {
            const dataStr = storage.exportBackup();
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `jobmatch_backup_${new Date().toISOString().slice(0,10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showToast('Backup erfolgreich heruntergeladen!', 'success');
        } catch (e) {
            this.showToast('Fehler beim Exportieren der Daten.', 'danger');
        }
    }

    handleDataImport(e) {
        const fileReader = new FileReader();
        const file = e.target.files[0];
        
        if (!file) return;
        
        fileReader.onload = (event) => {
            try {
                const parsedData = event.target.result;
                storage.importBackup(parsedData);
                this.showToast('Daten erfolgreich importiert!', 'success');
                
                // Clear input
                e.target.value = '';
                
                // Rerender
                this.renderCurrentView();
            } catch (err) {
                this.showToast('Fehler: Ungültiges Backup-Format.', 'danger');
            }
        };
        
        fileReader.readAsText(file);
    }

    // --- DEADLINE CHECKER & NOTIFICATIONS ---
    checkDeadlines() {
        const profile = storage.getProfile();
        if (!profile.notificationsEnabled) return;

        if (Notification.permission !== 'granted') return;

        const jobs = storage.getJobs();
        const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // Find active jobs with deadline today
        const activeAlerts = jobs.filter(job => {
            return job.deadline === todayStr && 
                   (job.status === 'saved' || job.status === 'prepared' || job.status === 'applied');
        });

        activeAlerts.forEach(job => {
            new Notification('JobMatch Fristen-Alarm', {
                body: `Die Bewerbungsfrist für "${job.title}" bei "${job.company}" läuft heute ab!`,
                icon: 'favicon.ico'
            });
        });
    }

    initNotificationBell() {
        const bellBtn = document.getElementById('btn-notifications-bell');
        const badge = document.getElementById('bell-badge-indicator');
        const dropdown = document.getElementById('bell-notifications-dropdown');
        const list = document.getElementById('bell-dropdown-list');

        if (!bellBtn || !dropdown || !list) return;

        // Toggle dropdown on click
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = dropdown.classList.contains('active');
            dropdown.classList.toggle('active');
            bellBtn.setAttribute('aria-expanded', !isActive);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
                dropdown.classList.remove('active');
                bellBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Function to update notifications count and list
        const updateBell = () => {
            const jobs = storage.getJobs();
            // Get local YYYY-MM-DD
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            // Find active jobs with deadline today
            const todayDeadlines = jobs.filter(job => {
                return job.deadline === todayStr && 
                       job.status !== 'rejected' && 
                       job.status !== 'offer';
            });

            if (todayDeadlines.length > 0) {
                if (badge) badge.style.display = 'block';
                list.innerHTML = todayDeadlines.map(job => `
                    <div class="bell-dropdown-item" data-job-id="${job.id}" style="cursor: pointer;">
                        <span class="job-info">${job.company}</span>
                        <span class="job-desc">${job.title} (Frist heute!)</span>
                    </div>
                `).join('');

                // Bind click to open job modal edit
                list.querySelectorAll('.bell-dropdown-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const jobId = item.getAttribute('data-job-id');
                        this.editJob(jobId);
                        dropdown.classList.remove('active');
                        bellBtn.setAttribute('aria-expanded', 'false');
                    });
                });
            } else {
                if (badge) badge.style.display = 'none';
                list.innerHTML = `<div class="bell-dropdown-empty">Keine Fristen für heute.</div>`;
            }
        };

        // Run initially
        updateBell();

        // Expose to window.app
        this.updateNotificationBell = updateBell;
    }

    renderModalTodos() {
        const listEl = document.getElementById('modal-todos-list');
        const emptyEl = document.getElementById('modal-todos-empty');
        const countBadge = document.getElementById('modal-todos-count');

        if (!listEl || !emptyEl || !countBadge) return;

        countBadge.textContent = this.modalTodos.length;
        if (this.modalTodos.length > 0) {
            countBadge.style.display = 'inline-block';
            emptyEl.style.display = 'none';
            listEl.style.display = 'flex';
        } else {
            countBadge.style.display = 'none';
            emptyEl.style.display = 'block';
            listEl.style.display = 'none';
        }

        listEl.innerHTML = this.modalTodos.map(todo => `
            <li class="todo-list-item ${todo.completed ? 'completed' : ''}" data-todo-id="${todo.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); transition: all var(--transition-fast);">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} style="width: 16px; height: 16px; margin-right: 12px; accent-color: var(--primary); cursor: pointer;">
                <span class="todo-text" style="flex-grow: 1; font-size: 0.88rem; color: var(--text-primary); text-decoration: ${todo.completed ? 'line-through' : 'none'}; opacity: ${todo.completed ? '0.6' : '1'};">${todo.text}</span>
                <button type="button" class="btn-delete-todo" title="Aufgabe löschen" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); transition: all var(--transition-fast); display: inline-flex; align-items: center; justify-content: center;">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
            </li>
        `).join('');

        lucide.createIcons();

        // Bind toggle
        listEl.querySelectorAll('.todo-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const todoId = cb.closest('.todo-list-item').getAttribute('data-todo-id');
                const todo = this.modalTodos.find(t => t.id === todoId);
                if (todo) {
                    todo.completed = e.target.checked;
                    const textEl = cb.closest('.todo-list-item').querySelector('.todo-text');
                    if (textEl) {
                        textEl.style.textDecoration = todo.completed ? 'line-through' : 'none';
                        textEl.style.opacity = todo.completed ? '0.6' : '1';
                    }
                    cb.closest('.todo-list-item').classList.toggle('completed', todo.completed);
                }
            });
        });

        // Bind delete
        listEl.querySelectorAll('.btn-delete-todo').forEach(btn => {
            btn.addEventListener('click', () => {
                const todoId = btn.closest('.todo-list-item').getAttribute('data-todo-id');
                this.modalTodos = this.modalTodos.filter(t => t.id !== todoId);
                this.renderModalTodos();
            });
        });
    }

    renderModalInterviews() {
        const listEl = document.getElementById('modal-interviews-list');
        const emptyEl = document.getElementById('modal-interviews-empty');
        const countBadge = document.getElementById('modal-interviews-count');

        if (!listEl || !emptyEl || !countBadge) return;

        // Sort interviews chronologically
        this.modalInterviews.sort((a, b) => new Date(a.date) - new Date(b.date));

        countBadge.textContent = this.modalInterviews.length;
        if (this.modalInterviews.length > 0) {
            countBadge.style.display = 'inline-block';
            emptyEl.style.display = 'none';
            listEl.style.display = 'flex';
        } else {
            countBadge.style.display = 'none';
            emptyEl.style.display = 'block';
            listEl.style.display = 'none';
        }

        listEl.innerHTML = this.modalInterviews.map(item => {
            let dateStr = 'Keine Zeit';
            if (item.date) {
                dateStr = new Date(item.date).toLocaleString('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
            }
            return `
                <div class="interview-card" data-id="${item.id}" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px; transition: all var(--transition-fast); position: relative;">
                    <button type="button" class="btn-delete-interview" title="Gespräch löschen" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); transition: all var(--transition-fast); position: absolute; top: 10px; right: 10px; display: inline-flex; align-items: center; justify-content: center;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                    <div class="interview-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px; padding-right: 24px;">
                        <span class="interview-round-title" style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${item.round}</span>
                        <span class="interview-date-badge" style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</span>
                    </div>
                    ${item.interviewer ? `
                        <div class="interview-interviewer-name" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                            <i data-lucide="user" style="width: 12px; height: 12px; display: inline;"></i> ${item.interviewer}
                        </div>
                    ` : ''}
                    ${item.notes ? `<p class="interview-notes-text" style="font-size: 0.82rem; line-height: 1.45; color: var(--text-secondary); white-space: pre-wrap; background: rgba(0, 0, 0, 0.15); padding: 8px 10px; border-radius: var(--radius-sm); margin: 4px 0 0 0;">${item.notes}</p>` : ''}
                </div>
            `;
        }).join('');

        lucide.createIcons();

        // Bind delete
        listEl.querySelectorAll('.btn-delete-interview').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.closest('.interview-card').getAttribute('data-id');
                this.modalInterviews = this.modalInterviews.filter(item => item.id !== id);
                this.renderModalInterviews();
            });
        });
    }

    renderModalHistory() {
        const listEl = document.getElementById('modal-history-list');
        const emptyEl = document.getElementById('modal-history-empty');
        const countBadge = document.getElementById('modal-history-count');

        if (!listEl || !emptyEl || !countBadge) return;

        // Sort history chronologically descending (newest first)
        this.modalHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        countBadge.textContent = this.modalHistory.length;
        if (this.modalHistory.length > 0) {
            countBadge.style.display = 'inline-block';
            emptyEl.style.display = 'none';
            listEl.style.display = 'flex';
        } else {
            countBadge.style.display = 'none';
            emptyEl.style.display = 'block';
            listEl.style.display = 'none';
        }

        listEl.innerHTML = this.modalHistory.map(item => {
            let dateStr = 'Keine Zeit';
            if (item.date) {
                dateStr = new Date(item.date).toLocaleString('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
            }
            return `
                <div class="history-card" data-id="${item.id}" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px; transition: all var(--transition-fast); position: relative;">
                    <button type="button" class="btn-delete-history" title="Eintrag löschen" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); transition: all var(--transition-fast); position: absolute; top: 10px; right: 10px; display: inline-flex; align-items: center; justify-content: center;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                    <div class="history-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px; padding-right: 24px;">
                        <span class="history-round-title" style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${item.subject}</span>
                        <span class="history-date-badge" style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</span>
                    </div>
                    <div class="history-type-tag" style="font-size: 0.75rem; font-weight: 600; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="tag" style="width: 12px; height: 12px; display: inline;"></i> ${item.type}
                    </div>
                    ${item.content ? `<p class="history-content-text" style="font-size: 0.82rem; line-height: 1.45; color: var(--text-secondary); white-space: pre-wrap; background: rgba(0, 0, 0, 0.15); padding: 8px 10px; border-radius: var(--radius-sm); margin: 4px 0 0 0;">${item.content}</p>` : ''}
                </div>
            `;
        }).join('');

        lucide.createIcons();

        // Bind delete
        listEl.querySelectorAll('.btn-delete-history').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.closest('.history-card').getAttribute('data-id');
                this.modalHistory = this.modalHistory.filter(item => item.id !== id);
                this.renderModalHistory();
            });
        });
    }

    initCvUpload() {
        const fileInput = document.getElementById('profile-cv-upload');
        const triggerBtn = document.getElementById('btn-trigger-cv-upload');
        const filenameSpan = document.getElementById('cv-upload-filename');

        if (!fileInput || !triggerBtn) return;

        triggerBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            filenameSpan.textContent = file.name;
            triggerBtn.disabled = true;
            const originalText = triggerBtn.innerHTML;
            triggerBtn.innerHTML = `<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Lese...`;

            try {
                let text = '';
                if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                    text = await this.extractTextFromPdf(file);
                } else {
                    text = await this.readTextFile(file);
                }

                if (!text || !text.trim()) {
                    throw new Error("Text konnte nicht aus der Datei extrahiert werden.");
                }

                this.showToast('Analysiere Lebenslauf...', 'primary');
                
                const profile = storage.getProfile();
                const apiKey = document.getElementById('profile-api-key').value.trim() || profile.geminiApiKey;
                const parsed = await mockAi.parseCVText(apiKey, text);

                if (parsed.name) document.getElementById('profile-name').value = parsed.name;
                if (parsed.title) document.getElementById('profile-title').value = parsed.title;
                if (parsed.experience) document.getElementById('profile-experience').value = parsed.experience;
                if (parsed.skills && Array.isArray(parsed.skills)) {
                    this.activeSkills = parsed.skills;
                    this.renderSkillTags();
                }

                this.showToast('Lebenslauf erfolgreich importiert!', 'success');
            } catch (err) {
                console.error(err);
                this.showToast('Fehler beim Importieren: ' + err.message, 'danger');
            } finally {
                triggerBtn.disabled = false;
                triggerBtn.innerHTML = originalText;
                lucide.createIcons();
            }
        });
    }

    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Fehler beim Lesen der Textdatei."));
            reader.readAsText(file);
        });
    }

    extractTextFromPdf(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const typedarray = new Uint8Array(reader.result);
                    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                    let text = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const pageText = content.items.map(item => item.str).join(' ');
                        text += pageText + '\n';
                    }
                    resolve(text);
                } catch (err) {
                    reject(new Error("PDF-Konvertierungsfehler: " + err.message));
                }
            };
            reader.onerror = () => reject(new Error("Fehler beim Laden des PDF-Streams."));
            reader.readAsArrayBuffer(file);
        });
    }

    renderModalExpenses() {
        const list = document.getElementById('modal-expenses-list');
        const empty = document.getElementById('modal-expenses-empty');
        const countBadge = document.getElementById('modal-expenses-count');
        if (!list) return;

        const count = this.modalExpenses.length;
        if (countBadge) countBadge.textContent = count;

        if (count === 0) {
            list.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        empty.style.display = 'none';
        list.style.display = 'flex';

        list.innerHTML = this.modalExpenses.map(exp => {
            const formattedAmt = parseFloat(exp.amount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            return `
                <div class="expense-item" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="text-align: left;">
                        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--success); font-weight: 700; display: block;">${exp.category}</span>
                        <h5 style="margin: 2px 0; font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">${exp.notes || exp.category}</h5>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(exp.date).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <span style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${formattedAmt}</span>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.deleteModalExpense('${exp.id}')" style="padding: 6px; display: inline-flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.2); color: #ef4444;">
                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    }

    deleteModalExpense(id) {
        this.modalExpenses = this.modalExpenses.filter(e => e.id !== id);
        this.renderModalExpenses();
    }

    renderModalDocuments() {
        const list = document.getElementById('modal-documents-list');
        const empty = document.getElementById('modal-documents-empty');
        const countBadge = document.getElementById('modal-documents-count');
        if (!list) return;

        const count = this.modalDocuments.length;
        if (countBadge) countBadge.textContent = count;

        if (count === 0) {
            list.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        empty.style.display = 'none';
        list.style.display = 'flex';

        list.innerHTML = this.modalDocuments.map(doc => {
            const kbSize = Math.round(doc.size / 1024);
            return `
                <div class="document-item" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="text-align: left; display: flex; align-items: center; gap: 10px;">
                        <i data-lucide="file-text" style="color: var(--primary); width: 20px; height: 20px; flex-shrink: 0;"></i>
                        <div>
                            <h5 style="margin: 0 0 2px 0; font-size: 0.88rem; font-weight: 600; color: var(--text-primary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${doc.name}">${doc.name}</h5>
                            <span style="font-size: 0.72rem; color: var(--text-muted);">${kbSize} KB • ${new Date(doc.uploadDate).toLocaleDateString('de-DE')}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.downloadDocument('${doc.id}', '${doc.name}')" title="Herunterladen" style="padding: 6px; display: inline-flex; align-items: center; justify-content: center;">
                            <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.deleteDocument('${doc.id}')" title="Löschen" style="padding: 6px; display: inline-flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.2); color: #ef4444;">
                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    }

    async downloadDocument(fileId, filename) {
        try {
            const doc = await db.getFile(fileId);
            if (!doc || !doc.fileBlob) {
                this.showToast('Datei nicht gefunden.', 'danger');
                return;
            }

            const url = URL.createObjectURL(doc.fileBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed', err);
            this.showToast('Fehler beim Herunterladen der Datei.', 'danger');
        }
    }

    async deleteDocument(fileId) {
        try {
            await db.deleteFile(fileId);
            this.modalDocuments = this.modalDocuments.filter(d => d.id !== fileId);
            this.showToast('Datei gelöscht.', 'warning');
            this.renderModalDocuments();
        } catch (err) {
            console.error('Delete failed', err);
            this.showToast('Fehler beim Löschen der Datei.', 'danger');
        }
    }
}

// Instantiate and attach globally
window.app = new App();
document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
});
