import { describe, it, expect } from 'vitest';
import { evaluateDguvV3, calculateNextInspectionDate } from './dguv-evaluator';

describe('dguv-evaluator', () => {
  it('Test 1: SK_I pass case', () => {
    const test1 = evaluateDguvV3({
      protectionClass: 'SK_I',
      rPe: '0.2',
      rIso: '5.0',
      iLeak: '1.2',
    });
    expect(test1.passed === true, 'Test 1 failed: Should pass SK_I').toBe(true);
    expect(test1.status === 'BESTANDEN', 'Test 1 status failed').toBe(true);
  });

  it('Test 2: SK_I fail R_PE (> 0.3 Ohm)', () => {
    const test2 = evaluateDguvV3({
      protectionClass: 'SK_I',
      rPe: '0.45',
      rIso: '2.0',
      iLeak: '1.0',
    });
    expect(test2.passed === false, 'Test 2 failed: R_PE 0.45 should fail SK_I').toBe(true);
    expect(test2.status === 'NICHT BESTANDEN', 'Test 2 status failed').toBe(true);
  });

  it('Test 3: SK_I long cable allowance', () => {
    const test3 = evaluateDguvV3({
      protectionClass: 'SK_I',
      rPe: '0.4',
      cableLengthMeters: 15, // 15m cable allows 0.3 + 0.2 = 0.5 Ohm
      rIso: '2.0',
      iLeak: '1.0',
    });
    expect(test3.passed === true, 'Test 3 failed: R_PE 0.4 with 15m cable should pass').toBe(true);
  });

  it('Test 4: SK_II pass case (no R_PE needed, R_ISO >= 2.0 MOhm, I_Touch <= 0.5 mA)', () => {
    const test4 = evaluateDguvV3({
      protectionClass: 'SK_II',
      rIso: '3.5',
      iTouch: '0.1',
    });
    expect(test4.passed === true, 'Test 4 failed: SK_II valid data should pass').toBe(true);
  });

  it('Test 5: SK_II fail R_ISO (< 2.0 MOhm)', () => {
    const test5 = evaluateDguvV3({
      protectionClass: 'SK_II',
      rIso: '1.5',
      iTouch: '0.1',
    });
    expect(test5.passed === false, 'Test 5 failed: SK_II R_ISO 1.5 MOhm should fail').toBe(true);
  });

  it('Test 6: SK_III pass case (R_ISO >= 0.25 MOhm)', () => {
    const test6 = evaluateDguvV3({
      protectionClass: 'SK_III',
      rIso: '0.5',
    });
    expect(test6.passed === true, 'Test 6 failed: SK_III R_ISO 0.5 MOhm should pass').toBe(true);
  });

  it('Test 7: Heating element R_ISO lower threshold (0.3 MOhm)', () => {
    const test7 = evaluateDguvV3({
      protectionClass: 'SK_I',
      rPe: '0.15',
      rIso: '0.5',
      isHeatingElement: true,
      iLeak: '2.0',
    });
    expect(test7.passed === true, 'Test 7 failed: SK_I Heating element with 0.5 MOhm R_ISO should pass').toBe(true);
  });

  it('Test 8: Inspection date format MM/YYYY', () => {
    const nextDateStr = calculateNextInspectionDate(12);
    expect(/^\d{2}\/\d{4}$/.test(nextDateStr), 'Test 8 failed: Date format MM/YYYY expected').toBe(true);
  });

  it('Test 9: VDE 0100-600 ortsfeste Anlage pass case', () => {
    const test9 = evaluateDguvV3({
      protectionClass: 'INSTALLATION_VDE0100',
      rPe: '0.2',
      rIso: '25.0',
      rcdTripTimeMs: '28',
      rcdTripCurrentMa: '21',
      loopImpedanceZs: '0.85',
      mcbRatingA: 16,
      mcbChar: 'B',
    });
    expect(test9.passed === true, 'Test 9 failed: Valid VDE 0100 installation should pass').toBe(true);
    expect(test9.ruleChecks.length === 5, 'Test 9 rule checks count should be 5').toBe(true);
  });

  it('Test 10: VDE 0100-600 RCD failure (> 300 ms)', () => {
    const test10 = evaluateDguvV3({
      protectionClass: 'INSTALLATION_VDE0100',
      rcdTripTimeMs: '350',
    });
    expect(test10.passed === false, 'Test 10 failed: RCD trip time 350ms should fail').toBe(true);
  });

});
