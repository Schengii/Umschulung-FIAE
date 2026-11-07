// @ts-check
/**
 * @file wasmBinaryEngine.js
 * Baut ein kleines, echtes WebAssembly-Modul Byte für Byte (add, mul, Speicher 1 Seite) und
 * zerlegt Wasm-Binärdateien in ihre Sektionen. Grundlage: WebAssembly Core Specification,
 * Binary Format – Modules (https://webassembly.github.io/spec/core/binary/modules.html).
 */

export const WASM_MAGIC = [0x00, 0x61, 0x73, 0x6d]; // "\0asm"
export const WASM_VERSION = [0x01, 0x00, 0x00, 0x00];
export const WASM_PAGE_SIZE = 65536; // 64 KiB je Speicherseite

/** @type {Record<number, string>} */
export const SECTION_NAMES = {
  0: 'custom', 1: 'type', 2: 'import', 3: 'function', 4: 'table', 5: 'memory', 6: 'global',
  7: 'export', 8: 'start', 9: 'element', 10: 'code', 11: 'data', 12: 'datacount', 13: 'tag'
};

/** @type {Record<number, string>} */
const EXPORT_KINDS = { 0: 'func', 1: 'table', 2: 'memory', 3: 'global', 4: 'tag' };

/**
 * Vorzeichenlose LEB128-Kodierung (Längen und Indizes im Wasm-Binärformat).
 * @param {number} value
 * @returns {number[]}
 */
export function encodeULEB128(value) {
  if (!Number.isInteger(value) || value < 0) throw new Error('Nur nicht negative ganze Zahlen');
  const out = [];
  let v = value;
  do {
    let byte = v & 0x7f;
    v = Math.floor(v / 128);
    if (v !== 0) byte |= 0x80;
    out.push(byte);
  } while (v !== 0);
  return out;
}

/**
 * @param {ArrayLike<number>} bytes
 * @param {number} offset
 * @returns {{ value: number, length: number }}
 */
export function decodeULEB128(bytes, offset) {
  let value = 0;
  let shift = 0;
  let i = offset;
  while (i < bytes.length) {
    const byte = bytes[i++];
    value += (byte & 0x7f) * 2 ** shift;
    if ((byte & 0x80) === 0) return { value, length: i - offset };
    shift += 7;
    if (shift > 35) break;
  }
  throw new Error(`Ungültiges LEB128 bei Byte ${offset}`);
}

/** @param {string} s */
const name = (s) => [...encodeULEB128(s.length), ...Array.from(s, (c) => c.charCodeAt(0))];
/** @param {number} id @param {number[]} payload */
const section = (id, payload) => [id, ...encodeULEB128(payload.length), ...payload];
/** @param {number[][]} items */
const vec = (items) => [...encodeULEB128(items.length), ...items.flat()];

/**
 * Das Beispielmodul entspricht inhaltlich diesem Rust-Code (rustc erzeugt für wasm32-unknown-unknown zusätzliche Sektionen):
 *   #[no_mangle] pub extern "C" fn add(a: i32, b: i32) -> i32 { a.wrapping_add(b) }
 *   #[no_mangle] pub extern "C" fn mul(a: i32, b: i32) -> i32 { a.wrapping_mul(b) }
 * @returns {Uint8Array}
 */
