/**
 * IEEE-754 Floating Point & Computer Architecture Utilities
 * Single (32-bit), Double (64-bit), Two's Complement & Karnaugh-Veitch Minimizer
 */

export function float32ToBits(value) {
  const floatArr = new Float32Array(1);
  floatArr[0] = Number(value);
  const uintArr = new Uint32Array(floatArr.buffer);
  const uintVal = uintArr[0];
  
  const bitString = uintVal.toString(2).padStart(32, '0');
  const signBit = bitString[0];
  const exponentBits = bitString.slice(1, 9);
  const mantissaBits = bitString.slice(9);
  
  const exponentInt = parseInt(exponentBits, 2);
  const unbiasedExponent = exponentInt - 127;
  
  let classification = 'Normalisiert';
  if (exponentInt === 0 && mantissaBits === '0'.repeat(23)) {
    classification = signBit === '0' ? '+0 (Positiv Null)' : '-0 (Negativ Null)';
  } else if (exponentInt === 0) {
    classification = 'Subnormal (Denormalisiert)';
  } else if (exponentInt === 255 && mantissaBits === '0'.repeat(23)) {
    classification = signBit === '0' ? '+Infinity' : '-Infinity';
  } else if (exponentInt === 255) {
    classification = 'NaN (Not a Number)';
  }

  const hexString = '0x' + uintVal.toString(16).toUpperCase().padStart(8, '0');

  return {
    rawBits: bitString,
    signBit,
    exponentBits,
    mantissaBits,
    exponentInt,
    unbiasedExponent,
    classification,
    hexString,
    decimalValue: floatArr[0]
  };
}

export function bitsToFloat32(bitString) {
  const cleanBits = bitString.replace(/[^01]/g, '').slice(0, 32).padEnd(32, '0');
  const uintVal = parseInt(cleanBits, 2);
  const uintArr = new Uint32Array([uintVal]);
  const floatArr = new Float32Array(uintArr.buffer);
  
  const signBit = cleanBits[0];
  const exponentBits = cleanBits.slice(1, 9);
  const mantissaBits = cleanBits.slice(9);
  const exponentInt = parseInt(exponentBits, 2);
  const unbiasedExponent = exponentInt - 127;

  let classification = 'Normalisiert';
  if (exponentInt === 0 && mantissaBits === '0'.repeat(23)) {
    classification = signBit === '0' ? '+0 (Positiv Null)' : '-0 (Negativ Null)';
  } else if (exponentInt === 0) {
    classification = 'Subnormal (Denormalisiert)';
  } else if (exponentInt === 255 && mantissaBits === '0'.repeat(23)) {
    classification = signBit === '0' ? '+Infinity' : '-Infinity';
  } else if (exponentInt === 255) {
    classification = 'NaN (Not a Number)';
  }

  const hexString = '0x' + uintVal.toString(16).toUpperCase().padStart(8, '0');

  return {
    rawBits: cleanBits,
    signBit,
    exponentBits,
    mantissaBits,
    exponentInt,
    unbiasedExponent,
    classification,
    hexString,
    decimalValue: floatArr[0]
  };
}

export function intToTwosComplement(value, bits = 8) {
  const minVal = -Math.pow(2, bits - 1);
  const maxVal = Math.pow(2, bits - 1) - 1;
  const num = Number(value);
  
  const isOverflow = num < minVal || num > maxVal;
  const clampedNum = Math.min(Math.max(num, minVal), maxVal);
  
  let rawUint;
  if (num >= 0) {
    rawUint = num & (Math.pow(2, bits) - 1);
  } else {
    rawUint = (Math.pow(2, bits) + num) & (Math.pow(2, bits) - 1);
  }
  
  const bitString = (rawUint >>> 0).toString(2).padStart(bits, '0');
  const hex = '0x' + (rawUint >>> 0).toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0');

  return {
    num,
    clampedNum,
    bitString,
    hex,
    isOverflow,
    minVal,
    maxVal
  };
}

export function solveKarnaughMap2Var(values = [0, 0, 0, 0]) {
  // values: [f(0,0), f(0,1), f(1,0), f(1,1)] -> [m0, m1, m2, m3]
  // Var A, B: m0: !A!B, m1: !AB, m2: A!B, m3: AB
  const [m0, m1, m2, m3] = values;
  const sum = m0 + m1 + m2 + m3;
  if (sum === 0) return '0';
  if (sum === 4) return '1';

  const terms = [];
  // 2er Blöcke
  if (m0 && m1 && m2 && m3) return '1';
  if (m0 && m1) terms.push('¬A');
  if (m2 && m3) terms.push('A');
  if (m0 && m2) terms.push('¬B');
  if (m1 && m3) terms.push('B');

  if (terms.length > 0) {
    // Redundanzen filtern
    if (terms.includes('¬A') && terms.includes('A')) return '1';
    return terms.join(' ∨ ');
  }

  // 1er Terme (Minterme)
  const minterms = [];
  if (m0) minterms.push('(¬A ∧ ¬B)');
  if (m1) minterms.push('(¬A ∧ B)');
  if (m2) minterms.push('(A ∧ ¬B)');
  if (m3) minterms.push('(A ∧ B)');

  return minterms.join(' ∨ ');
}
