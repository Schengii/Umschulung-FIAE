import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Zap, Play, Plus, Bug, CheckCircle2, Circle, Award } from 'lucide-react';
import { WASM_MODULES } from '../../data/wasmRustData';
import { buildDemoModule, parseWasmModule, toHex, i32Add, WASM_PAGE_SIZE, WASM_DRILL_QUESTIONS } from '../../utils/wasmBinaryEngine';
import LabDrillSection from '../Shared/LabDrillSection';
import SourceList from '../Shared/SourceList';

const XP = 50;
const SECTION_COLORS = {
  type: 'var(--accent-primary)', function: 'var(--accent-teal)', memory: 'var(--accent-amber)',
  export: 'var(--accent-purple)', code: 'var(--accent-rose)', custom: 'var(--accent-cyan)'
};
const SECTION_INFO = {
  type: 'Funktionssignaturen: hier eine, (i32, i32) → i32.',
  function: 'Ordnet jeder Funktion eine Signatur aus der Type-Sektion zu (add und mul nutzen Typ 0).',
  memory: 'Linearer Speicher: Mindestgröße in Seiten zu 64 KiB.',
  export: 'Namen, unter denen JavaScript zugreift: add, mul, memory.',
  code: 'Funktionsrümpfe als Stack-Maschine: local.get 0, local.get 1, i32.add, end.',
  custom: 'Frei verwendbare Daten (z. B. Debug-Namen); die Laufzeit ignoriert sie.'
};

const SOURCES = [
  { title: 'WebAssembly Core Specification – Binary Format: Modules', url: 'https://webassembly.github.io/spec/core/binary/modules.html', note: 'Magic Number, Version 1, Sektions-IDs 0–13' },
  { title: 'MDN – WebAssembly Concepts', url: 'https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts', note: 'Module, Memory, Table, Instance; Wasm ergänzt JavaScript' },
  { title: 'MDN – WebAssembly.Memory', url: 'https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Memory', note: 'Seiten zu 64 KiB, grow() koppelt den alten Buffer ab' },
  { title: 'The rustc book – wasm32-unknown-unknown', url: 'https://doc.rust-lang.org/rustc/platform-support/wasm32-unknown-unknown.html', note: 'rustup target add, Einschränkungen der Standardbibliothek, wasm-bindgen' },
  { title: 'Rust and WebAssembly Book', url: 'https://rustwasm.github.io/docs/book/', note: 'Einführung in wasm-bindgen/wasm-pack; laut Seite nicht mehr gepflegt' }
];

function Step({ done, children }) {
  return (
    <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: done ? 'var(--text-main)' : 'var(--text-muted)' }}>
      {done ? <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: 2 }} /> : <Circle size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
      <span>{children}</span>
    </li>
  );
}