export function buildDemoModule() {
  const I32 = 0x7f;
  const typeSec = section(1, vec([[0x60, 2, I32, I32, 1, I32]])); // (i32, i32) -> i32
  const funcSec = section(3, vec([[0], [0]])); // zwei Funktionen vom Typ 0
  const memSec = section(5, vec([[0x00, 1]])); // Speicher: min. 1 Seite, ohne Maximum
  const exportSec = section(7, vec([[...name('add'), 0x00, 0], [...name('mul'), 0x00, 1], [...name('memory'), 0x02, 0]]));
  // Funktionsrumpf: 0 lokale Variablen, local.get 0, local.get 1, i32.add/i32.mul, end
  /** @param {number} op */
  const body = (op) => { const code = [0x00, 0x20, 0x00, 0x20, 0x01, op, 0x0b]; return [...encodeULEB128(code.length), ...code]; };
  const codeSec = section(10, vec([body(0x6a), body(0x6c)]));
  const custom = section(0, [...name('lernhinweis'), ...Array.from('IT-DevGame', (c) => c.charCodeAt(0))]);
  return new Uint8Array([...WASM_MAGIC, ...WASM_VERSION, ...typeSec, ...funcSec, ...memSec, ...exportSec, ...codeSec, ...custom]);
}

/**
 * @typedef {object} WasmSection
 * @property {number} id
 * @property {string} name
 * @property {number} start - Offset des Sektions-IDs
 * @property {number} payloadStart
 * @property {number} size - Länge der Nutzdaten in Byte
 */

/**
 * Zerlegt eine Wasm-Binärdatei (Präambel + Sektionen, Exporte und Speicher im Detail).
 * @param {ArrayLike<number>} bytes
 * @returns {{ valid: boolean, error?: string, version?: number, sections: WasmSection[], exports: Array<{ name: string, kind: string, index: number }>, memoryPages?: number }}
 */
export function parseWasmModule(bytes) {
  /** @type {WasmSection[]} */
  const sections = [];
  /** @type {Array<{ name: string, kind: string, index: number }>} */
  const exports = [];
  if (bytes.length < 8) return { valid: false, error: 'Zu kurz: Präambel (8 Byte) fehlt', sections, exports };
  for (let i = 0; i < 4; i++) {
    if (bytes[i] !== WASM_MAGIC[i]) return { valid: false, error: `Magic Number falsch an Byte ${i}: erwartet 0x${WASM_MAGIC[i].toString(16).padStart(2, '0')} („\\0asm“)`, sections, exports };
  }
  const version = bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24);
  if (version !== 1) return { valid: false, error: `Unbekannte Version ${version} (aktuell: 1)`, sections, exports, version };
  let memoryPages;
  let pos = 8;
  try {
    while (pos < bytes.length) {
      const start = pos;
      const id = bytes[pos++];
      const size = decodeULEB128(bytes, pos);
      pos += size.length;
      const payloadStart = pos;
      if (payloadStart + size.value > bytes.length) throw new Error(`Sektion ${id} ist länger als die Datei`);
      sections.push({ id, name: SECTION_NAMES[id] ?? `unbekannt (${id})`, start, payloadStart, size: size.value });
      if (id === 7) {
        let p = payloadStart;
        const count = decodeULEB128(bytes, p); p += count.length;
        for (let k = 0; k < count.value; k++) {
          const len = decodeULEB128(bytes, p); p += len.length;
          const exportName = String.fromCharCode(...Array.from({ length: len.value }, (_, j) => bytes[p + j])); p += len.value;
          const kind = bytes[p++];
          const index = decodeULEB128(bytes, p); p += index.length;
          exports.push({ name: exportName, kind: EXPORT_KINDS[kind] ?? `kind ${kind}`, index: index.value });
        }
      }
      if (id === 5) {
        let p = payloadStart;
        const count = decodeULEB128(bytes, p); p += count.length;
        if (count.value > 0) { p += 1; memoryPages = decodeULEB128(bytes, p).value; }
      }
      pos = payloadStart + size.value;
    }
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : String(e), version, sections, exports };
  }
  return { valid: true, version, sections, exports, memoryPages };
}

/**
 * i32-Addition wie in Wasm (Zweierkomplement, Überlauf schneidet ab) – zum Vergleich mit JavaScript.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function i32Add(a, b) {
  return (a + b) | 0;
}

/**
 * Hex-Darstellung (z. B. „00 61 73 6d“).
 * @param {ArrayLike<number>} bytes
 * @returns {string[]}
 */
export function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
}

