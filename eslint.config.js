const js = require('@eslint/js');
const eslintConfigPrettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
    {
        ignores: [
            'node_modules/**',
            'assets/vendor/**',
            'Projekte/**',
            'test-results/**',
            'playwright-report/**',
            'assets/js/projects_data.js',
        ],
    },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                Prism: 'readonly',
                // Cross-file browser globals. Classic <script> includes define them in the shared
                // global scope (constants.js: APP, STORAGE_KEYS; components.js: AppStorage;
                // news_data.js: newsData; toast.js: showToast), and two ES modules attach
                // themselves to window so those classic scripts can reach them
                // (modules/achievements.js, modules/confetti.js).
                APP: 'readonly',
                AppStorage: 'readonly',
                STORAGE_KEYS: 'readonly',
                Achievements: 'readonly',
                Confetti: 'readonly',
                newsData: 'readonly',
                initBlogEnhancements: 'readonly',
                showToast: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'no-empty': 'warn',
            'no-console': 'off',
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'no-var': 'error',
            'prefer-const': 'error',
            'no-alert': 'error',
            'no-useless-assignment': 'error',
        },
    },
    {
        // Der Service Worker läuft im Worker-Scope (clients, caches, skipWaiting ...).
        files: ['sw.js'],
        languageOptions: { globals: { ...globals.serviceworker } },
    },
    eslintConfigPrettier,
];
