#!/usr/bin/env node

/**
 * Pre-Commit Hook Checker für Amazon 2.0
 * 
 * Verhindert das versehentliche Committen von:
 * 1. .env-Dateien (.env, .env.local, .env.production etc. - Ausnahme: .env.example)
 * 2. API-Keys, Private Keys und sensiblen Tokens (Anthropic, OpenAI, AWS, GitHub, Google, Stripe etc.)
 */

import { execSync } from 'node:child_process';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return output.split('\n').map(f => f.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function getStagedDiff() {
  try {
    return execSync('git diff --cached --unified=0', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

const stagedFiles = getStagedFiles();

if (stagedFiles.length === 0) {
  process.exit(0);
}

let hasError = false;

// ==============================================================================
// 1. Prüfung auf .env Dateien
// ==============================================================================
const blockedEnvFiles = stagedFiles.filter(file => {
  const normalized = file.replace(/\\/g, '/').toLowerCase();
  const baseName = normalized.split('/').pop() || '';
  
  // .env.example ist explizit erlaubt
  if (baseName === '.env.example') return false;
  
  // Alle anderen .env Varianten blockieren
  return (
    baseName === '.env' ||
    baseName.startsWith('.env.') ||
    baseName.endsWith('.env')
  );
});

if (blockedEnvFiles.length > 0) {
  hasError = true;
  console.error(`\n${RED}${BOLD}❌ [PRE-COMMIT FEHLER] Blockierte .env-Dateien entdeckt!${RESET}`);
  console.error(`${YELLOW}Folgende sensible Umgebungsdateien dürfen NIEMALS in Git committet werden:${RESET}`);
  blockedEnvFiles.forEach(f => console.error(`  ${RED}• ${f}${RESET}`));
  console.error(`\n${CYAN}💡 Lösung:${RESET}`);
  console.error(`  1. Entferne die Datei aus dem Git-Staging:`);
  console.error(`     git rm --cached ${blockedEnvFiles.join(' ')}`);
  console.error(`  2. Nutze stattdessen '.env.example' für Vorlagen ohne echte Geheimnisse.\n`);
}

// ==============================================================================
// 2. Prüfung auf API-Keys & sensible Tokens in Code-Änderungen
// ==============================================================================
const SECRET_PATTERNS = [
  {
    name: 'Anthropic Claude API Key',
    regex: /sk-ant-[a-zA-Z0-9_\-]{20,}/g,
  },
  {
    name: 'OpenAI API Key',
    regex: /sk-(?:proj-)?[a-zA-Z0-9_\-]{24,}/g,
  },
  {
    name: 'AWS Access Key ID',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /(?:gh[pousr]_[A-Za-z0-9_]{36,}|github_pat_[A-Za-z0-9_]{40,})/g,
  },
  {
    name: 'Google / Gemini API Key',
    regex: /AIza[0-9A-Za-z_-]{35}/g,
  },
  {
    name: 'Stripe Secret / Restricted Key',
    regex: /(?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{24,}/g,
  },
  {
    name: 'Slack Token',
    regex: /xox[baprs]-[0-9a-zA-Z]{10,}/g,
  },
  {
    name: 'Private Key Header',
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    name: 'Hardcoded Secret Assignment',
    regex: /(?:api_key|apikey|secret_key|private_key|auth_token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/gi,
  },
];

const diff = getStagedDiff();
const diffLines = diff.split('\n');

let currentFile = '';
const detectedSecrets = [];

for (const line of diffLines) {
  if (line.startsWith('+++ b/')) {
    currentFile = line.substring(6).trim();
    continue;
  }

  // Nur neu hinzugefügte Zeilen prüfen (startet mit '+', aber nicht '+++')
  if (line.startsWith('+') && !line.startsWith('+++')) {
    const addedContent = line.substring(1);

    for (const pattern of SECRET_PATTERNS) {
      pattern.regex.lastIndex = 0;
      const match = pattern.regex.exec(addedContent);
      if (match) {
        // Maskieren für die Fehlerausgabe
        const secretText = match[0];
        const masked = secretText.length > 8 
          ? secretText.substring(0, 4) + '...' + secretText.substring(secretText.length - 4)
          : '****';
        
        detectedSecrets.push({
          file: currentFile,
          type: pattern.name,
          preview: masked,
        });
      }
    }
  }
}

if (detectedSecrets.length > 0) {
  hasError = true;
  console.error(`\n${RED}${BOLD}❌ [PRE-COMMIT FEHLER] Mögliche API-Keys / Secrets im Diff gefunden!${RESET}`);
  console.error(`${YELLOW}Folgende sensible Daten wurden in deinen gestageten Änderungen gefunden:${RESET}`);
  detectedSecrets.forEach(s => {
    console.error(`  ${RED}• [${s.type}] in ${BOLD}${s.file}${RESET} (Match: ${s.preview})`);
  });
  console.error(`\n${CYAN}💡 Lösung:${RESET}`);
  console.error(`  1. Entferne die sensiblen API-Schlüssel aus dem Code.`);
  console.error(`  2. Verwende Umgebungsvariablen (.env via 'import.meta.env.VITE_*').`);
  console.error(`  3. Falls es sich um einen Test-Mock handelt, verwende neutrale Platzhalter wie 'mock-key-12345'.\n`);
}

if (hasError) {
  console.error(`${RED}${BOLD}⛔ Commit wurde aus Sicherheitsgründen abgebrochen!${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}✔ [Pre-Commit Hook] Sicherheitsprüfung bestanden (.env- & Secret-Check ok).${RESET}`);
  process.exit(0);
}
