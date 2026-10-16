#!/usr/bin/env node

/**
 * Pre-Commit Secret Scanner für Wohnungssuche KI
 * Prüft gestagte Git-Dateien auf .env-Dateien, API-Schlüssel und vertrauliche Tokens.
 * Verhindert versehentliche Commits von Secrets in Git und GitHub.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Erlaubte unkritische Platzhalter
const ALLOWED_PLACEHOLDERS = [
  'your_anthropic_api_key_here',
  'your_gemini_api_key_here',
  'your_openai_api_key_here',
  'your_api_key_here',
  'your_secret_here',
  'change_me',
  'example',
  'placeholder',
  'dev_only',
  'super_secret',
  'test_token'
];

// Regex-Muster für API-Keys und Secrets
const SECRET_PATTERNS = [
  {
    name: 'OpenAI API Key',
    regex: /\b(sk-(?:proj-)?[A-Za-z0-9_-]{30,})\b/g
  },
  {
    name: 'Anthropic API Key',
    regex: /\b(sk-ant-[A-Za-z0-9_-]{30,})\b/g
  },
  {
    name: 'Google Gemini / Cloud API Key',
    regex: /\b(AIza[0-9A-Za-z-_]{35})\b/g
  },
  {
    name: 'Telegram Bot Token',
    regex: /\b([0-9]{8,11}:[a-zA-Z0-9_-]{35})\b/g
  },
  {
    name: 'Privater kryptografischer Schlüssel',
    regex: /(-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----)/g
  },
  {
    name: 'AWS Access Key ID',
    regex: /\b((?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16})\b/g
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /\b((?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,})\b/g
  }
];

function isBlockedEnvFile(filePath) {
  const norm = filePath.replace(/\\/g, '/').toLowerCase();
  const base = path.basename(norm);

  // Erlaubte Vorlagen
  if (base.endsWith('.example') || norm.includes('.example') || base.endsWith('.sample')) {
    return false;
  }

  // Blockiere .env, .env.local, .env.development, .env.production etc.
  if (base === '.env' || base.startsWith('.env.')) {
    return true;
  }

  return false;
}

function getTargetFiles() {
  const checkAll = process.argv.includes('--all');
  try {
    const cmd = checkAll
      ? 'git ls-files'
      : 'git diff --cached --name-only --diff-filter=ACM';
    const stdout = execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return stdout
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);
  } catch (err) {
    // Kein Git Repository oder Fehler
    return [];
  }
}

function getFileContent(filePath) {
  const checkAll = process.argv.includes('--all');
  if (checkAll && fs.existsSync(filePath)) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (readErr) {
      return '';
    }
  }
  try {
    const gitPath = filePath.replace(/\\/g, '/');
    return execSync(`git show :${JSON.stringify(gitPath)}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024
    });
  } catch (err) {
    if (fs.existsSync(filePath)) {
      try {
        return fs.readFileSync(filePath, 'utf8');
      } catch (readErr) {
        return '';
      }
    }
    return '';
  }
}

function checkSecrets() {
  const checkAll = process.argv.includes('--all');
  const targetFiles = getTargetFiles();

  if (targetFiles.length === 0) {
    console.log(checkAll ? 'ℹ️  Keine getrackten Dateien zum Prüfen vorhanden.' : 'ℹ️  Keine gestagten Dateien zum Prüfen vorhanden.');
    process.exit(0);
  }

  const violations = [];

  for (const file of targetFiles) {
    const norm = file.replace(/\\/g, '/');

    // Vendor-, Dependency- und Build-Ordner überspringen
    if (
      norm.includes('node_modules/') ||
      norm.includes('.gradle/') ||
      norm.includes('.transforms/') ||
      norm.includes('intermediates/') ||
      norm.includes('dist/')
    ) {
      continue;
    }

    // 1. Prüfung auf verbotene .env Dateien
    if (isBlockedEnvFile(file)) {
      violations.push({
        file,
        reason: 'Blockierte Umgebungsdatei (.env). Nur .env.example darf committet werden.'
      });
      continue;
    }

    // Bestimmte Binär- oder Nicht-Text-Dateien überspringen
    const ext = path.extname(file).toLowerCase();
    const skipExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.jar', '.apk', '.dex', '.bin', '.db', '.sqlite'];
    if (skipExts.includes(ext)) {
      continue;
    }

    const content = getFileContent(file);
    if (!content) continue;

    // 2. Prüfung auf bekannte Secret-Muster
    for (const pattern of SECRET_PATTERNS) {
      pattern.regex.lastIndex = 0;
      let match;
      while ((match = pattern.regex.matchAll ? null : pattern.regex.exec(content)) !== null) {
        const matchedStr = match[0];
        const isAllowed = ALLOWED_PLACEHOLDERS.some(placeholder =>
          matchedStr.toLowerCase().includes(placeholder.toLowerCase())
        );

        if (!isAllowed) {
          violations.push({
            file,
            reason: `Potenzieller geheimer Schlüssel gefunden: ${pattern.name} (${matchedStr.substring(0, 8)}...)`
          });
          break;
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error('\n❌ FEHLER: Potenziell vertrauliche Daten im Commit entdeckt!\n');
    violations.forEach(v => {
      console.error(`  - Datei: ${v.file}`);
      console.error(`    Grund: ${v.reason}\n`);
    });
    console.error('Tipp zum Entfernen der Datei aus dem Commit:');
    console.error('  git reset HEAD <datei>\n');
    console.error('Verwende stattdessen Umgebungsvariablen in der .env-Datei.');
    process.exit(1);
  }

  console.log('✓ Secret-Check erfolgreich: Keine sensiblen Daten in den gestagten Dateien gefunden.');
  process.exit(0);
}

checkSecrets();
