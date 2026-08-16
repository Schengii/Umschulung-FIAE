// --- AUTOMATED REGRESSION TEST SUITE ---

const fs = require('fs');
const path = require('path');

// Mock browser globals for Node env
global.window = global;
global.document = {
  querySelectorAll: () => [],
  activeElement: { tagName: 'BODY' },
  getElementById: () => null
};

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

console.log("🚀 Starte BurgenGame Regressionstests...\n");

// Test 1: Noise Generator Check
try {
  const noiseCode = fs.readFileSync(path.join(__dirname, '../js/utils/noise.js'), 'utf8');
  eval(noiseCode);
  const gen = new PerlinNoise(42);
  const val = gen.get(5, 5);
  assert(val >= 0 && val <= 1, `Perlin Noise Wert (${val.toFixed(3)}) liegt im Bereich [0, 1]`);
} catch(e) {
  assert(false, "Perlin Noise Generator Absturz: " + e.message);
}

// Test 2: Building Config Validity
try {
  let configCode = fs.readFileSync(path.join(__dirname, '../js/core/config.js'), 'utf8');
  configCode = configCode.replace(/^const /gm, 'var ').replace(/^let /gm, 'var ');
  eval(configCode);
  assert(typeof BUILDINGS_CONFIG !== 'undefined', "BUILDINGS_CONFIG ist definiert");
  assert(typeof TROOPS_CONFIG !== 'undefined', "TROOPS_CONFIG ist definiert");
  assert(BUILDINGS_CONFIG.keep.levels[1].cost.wood >= 0, "Burgfried Stufe 1 hat valide Holzkosten");
} catch(e) {
  assert(false, "Config Test Fehler: " + e.message);
}

// Test 3: Reactive Proxy Engine Test
try {
  const proxyCode = fs.readFileSync(path.join(__dirname, '../js/core/reactive_state.js'), 'utf8');
  eval(proxyCode);
  const state = { resources: { gold: 100 } };
  const rState = new ReactiveState(state);
  let updatedVal = 0;
  rState.subscribe('resources.gold', (newVal) => { updatedVal = newVal; });
  rState.state.resources.gold = 250;
  assert(updatedVal === 250, "Reactive Proxy schlägt Subscriber an (250 Gold)");
} catch(e) {
  assert(false, "Reactive State Test Fehler: " + e.message);
}

console.log(`\n📊 Testergebnisse: ${testsPassed} bestanden, ${testsFailed} fehlgeschlagen.`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("🎉 Alle Tests erfolgreich abgeschlossen!");
}