export const WASM_DRILL_QUESTIONS = [
  {
    id: 'wasm_bin_1',
    frage: 'Woran erkennt eine Laufzeitumgebung, dass eine Datei ein WebAssembly-Binärmodul ist?',
    optionen: [
      'An der Dateiendung .wasm',
      'An den ersten vier Bytes 00 61 73 6D („\\0asm“), gefolgt von der Version 01 00 00 00',
      'Am MIME-Typ text/javascript',
      'An einer JSON-Kopfzeile mit dem Feld "wasm": true'
    ],
    korrektIndex: 1,
    erklaerung: 'Jedes Modul beginnt mit der Magic Number \\0asm und der Binärformat-Version 1 (WebAssembly Core Specification, Binary Format – Modules).'
  },
  {
    id: 'wasm_bin_2',
    frage: 'Wie groß ist eine Seite des linearen WebAssembly-Speichers?',
    optionen: ['4 KiB', '16 KiB', '64 KiB', '1 MiB'],
    korrektIndex: 2,
    erklaerung: 'Memory.grow() vergrößert in Seiten zu je 64 KiB. Danach ist der alte ArrayBuffer abgekoppelt und muss neu über memory.buffer geholt werden (MDN: WebAssembly.Memory).'
  },
  {
    id: 'wasm_bin_3',
    frage: 'Welche Aussage zum Verhältnis von WebAssembly und JavaScript ist richtig?',
    optionen: [
      'WebAssembly ersetzt JavaScript vollständig, auch für DOM-Zugriffe',
      'WebAssembly ergänzt JavaScript: Rechenintensive Teile laufen als Wasm, JavaScript lädt das Modul und greift aufs DOM zu',
      'WebAssembly läuft nur auf dem Server',
      'WebAssembly-Code wird im Browser als Quelltext interpretiert'
    ],
    korrektIndex: 1,
    erklaerung: 'MDN: WebAssembly ist „designed to complement and work alongside JavaScript“. Ein direkter DOM-Zugriff aus Wasm ist nicht vorgesehen; das geht über importierte JS-Funktionen.'
  },
  {
    id: 'wasm_bin_4',
    frage: 'Eine exportierte Wasm-Funktion add(i32, i32) wird mit 2147483647 und 1 aufgerufen. Was kommt heraus?',
    optionen: ['2147483648', '-2147483648 (Überlauf im Zweierkomplement)', 'Ein RangeError', 'NaN'],
    korrektIndex: 1,
    erklaerung: 'i32.add rechnet modulo 2^32. Der größte i32-Wert plus 1 ergibt den kleinsten (−2.147.483.648). JavaScript-Zahlen würden 2.147.483.648 liefern.'
  },
  {
    id: 'wasm_bin_5',
    frage: 'Mit welchem Befehl fügt man in Rust das Kompilierziel für WebAssembly ohne Betriebssystem hinzu?',
    optionen: [
      'npm install wasm32',
      'rustup target add wasm32-unknown-unknown',
      'cargo install webassembly',
      'rustc --emit=javascript'
    ],
    korrektIndex: 1,
    erklaerung: 'rustup target add wasm32-unknown-unknown, danach cargo build --target wasm32-unknown-unknown. Für die JavaScript-Anbindung wird oft wasm-bindgen verwendet (The rustc book, Platform Support).'
  },
  {
    id: 'wasm_bin_6',
    frage: 'In welcher Sektion eines Wasm-Moduls stehen die Namen, unter denen JavaScript Funktionen aufrufen kann?',
    optionen: ['type (1)', 'function (3)', 'export (7)', 'code (10)'],
    korrektIndex: 2,
    erklaerung: 'Die Export-Sektion (ID 7) ordnet Namen wie „add“ einer Funktion, einem Speicher, einer Tabelle oder einer globalen Variable zu. Die Funktionsrümpfe stehen in der Code-Sektion (ID 10).'
  }
];
