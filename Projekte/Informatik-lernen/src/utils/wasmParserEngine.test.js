import { describe, it, expect } from 'vitest';
import { readULEB128, parseWasm, generateHexDump } from './wasmParserEngine';

describe('WASM Parser Engine', () => {

  it('reads ULEB128 correctly (single byte)', () => {
    const buffer = new Uint8Array([0x05, 0xFF]);
    const { value, newOffset, length } = readULEB128(buffer, 0);
    expect(value).toBe(5);
    expect(newOffset).toBe(1);
    expect(length).toBe(1);
  });

  it('reads ULEB128 correctly (multi byte)', () => {
    // 624485 encoded in LEB128 is 0xE5 0x8E 0x26
    const buffer = new Uint8Array([0xE5, 0x8E, 0x26]);
    const { value, newOffset, length } = readULEB128(buffer, 0);
    expect(value).toBe(624485);
    expect(newOffset).toBe(3);
    expect(length).toBe(3);
  });

  it('detects invalid magic number', () => {
    const buffer = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x01, 0x00, 0x00, 0x00]);
    const res = parseWasm(buffer);
    expect(res.error).toBe('Invalid Magic Number');
  });

  it('detects buffer too small', () => {
    const buffer = new Uint8Array([0x00, 0x61, 0x73]); // only 3 bytes
    const res = parseWasm(buffer);
    expect(res.error).toBe('Buffer too small to contain WASM header');
  });

  it('parses valid header and a simple type section', () => {
    // Magic: 00 61 73 6d, Version: 01 00 00 00
    // Section ID 1 (Type), Size 4 (0x04), Body: 0x01 0x60 0x00 0x00
    const buffer = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 
      0x01, 0x00, 0x00, 0x00,
      0x01, 0x04, 0x01, 0x60, 0x00, 0x00
    ]);
    const res = parseWasm(buffer);
    expect(res.error).toBeNull();
    expect(res.sections.length).toBe(2); // Header + Type section
    
    const header = res.sections[0];
    expect(header.name).toBe('Magic Header & Version');
    expect(header.start).toBe(0);
    expect(header.end).toBe(8);
    
    const typeSection = res.sections[1];
    expect(typeSection.name).toBe('Type Section');
    expect(typeSection.size).toBe(4);
    expect(typeSection.start).toBe(8);
    expect(typeSection.end).toBe(14);
  });

  it('generates correct hex dump format', () => {
    const buffer = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x00, 0xff]);
    const lines = generateHexDump(buffer);
    
    expect(lines.length).toBe(1);
    expect(lines[0].address).toBe('00000000');
    expect(lines[0].hex[0]).toBe('48');
    expect(lines[0].hex[1]).toBe('65'); // 'e'
    expect(lines[0].ascii[0]).toBe('H');
    expect(lines[0].ascii[1]).toBe('e');
    expect(lines[0].ascii[5]).toBe('.'); // 0x00 is non-printable
    expect(lines[0].ascii[6]).toBe('.'); // 0xff is non-printable
  });
});
