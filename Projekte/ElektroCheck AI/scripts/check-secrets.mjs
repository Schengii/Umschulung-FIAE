#!/usr/bin/env node

/**
 * Pre-Commit Secret Scanner für ElektroCheck AI
 * 
 * Verhindert das versehentliche Committen von:
 * 1. .env-Dateien (jegliche .env, .env.local etc., außer .example/.template)
 * 2. Echten API-Keys und sensiblen Tokens (Gemini, Resend, Upstash, OpenAI, Private Keys etc.)
 */

import { execSync } from 'child_process';
import path from 'path';

// ANSI Farbcodes für Terminalausgabe
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

// Reguläre Ausdrücke für bekannte API-Keys und Secrets
const SECRET_PATTERNS = [
  {
    name: 'Google Gemini / Cloud API Key',
    regex: /AIzaSy[0-9A-Za-z_-]{33}/g,
  },
  {
    name: 'Resend API Key',
    regex: /re_[0-9A-Za-z_]{20,}/g,
  },
  {
    name: 'OpenAI API Key',
    regex: /sk-[0-9A-Za-z_-]{20,}/g,
  },
  {
    name: 'Anthropic Claude API Key',
    regex: /sk-ant-[0-9A-Za-z_-]{20,}/g,
  },
  {
    name: 'Private Key (RSA/EC/SSH)',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  },
  {
    name: 'Upstash Redis REST Token (Hartkodiert)',
    regex: /UPSTASH_REDIS_REST_TOKEN\s*[:=]\s*['"][a-zA-Z0-9_-]{20,}['"]/g,
  },
  {
    name: 'Dienst-Zugriffstoken (Hartkodierter Hex-Key)',
    regex: /APP_ACCESS_TOKEN\s*[:=]\s*['"][a-f0-9]{32,}['"]/g,
  }
];

// Dateien/Pfade, die von der Inhaltsprüfung ausgenommen sind (z. B. Beispieldateien, Tests)
const ALLOWED_FILES_FOR_PATTERNS = [
  /\.env\.example$/,
  /\.env\.template$/,
  /backend\/\.env\.template$/,
  /backend\/tests\/.*\.js$/, // Mock-Token in Tests
  /scripts\/check-secrets\.mjs$/, // Dieser Scanner selbst
];

function runGit(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function checkStagedFiles() {
  console.log(`${BOLD}🔒 Pre-Commit Check: Scanne gestagete Dateien auf .env und API-Keys...${RESET}`);

  // 1. Hole Liste aller gestageten Dateien (Added, Copied, Modified)
  const stagedFilesRaw = runGit('git diff --cached --name-only --diff-filter=ACM');
  if (!stagedFilesRaw) {
    console.log(`${GREEN}✔ Keine gestageten Änderungen gefunden.${RESET}`);
    return;
  }

  const stagedFiles = stagedFilesRaw.split(/\r?\n/).map(f => f.trim()).filter(Boolean);
  const violations = [];

  // --- PRÜFUNG 1: Blockiere .env-Dateien ---
  for (const file of stagedFiles) {
    const filename = path.basename(file).toLowerCase();
    const isEnvFile = filename === '.env' || filename.startsWith('.env.');
    const isAllowedTemplate = filename.endsWith('.example') || filename.endsWith('.template');

    if (isEnvFile && !isAllowedTemplate) {
      violations.push({
        file,
        reason: 'Dateiname blockiert: Es dürfen keine echten .env-Dateien in Git committet werden!',
        solution: `Führe folgenden Befehl aus: git reset HEAD "${file}"`
      });
    }
  }

  // --- PRÜFUNG 2: Blockiere API-Keys im Datei-Diff ---
  for (const file of stagedFiles) {
    const isExcluded = ALLOWED_FILES_FOR_PATTERNS.some(regex => regex.test(file.replace(/\\/g, '/')));
    if (isExcluded) {
      continue;
    }

    // Hole den Diff für die Datei (nur hinzugefügte/geänderte Zeilen mit '+')
    const diff = runGit(`git diff --cached --unified=0 -- "${file}"`);
    if (!diff) continue;

    const addedLines = diff
      .split(/\r?\n/)
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.slice(1));

    for (const line of addedLines) {
      for (const pattern of SECRET_PATTERNS) {
        pattern.regex.lastIndex = 0; // Regex-State zurücksetzen
        if (pattern.regex.test(line)) {
          // Teilmaskierung des gefundenen Werts für sichere Ausgabe
          const maskedLine = line.trim().replace(/(AIzaSy|re_|sk-|sk-ant-)[A-Za-z0-9_-]{8,}/g, '$1********');
          violations.push({
            file,
            reason: `Sensibler Wert gefunden: ${pattern.name}`,
            snippet: maskedLine.length > 80 ? maskedLine.substring(0, 80) + '...' : maskedLine,
            solution: `Entferne den Key aus "${file}". Nutze Umgebungsvariablen (.env) und trage Keys nicht direkt in den Code ein!`
          });
        }
      }
    }
  }

  // --- ERGEBNIS-AUSWERTUNG ---
  if (violations.length > 0) {
    console.error(`\n${RED}${BOLD}❌ COMMIT ABGEBROCHEN: Sensible Dateien oder API-Keys entdeckt!${RESET}\n`);
    violations.forEach((v, idx) => {
      console.error(`${YELLOW}[${idx + 1}] Datei:${RESET} ${BOLD}${v.file}${RESET}`);
      console.error(`    ${RED}Problem:${RESET} ${v.reason}`);
      if (v.snippet) {
        console.error(`    ${RED}Auszug:${RESET}  ${v.snippet}`);
      }
      console.error(`    ${GREEN}Lösung:${RESET}  ${v.solution}\n`);
    });
    console.error(`${RED}Sicherheitshinweis:${RESET} Nutze stattdessen '.env' (lokal) oder die Vercel-Umgebungsvariablen.\n`);
    process.exit(1);
  }

  console.log(`${GREEN}✔ Keine sensiblen Dateien oder API-Keys entdeckt. Commit genehmigt.${RESET}`);
}

checkStagedFiles();
