/**
 * WebAssembly Parser Engine
 * Parses raw WASM bytecode (Uint8Array) into structured sections and visualizable hex dumps.
 * Identifiziert Sections: Type (1), Import (2), Function (3), Memory (5), Export (7), Code (10), Data (11).
 */

const SECTION_NAMES = {
  0: 'Custom',
  1: 'Type',
  2: 'Import',
  3: 'Function',
  4: 'Table',
  5: 'Memory',
  6: 'Global',
  7: 'Export',
  8: 'Start',
  9: 'Element',
  10: 'Code',
  11: 'Data',
  12: 'DataCount',
};

// Reads an Unsigned LEB128 from buffer
export function readULEB128(buffer, offset) {
  let result = 0;
  let shift = 0;
  let currentOffset = offset;
  while (currentOffset < buffer.length) {
    const byte = buffer[currentOffset++];
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return { value: result, newOffset: currentOffset, length: currentOffset - offset };
}

// Parses full WASM buffer
export function parseWasm(buffer) {
  const sections = [];
  let offset = 0;
  
  if (buffer.length < 8) {
    return { error: 'Buffer too small to contain WASM header', sections };
  }

  // 1. Check Magic Number: 0x00 0x61 0x73 0x6D (\0asm)
  const magic = Array.from(buffer.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ');
  if (magic !== '00 61 73 6d') {
    return { error: 'Invalid Magic Number', sections };
  }
  
  sections.push({
    id: 'header',
    name: 'Magic Header & Version',
    start: 0,
    end: 8,
    bytes: buffer.slice(0, 8),
    details: 'Magic: \\0asm, Version: 1'
  });
  
  offset = 8;
  
  // 2. Parse Sections
  while (offset < buffer.length) {
    const sectionId = buffer[offset];
    const sectionName = SECTION_NAMES[sectionId] || `Unknown(${sectionId})`;
    const startOffset = offset;
    offset++;
    
    // Read LEB128 size
    const leb = readULEB128(buffer, offset);
    const sectionSize = leb.value;
    offset = leb.newOffset;
    
    // Check bounds
    if (offset + sectionSize > buffer.length) {
      sections.push({
        id: `section_${sectionId}`,
        name: `${sectionName} Section (Incomplete)`,
        start: startOffset,
        end: buffer.length,
        bytes: buffer.slice(startOffset, buffer.length),
        details: `Error: Section size ${sectionSize} exceeds buffer`
      });
      break;
    }
    
    const endOffset = offset + sectionSize;
    sections.push({
      id: `section_${sectionId}_${startOffset}`,
      name: `${sectionName} Section`,
      start: startOffset,
      end: endOffset,
      size: sectionSize,
      bytes: buffer.slice(startOffset, endOffset),
      details: `Payload Size: ${sectionSize} bytes`
    });
    
    offset = endOffset;
  }
  
  return { error: null, sections, byteLength: buffer.length };
}

// Generates a Hex Dump from buffer
export function generateHexDump(buffer) {
  const lines = [];
  for (let i = 0; i < buffer.length; i += 16) {
    const chunk = buffer.slice(i, i + 16);
    const address = i.toString(16).padStart(8, '0');
    
    const hexParts = [];
    const asciiParts = [];
    
    for (let j = 0; j < 16; j++) {
      if (j < chunk.length) {
        const byte = chunk[j];
        hexParts.push(byte.toString(16).padStart(2, '0'));
        // printable ASCII range 32-126
        if (byte >= 32 && byte <= 126) {
          asciiParts.push(String.fromCharCode(byte));
        } else {
          asciiParts.push('.');
        }
      } else {
        hexParts.push('  ');
        asciiParts.push(' ');
      }
    }
    
    lines.push({
      address,
      hex: hexParts,
      ascii: asciiParts,
      startOffset: i
    });
  }
  return lines;
}