export default function WasmRustLab({ onRewardXP }) {
  const moduleBytes = useMemo(() => buildDemoModule(), []);
  const [corrupt, setCorrupt] = useState(false);
  const bytes = useMemo(() => {
    if (!corrupt) return moduleBytes;
    const b = Uint8Array.from(moduleBytes);
    b[1] = 0x62; // „\0bsm“
    return b;
  }, [moduleBytes, corrupt]);
  const info = useMemo(() => parseWasmModule(bytes), [bytes]);
  const [selected, setSelected] = useState('export');
  const [a, setA] = useState(2147483647);
  const [b, setB] = useState(1);
  const [result, setResult] = useState(null);
  const [runError, setRunError] = useState('');
  const [pages, setPages] = useState(1);
  const instanceRef = useRef(null);
  const [goals, setGoals] = useState({ inspected: false, executed: false, overflow: false, grown: false, corrupted: false });
  const [xpClaimed, setXpClaimed] = useState(false);
  const allGoals = Object.values(goals).every(Boolean);

  useEffect(() => {
    let cancelled = false;
    WebAssembly.instantiate(moduleBytes)
      .then(({ instance }) => { if (!cancelled) instanceRef.current = instance; })
      .catch((e) => { if (!cancelled) setRunError(`Wasm konnte nicht geladen werden: ${e.message}`); });
    return () => { cancelled = true; };
  }, [moduleBytes]);

  const byteSection = useMemo(() => {
    const map = new Array(bytes.length).fill(null);
    for (const s of info.sections) for (let i = s.start; i < s.payloadStart + s.size; i++) map[i] = s.name;
    return map;
  }, [bytes, info]);

  const run = (fn) => {
    const inst = instanceRef.current;
    if (!inst) { setRunError('Modul wird noch geladen …'); return; }
    const x = Number(a) | 0;
    const y = Number(b) | 0;
    const wasm = inst.exports[fn](x, y);
    const js = fn === 'add' ? Number(a) + Number(b) : Number(a) * Number(b);
    setRunError('');
    setResult({ fn, x, y, wasm, js });
    setGoals((g) => ({ ...g, executed: true, overflow: g.overflow || wasm !== js }));
  };

  const grow = () => {
    const inst = instanceRef.current;
    if (!inst) return;
    inst.exports.memory.grow(1);
    setPages(inst.exports.memory.buffer.byteLength / WASM_PAGE_SIZE);
    setGoals((g) => ({ ...g, grown: true }));
  };

  const selectSection = (name) => {
    setSelected(name);
    setGoals((g) => ({ ...g, inspected: true }));
  };

  const toggleCorrupt = () => {
    setCorrupt((c) => !c);
    setGoals((g) => ({ ...g, corrupted: true }));
  };

  const claimXp = () => {
    if (xpClaimed || !allGoals) return;
    setXpClaimed(true);
    if (onRewardXP) onRewardXP(XP);
  };

  const demo = WASM_MODULES[0];
  const inputStyle = { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-main)', fontFamily: 'var(--font-code)' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-amber)' }}>
        <span className="badge badge-amber" style={{ marginBottom: '10px' }}>Softwareentwicklung · Vertiefung AP2</span>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 800, margin: '8px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Zap size={30} style={{ color: 'var(--accent-amber)' }} /> WebAssembly & Rust: vom Binärmodul zur Ausführung
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, lineHeight: 1.6 }}>
          Unten liegt ein echtes Wasm-Modul ({bytes.length} Byte). Du zerlegst es Byte für Byte, rufst seine Funktionen im Browser auf und siehst, wie sich i32-Arithmetik von JavaScript unterscheidet.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '22px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>Das Wichtigste in 60 Sekunden</h2>
        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          <li><strong style={{ color: 'var(--text-main)' }}>WebAssembly</strong> ist ein kompaktes Binärformat für eine Stack-Maschine. Browser übersetzen es in Maschinencode; es läuft neben JavaScript, nicht statt JavaScript.</li>
          <li>Rust, C/C++ oder Go kompilieren nach Wasm. In Rust: Ziel <code>wasm32-unknown-unknown</code>, oft mit <code>wasm-bindgen</code> für die JS-Anbindung.</li>
          <li>Ein <strong style={{ color: 'var(--text-main)' }}>Modul</strong> besteht aus Sektionen (Typen, Funktionen, Speicher, Exporte, Code). Eine <strong style={{ color: 'var(--text-main)' }}>Instanz</strong> ist das Modul samt Laufzeitzustand.</li>
          <li>Wasm kennt nur wenige Zahlentypen (i32, i64, f32, f64, v128). Strings oder Objekte liegen als Bytes im <strong style={{ color: 'var(--text-main)' }}>linearen Speicher</strong>, einem ArrayBuffer aus 64-KiB-Seiten.</li>
        </ul>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>1. Binär-Inspektor</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={toggleCorrupt} aria-pressed={corrupt}><Bug size={14} /> {corrupt ? 'Modul reparieren' : 'Byte 1 beschädigen'}</button>
        </div>
        <p aria-live="polite" style={{ fontSize: '0.88rem', margin: '0 0 12px', color: info.valid ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
          {info.valid ? `Gültiges Modul, Binärformat-Version ${info.version}, ${info.sections.length} Sektionen` : `Ungültig: ${info.error}`}
          {' · '}WebAssembly.validate(): {String(WebAssembly.validate(bytes))}
        </p>
        <div role="region" aria-label="Hex-Dump des Moduls" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', fontFamily: 'var(--font-code)', fontSize: '0.78rem', padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)', marginBottom: '14px' }}>
          {toHex(bytes).map((h, i) => {
            const sec = byteSection[i];
            const isPreamble = i < 8;
            const active = sec && sec === selected;
            return (
              <span key={i} title={isPreamble ? (i < 4 ? 'Magic Number' : 'Version') : `${sec}-Sektion, Byte ${i}`} style={{ padding: '2px 4px', borderRadius: '4px', color: 'var(--text-main)', border: `1px solid ${isPreamble ? 'var(--text-dim)' : SECTION_COLORS[sec] || 'var(--border-color)'}`, background: active ? `color-mix(in srgb, ${SECTION_COLORS[sec]} 25%, transparent)` : 'transparent', fontWeight: isPreamble || active ? 700 : 400 }}>{h}</span>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }} role="group" aria-label="Sektion auswählen">
          {info.sections.map((s) => (
            <button key={`${s.id}-${s.start}`} type="button" className="btn btn-sm btn-ghost" aria-pressed={selected === s.name} onClick={() => selectSection(s.name)} style={{ border: `2px solid ${SECTION_COLORS[s.name] || 'var(--border-color)'}`, fontWeight: selected === s.name ? 800 : 500 }}>
              {s.name} (ID {s.id}, {s.size} B)
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          <strong style={{ color: 'var(--text-main)' }}>{selected}:</strong> {SECTION_INFO[selected] || 'Sektion des Moduls.'}
          {selected === 'export' && info.exports.length > 0 && <> Gefunden: {info.exports.map((e) => `${e.name} (${e.kind} ${e.index})`).join(', ')}.</>}
          {selected === 'memory' && info.memoryPages !== undefined && <> Mindestgröße: {info.memoryPages} Seite = {info.memoryPages * 64} KiB.</>}
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '8px' }}>Die ersten 8 Byte sind die Präambel: <code>00 61 73 6d</code> („\0asm“) und Version <code>01 00 00 00</code>. Längen sind als LEB128 kodiert (7 Bit pro Byte, oberstes Bit = „es folgt noch ein Byte“).</p>
      </div>

      <div className="grid-responsive" style={{ gap: '20px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-main)' }}>2. Exportierte Funktionen aufrufen</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label htmlFor="wasm-a" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>a (i32)</label>
              <input id="wasm-a" type="number" value={a} onChange={(e) => setA(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="wasm-b" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>b (i32)</label>
              <input id="wasm-b" type="number" value={b} onChange={(e) => setB(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => run('add')}><Play size={14} /> add(a, b)</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => run('mul')}><Play size={14} /> mul(a, b)</button>
          </div>
          <div aria-live="polite" style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)', minHeight: '3em' }}>
            {runError && <span style={{ color: 'var(--accent-rose)' }}>{runError}</span>}
            {result && (
              <>
                <div>Wasm: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-code)' }}>{result.fn}({result.x}, {result.y}) = {result.wasm}</strong></div>
                <div>JavaScript: <span style={{ fontFamily: 'var(--font-code)' }}>{result.js}</span></div>
                {result.wasm !== result.js && <div style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>Überlauf: i32 rechnet modulo 2³² (Zweierkomplement), JavaScript-Zahlen nicht. Probe: (a + b) | 0 = {i32Add(Number(a), Number(b))}</div>}
              </>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-main)' }}>3. Linearer Speicher</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>
            memory.buffer: <strong style={{ color: 'var(--text-main)' }}>{pages} Seite{pages === 1 ? '' : 'n'} = {(pages * WASM_PAGE_SIZE).toLocaleString('de-DE')} Byte</strong>
          </p>
          <div aria-hidden="true" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {Array.from({ length: Math.min(pages, 16) }, (_, i) => <div key={i} style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--accent-amber)', opacity: 0.35 + 0.65 * ((i + 1) / Math.min(pages, 16)) }} />)}
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={grow} disabled={pages >= 16}><Plus size={14} /> memory.grow(1)</button>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '10px', lineHeight: 1.5 }}>Nach grow() ist der alte ArrayBuffer abgekoppelt. Views wie new Uint8Array(memory.buffer) müssen neu erzeugt werden.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>Aufgaben</h2>
        <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
          <Step done={goals.inspected}>Wähle eine Sektion. Welche Bytes gehören zur Export-Sektion, und welche Namen stehen darin?</Step>
          <Step done={goals.executed}>Rufe add oder mul mit eigenen Werten auf.</Step>
          <Step done={goals.overflow}>Erzeuge einen Überlauf (z. B. 2147483647 + 1). Warum unterscheiden sich Wasm und JavaScript?</Step>
          <Step done={goals.grown}>Vergrößere den Speicher um eine Seite. Um wie viele Byte wächst er?</Step>
          <Step done={goals.corrupted}>Beschädige Byte 1. Welche Prüfung schlägt fehl?</Step>
        </ol>
        <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: '14px' }} disabled={!allGoals || xpClaimed} onClick={claimXp}>
          <Award size={14} /> {xpClaimed ? `${XP} XP erhalten` : `${XP} XP abholen`}
        </button>
      </div>

      <div className="grid-responsive" style={{ gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', minWidth: 0 }}>
          <span className="badge badge-amber" style={{ marginBottom: '10px' }}>Rust-Quelltext zu diesem Modul</span>
          <div className="code-window"><pre className="code-body"><code>{demo.rustCode}</code></pre></div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', minWidth: 0 }}>
          <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>JavaScript-Anbindung</span>
          <div className="code-window"><pre className="code-body"><code>{demo.jsIntegration}</code></pre></div>
        </div>
      </div>

      <LabDrillSection title="IHK-Drill: WebAssembly & Rust" questions={WASM_DRILL_QUESTIONS} />
      <SourceList sources={SOURCES} checkedOn="29.10.2026" />
    </div>
  );
}
