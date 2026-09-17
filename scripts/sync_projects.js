// scripts/sync_projects.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO_MAPPING = {
  'Finanzenportfolio': {
    url: 'https://github.com/Schengii/Finanzenportfolio.git',
    targetDir: 'Projekte/Finanzenportfolio',
    preserve: ['dist']
  },
  'Informatik-lernen': {
    url: 'https://github.com/Schengii/Informatik-lernen.git',
    targetDir: 'Projekte/Informatik-lernen'
  },
  'Minecraft': {
    url: 'https://github.com/Schengii/Minecraft.git',
    targetDir: 'Projekte/Minecraft',
    preserve: ['index.html']
  },
  'Sims': {
    url: 'https://github.com/Schengii/Sims.git',
    targetDir: 'Projekte/Sims',
    preserve: ['dist']
  },
  'EcoChef': {
    url: 'https://github.com/Schengii/eco-chef.git',
    targetDir: 'Projekte/EcoChef',
    preserve: ['www']
  }
};

const rootDir = path.resolve(__dirname, '..');

function copyRecursive(src, dest, ignoreList = [], preserveList = []) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoreList.includes(entry.name)) {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath, ignoreList);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function syncProject(projectName, config) {
  const targetFullPath = path.resolve(rootDir, config.targetDir);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `fiae-sync-${projectName}-`));

  console.log(`\n========================================`);
  console.log(`🔄 Synchronisiere: ${projectName}`);
  console.log(`   Quelle: ${config.url}`);
  console.log(`   Ziel:   ${config.targetDir}`);
  console.log(`========================================`);

  try {
    // Clone shallow repository
    console.log(`⏳ Klone neueste Änderungen...`);
    execSync(`git clone --depth 1 "${config.url}" "${tempDir}"`, {
      stdio: ['ignore', 'ignore', 'pipe']
    });

    // Check latest commit info in cloned repo
    const lastCommit = execSync(`git -C "${tempDir}" log -n 1 --format="%h - %s (%ci)"`, {
      encoding: 'utf-8'
    }).trim();
    console.log(`📌 Neueste Commit-Info: ${lastCommit}`);

    const preserveList = Array.from(new Set(['portfolio-metadata.json', ...(config.preserve || [])]));
    const preservedBackups = new Map();
    if (fs.existsSync(targetFullPath)) {
      for (const item of preserveList) {
        const itemPath = path.join(targetFullPath, item);
        if (fs.existsSync(itemPath)) {
          const backupPath = path.join(os.tmpdir(), `fiae-preserve-${projectName}-${item}`);
          console.log(`💾 Sichere: ${item}`);
          fs.cpSync(itemPath, backupPath, { recursive: true });
          preservedBackups.set(item, backupPath);
        }
      }
    }

    // Clean target directory contents except preserved
    if (fs.existsSync(targetFullPath)) {
      const existing = fs.readdirSync(targetFullPath);
      for (const file of existing) {
        if (preserveList.includes(file)) {
          continue;
        }
        const filePath = path.join(targetFullPath, file);
        fs.rmSync(filePath, { recursive: true, force: true });
      }
    } else {
      fs.mkdirSync(targetFullPath, { recursive: true });
    }

    // Copy new contents into target directory (excluding .git)
    copyRecursive(tempDir, targetFullPath, ['.git']);

    // Restore preserved directories/files if they were not in remote repo
    for (const [item, backupPath] of preservedBackups.entries()) {
      const targetItemPath = path.join(targetFullPath, item);
      if (!fs.existsSync(targetItemPath)) {
        console.log(`🔄 Stelle gesicherte Datei/Ordner wieder her: ${item}`);
        fs.cpSync(backupPath, targetItemPath, { recursive: true });
      }
      fs.rmSync(backupPath, { recursive: true, force: true });
    }

    console.log(`✅ ${projectName} erfolgreich aktualisiert!`);
  } catch (err) {
    console.error(`❌ Fehler bei ${projectName}:`, err.stderr ? err.stderr.toString() : err.message);
  } finally {
    // Clean up temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup error
    }
  }
}

async function main() {
  const specificProject = process.argv[2];
  const projectsToSync = specificProject
    ? { [specificProject]: REPO_MAPPING[specificProject] }
    : REPO_MAPPING;

  if (specificProject && !REPO_MAPPING[specificProject]) {
    console.error(`❌ Projekt "${specificProject}" nicht in der Mapping-Liste gefunden.`);
    console.log(`Verfügbare Projekte: ${Object.keys(REPO_MAPPING).join(', ')}`);
    process.exit(1);
  }

  for (const [name, config] of Object.entries(projectsToSync)) {
    await syncProject(name, config);
  }

  console.log(`\n========================================`);
  console.log(`📦 Aktualisiere Projektdaten für Portfolio...`);
  console.log(`========================================`);
  try {
    execSync('npm run generate-data', { cwd: rootDir, stdio: 'inherit' });
    execSync('npm run check-sync', { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.warn(`⚠️ Hinweis bei generate-data:`, err.message);
  }

  console.log(`\n🎉 Synchronisation abgeschlossen!`);
}

main();
