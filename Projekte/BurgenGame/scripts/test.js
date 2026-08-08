// --- Cross-Platform Syntax & Integration Test Runner for BurgenGame ---
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('----------------------------------------------------');
console.log('🛡️  BurgenGame - Starting Automated Suite & Diagnostics...');
console.log('----------------------------------------------------');

let totalFilesChecked = 0;
let errorsFound = 0;

function getAllJsFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllJsFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.js')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const rootDir = path.resolve(__dirname, '..');
const jsFiles = [
  path.join(rootDir, 'service-worker.js'),
  ...getAllJsFiles(path.join(rootDir, 'js'))
];

console.log(`\n🔍 Checking JS syntax across ${jsFiles.length} JavaScript files...\n`);

jsFiles.forEach((filePath) => {
  const relPath = path.relative(rootDir, filePath);
  try {
    execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
    totalFilesChecked++;
    console.log(`  ✅ OK: ${relPath}`);
  } catch (err) {
    errorsFound++;
    console.error(`  ❌ Syntax Error in ${relPath}:\n`, err.stderr.toString());
  }
});

console.log('\n----------------------------------------------------');
if (errorsFound > 0) {
  console.error(`❌ Validation Failed: ${errorsFound} syntax error(s) detected across ${totalFilesChecked} files.`);
  process.exit(1);
} else {
  console.log(`🎉 Validation Passed! All ${totalFilesChecked} JavaScript files compiled cleanly with 0 syntax errors.`);
  console.log('----------------------------------------------------');
  process.exit(0);
}
