/**
 * Code Playground / Sandbox Logic
 * Handles HTML/CSS/JS tab compilation, template injections,
 * and intercepts console logs/errors from iFrame to display them in a mock console.
 */

import { PLAYGROUND_TEMPLATES } from './modules/playground-templates.js';

class CodePlayground {
    constructor() {
        this.activeTab = 'html';
        this.runTimeout = null;

        this.htmlEditor = /** @type {HTMLInputElement} */ (document.getElementById('editor-html'));
        this.cssEditor = /** @type {HTMLInputElement} */ (document.getElementById('editor-css'));
        this.jsEditor = /** @type {HTMLInputElement} */ (document.getElementById('editor-js'));

        this.htmlWrapper = document.getElementById('wrapper-html');
        this.cssWrapper = document.getElementById('wrapper-css');
        this.jsWrapper = document.getElementById('wrapper-js');

        this.htmlLines = document.getElementById('line-numbers-html');
        this.cssLines = document.getElementById('line-numbers-css');
        this.jsLines = document.getElementById('line-numbers-js');

        this.previewIframe = /** @type {HTMLIFrameElement} */ (document.getElementById('preview-iframe'));
        this.consoleLogBox = document.getElementById('console-log-box');

        this.btnHtml = document.getElementById('btn-tab-html');
        this.btnCss = document.getElementById('btn-tab-css');
        this.btnJs = document.getElementById('btn-tab-js');

        this.runBtn = document.getElementById('run-code-btn');
        this.clearConsoleBtn = document.getElementById('clear-console-btn');

        this.init();
    }

