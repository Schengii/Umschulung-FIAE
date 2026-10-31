import { describe, it, expect } from 'vitest';
import {
  encodeULEB128,
  decodeULEB128,
  buildDemoModule,
  parseWasmModule,
  i32Add,
  toHex,
  WASM_PAGE_SIZE,
  WASM_DRILL_QUESTIONS
} from './wasmBinaryEngine';

describe('wasmBinaryEngine', () => {
  it('kodiert und dekodiert LEB128 (Beispiel aus der DWARF-/Wasm-Literatur)', () => {
    expect(encodeULEB128(624485)).toEqual([0xe5, 0x8e, 0x26]);
    expect(encodeULEB128(0)).toEqual([0]);
    expect(encodeULEB128(127)).toEqual([0x7f]);
    expect(encodeULEB128(128)).toEqual([0x80, 0x01]);
    expect(decodeULEB128([0xe5, 0x8e, 0x26], 0)).toEqual({ value: 624485, length: 3 });
    expect(() => encodeULEB128(-1)).toThrow();
  });

  it('erzeugt ein Modul, das die Laufzeit validiert und ausführt', async () => {
    const bytes = buildDemoModule();
    expect(WebAssembly.validate(bytes)).toBe(true);
    const { instance } = await WebAssembly.instantiate(bytes);
    expect(instance.exports.add(2, 3)).toBe(5);
    expect(instance.exports.mul(6, 7)).toBe(42);
    expect(instance.exports.add(2147483647, 1)).toBe(-2147483648);
    expect(instance.exports.memory.buffer.byteLength).toBe(WASM_PAGE_SIZE);
  });

  it('zerlegt Präambel, Sektionen, Exporte und Speicher', () => {
    const info = parseWasmModule(buildDemoModule());
    expect(info.valid).toBe(true);
    expect(info.version).toBe(1);
    expect(info.sections.map((s) => s.name)).toEqual(['type', 'function', 'memory', 'export', 'code', 'custom']);
    expect(info.exports).toEqual([
      { name: 'add', kind: 'func', index: 0 },
      { name: 'mul', kind: 'func', index: 1 },
      { name: 'memory', kind: 'memory', index: 0 }
    ]);
    expect(info.memoryPages).toBe(1);
  });

  it('meldet beschädigte Module verständlich', () => {
    const bytes = buildDemoModule();
    const broken = Uint8Array.from(bytes);
    broken[1] = 0x00;
    expect(parseWasmModule(broken)).toMatchObject({ valid: false });
    expect(parseWasmModule(broken).error).toMatch(/Magic Number/);
    expect(parseWasmModule([0, 0x61]).error).toMatch(/Präambel/);
    const truncated = bytes.slice(0, bytes.length - 3);
    expect(parseWasmModule(truncated).valid).toBe(false);
  });

  it('rechnet i32 wie Wasm und liefert Hex', () => {
    expect(i32Add(2147483647, 1)).toBe(-2147483648);
    expect(toHex([0, 97, 115, 109])).toEqual(['00', '61', '73', '6d']);
  });

  it('hat eindeutige, gültige Drillfragen', () => {
    expect(new Set(WASM_DRILL_QUESTIONS.map((q) => q.id)).size).toBe(WASM_DRILL_QUESTIONS.length);
    for (const q of WASM_DRILL_QUESTIONS) expect(q.korrektIndex).toBeLessThan(q.optionen.length);
  });
});
