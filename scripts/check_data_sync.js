// scripts/check_data_sync.js
const fs = require('fs');
const path = require('path');

const projectsDataFile = path.resolve(__dirname, '..', 'assets', 'js', 'projects_data.js');
const projectsJsonFile = path.resolve(__dirname, '..', 'assets', 'data', 'projects.json');

if (!fs.existsSync(projectsDataFile) || !fs.existsSync(projectsJsonFile)) {
  console.error('❌ Data files missing! Run `npm run generate-data` first.');
  process.exit(1);
}

try {
  const jsonContent = fs.readFileSync(projectsJsonFile, 'utf-8');
  const jsContent = fs.readFileSync(projectsDataFile, 'utf-8');
  
  const parsedJson = JSON.parse(jsonContent);
  const jsMatch = jsContent.match(/window\.projectsData\s*=\s*([\s\S]+?);/);
  
  if (!jsMatch) {
    console.error('❌ Invalid projects_data.js format');
    process.exit(1);
  }
  
  const parsedJs = JSON.parse(jsMatch[1]);

  if (JSON.stringify(parsedJson) !== JSON.stringify(parsedJs)) {
    console.error('❌ Mismatch between projects.json and projects_data.js!');
    process.exit(1);
  }

  console.log(`✅ Data sync check passed! (${parsedJson.length} projects synced successfully)`);
  process.exit(0);
} catch (e) {
  console.error('❌ Error checking data sync:', e.message);
  process.exit(1);
}