    init() {
        // Tab switching listeners
        if (this.btnHtml) this.btnHtml.addEventListener('click', () => this.switchTab('html'));
        if (this.btnCss) this.btnCss.addEventListener('click', () => this.switchTab('css'));
        if (this.btnJs) this.btnJs.addEventListener('click', () => this.switchTab('js'));

        /**
         * @param {HTMLInputElement | HTMLTextAreaElement} editor
         * @param {HTMLElement} linesEl
         */
        const updateLineNumbers = (editor, linesEl) => {
            if (!editor || !linesEl) return;
            const linesCount = editor.value.split('\n').length;
            let linesHtml = '';
            for (let i = 1; i <= linesCount; i++) {
                linesHtml += i + '\n';
            }
            linesEl.textContent = linesHtml;
        };

        /** @type {Record<string, string>} */
        const brackets = {
            '{': '}',
            '[': ']',
            '(': ')',
            '"': '"',
            "'": "'",
        };

        const editorConfig = [
            { ed: this.htmlEditor, wrapper: this.htmlWrapper, lines: this.htmlLines },
            { ed: this.cssEditor, wrapper: this.cssWrapper, lines: this.cssLines },
            { ed: this.jsEditor, wrapper: this.jsWrapper, lines: this.jsLines },
        ];

        editorConfig.forEach((item) => {
            const { ed, lines } = item;
            if (!ed || !lines) return;

            // Initial rendering of line numbers
            updateLineNumbers(ed, lines);

            // Sync scroll
            ed.addEventListener('scroll', () => {
                lines.scrollTop = ed.scrollTop;
            });

            // Debounced auto-run triggers
            ed.addEventListener('input', () => {
                updateLineNumbers(ed, lines);
                clearTimeout(this.runTimeout);
                this.runTimeout = setTimeout(() => this.runCode(), 1000);
            });

            // Bracket matching & indent
            ed.addEventListener('keydown', (e) => {
                const start = ed.selectionStart;
                const end = ed.selectionEnd;
                const val = ed.value;

                if (e.key === 'Tab') {
                    e.preventDefault();
                    ed.value = val.substring(0, start) + '    ' + val.substring(end);
                    ed.selectionStart = ed.selectionEnd = start + 4;
                    // Trigger input event
                    ed.dispatchEvent(new Event('input'));
                }

                if (brackets[e.key] !== undefined) {
                    e.preventDefault();
                    const closing = brackets[e.key];
                    ed.value = val.substring(0, start) + e.key + closing + val.substring(end);
                    ed.selectionStart = ed.selectionEnd = start + 1;
                    // Trigger input event
                    ed.dispatchEvent(new Event('input'));
                }
            });
        });

        // Run button
        if (this.runBtn) {
            this.runBtn.addEventListener('click', () => {
                this.runCode();
                this.addPlaygroundCommit();
            });
        }

        // Clear console
        if (this.clearConsoleBtn) {
            this.clearConsoleBtn.addEventListener('click', () => {
                if (this.consoleLogBox) this.consoleLogBox.innerHTML = '';
            });
        }

        // Message receiver from iFrame
        window.addEventListener('message', (e) => {
            if (this.previewIframe && e.source !== this.previewIframe.contentWindow) {
                return;
            }
            if (e.data && e.data.type === 'CONSOLE_LOG') {
                this.appendLog(e.data.message, 'log');
            } else if (e.data && e.data.type === 'CONSOLE_ERROR') {
                this.appendLog(e.data.message, 'error');
            }
        });

        // Bind Template selection
        const templateBtns = document.querySelectorAll('.template-select-btn');
        templateBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const templKey = btn.getAttribute('data-template');
                this.loadTemplate(templKey);
            });
        });

        // Load initial template
        this.loadTemplate('counter');
    }

    /** @param {string} tab */
    switchTab(tab) {
        this.activeTab = tab;

        // Update tab buttons
        this.btnHtml.classList.remove('active');
        this.btnCss.classList.remove('active');
        this.btnJs.classList.remove('active');

        if (tab === 'html') this.btnHtml.classList.add('active');
        if (tab === 'css') this.btnCss.classList.add('active');
        if (tab === 'js') this.btnJs.classList.add('active');

        // Show active editor wrapper
        if (this.htmlWrapper) this.htmlWrapper.classList.add('collapsed');
        if (this.cssWrapper) this.cssWrapper.classList.add('collapsed');
        if (this.jsWrapper) this.jsWrapper.classList.add('collapsed');

        if (tab === 'html' && this.htmlWrapper) this.htmlWrapper.classList.remove('collapsed');
        if (tab === 'css' && this.cssWrapper) this.cssWrapper.classList.remove('collapsed');
        if (tab === 'js' && this.jsWrapper) this.jsWrapper.classList.remove('collapsed');
    }

    /** @param {string} key */
    loadTemplate(key) {
        const templ = PLAYGROUND_TEMPLATES[key];
        if (!templ) return;

        if (this.htmlEditor) this.htmlEditor.value = templ.html;
        if (this.cssEditor) this.cssEditor.value = templ.css;
        if (this.jsEditor) this.jsEditor.value = templ.js;

        if (this.consoleLogBox) {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            const welcomeMsg =
                lang === 'de'
                    ? `System: Template "${templ.titleDe}" geladen.`
                    : `System: Template "${templ.titleEn}" loaded.`;
            this.consoleLogBox.innerHTML = `<div class="console-entry system">[Info] ${welcomeMsg}</div>`;
        }

        this.runCode();
        this.addPlaygroundCommit();
    }

    runCode() {
        if (!this.previewIframe) return;

        const html = this.htmlEditor ? this.htmlEditor.value : '';
        const css = this.cssEditor ? this.cssEditor.value : '';
        const js = this.jsEditor ? this.jsEditor.value : '';

        // Combined content with Console Interceptor Script
        const compiledSource = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    ${css}
                </style>
                <script>
                    // Intercept logs and send them to parent window
                    const _log = console.log;
                    console.log = function(...args) {
                        window.parent.postMessage({ type: 'CONSOLE_LOG', message: args.join(' ') }, '*');
                        _log.apply(console, args);
                    };
                    window.onerror = function(message, source, lineno, colno, error) {
                        window.parent.postMessage({ type: 'CONSOLE_ERROR', message: message + " (Zeile / Line " + lineno + ")" }, '*');
                    };
                </script>
            </head>
            <body>
                ${html}
                <script>
                    try {
                        ${js}
                    } catch (err) {
                        window.parent.postMessage({ type: 'CONSOLE_ERROR', message: err.message }, '*');
                    }
                </script>
            </body>
            </html>
        `;

        // Set srcdoc
        this.previewIframe.srcdoc = compiledSource;

        // Play audio feed back if available
        if (typeof GameAudio !== 'undefined') {
            GameAudio.play('match');
        }
    }

    /**
     * @param {string} message
     * @param {string} type
     */
    appendLog(message, type) {
        if (!this.consoleLogBox) return;

        const entry = document.createElement('div');
        entry.className = `console-entry ${type}`;

        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;

        this.consoleLogBox.appendChild(entry);
        this.consoleLogBox.scrollTop = this.consoleLogBox.scrollHeight;
    }

    addPlaygroundCommit() {
        if (window.addLiveCommit) {
            window.addLiveCommit();
        } else {
            const commitKey =
                (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GITHUB_LIVE_COMMITS_TODAY) ||
                'github_live_commits_today';
            let liveCommitsToday = parseInt(AppStorage.getItem(commitKey, 0)) || 0;
            liveCommitsToday++;
            AppStorage.setItem(commitKey, liveCommitsToday);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CodePlayground();
});
