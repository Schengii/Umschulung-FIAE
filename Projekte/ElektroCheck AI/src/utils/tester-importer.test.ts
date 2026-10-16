import { describe, it, expect } from 'vitest';
import { parseTesterFile } from './tester-importer';

describe('tester-importer', () => {
  it('Test 1: Benning IT 130 CSV Sample', () => {
    const benningSample = `GERÄT: BENNING IT 130;DATUM: 2026-09-15
    POS;NAME;RPE;RISO;TA;IDN;ZS;STATUS
    1;Steckdosen Büro;0.12;25.5;24;21.3;0.85;BESTANDEN
    2;Klimagerät;0.22;18.0;28;22.0;1.10;BESTANDEN
    3;Licht Flur;0.10;50.0;--;--;0.92;BESTANDEN`;

    const res1 = parseTesterFile(benningSample);
    expect(res1.deviceType === 'BENNING', 'Test 1 failed: Device should be BENNING').toBe(true);
    expect(res1.measurements.length === 3, 'Test 1 failed: 3 measurements expected').toBe(true);
    expect(res1.measurements[0].rPe === '0.12', 'Test 1 failed: R_PE 0.12 expected').toBe(true);
    expect(res1.measurements[0].rcdTripTimeMs === '24', 'Test 1 failed: ta 24 expected').toBe(true);
  });

  it('Test 2: Gossen Metrawatt Profitest Sample', () => {
    const gmcSample = `GMC-I PROFITEST MASTER;;;;;;
    Circuit;Objekt;R-Low;R-Ins;t-RCD;I-RCD;Zloop;Ergebnis
    F1;Heizung Werkstatt;0.15;12.0;26;21.0;0.75;GUT
    F2;Fehlertest;1.45;0.40;350;35.0;3.50;MANGELHAFT`;

    const res2 = parseTesterFile(gmcSample);
    expect(res2.deviceType === 'GOSSEN_METRAWATT', 'Test 2 failed: Device should be GOSSEN_METRAWATT').toBe(true);
    expect(res2.measurements[0].passed === true, 'Test 2 failed: First should pass').toBe(true);
    expect(res2.measurements[1].passed === false, 'Test 2 failed: Second should fail').toBe(true);
  });

  it('Test 3: Fluke 1664 FC Sample', () => {
    const flukeSample = `FLUKE 1664FC EXPORT
    Nr,Circuit,PE,R_ISO,TRIP_TIME,TRIP_CURRENT,ZS,Result
    1,Küche,0.18,30.0,22,20.5,0.80,PASS`;

    const res3 = parseTesterFile(flukeSample);
    expect(res3.deviceType === 'FLUKE', 'Test 3 failed: Device should be FLUKE').toBe(true);
    expect(res3.measurements[0].passed === true, 'Test 3 failed: Fluke measurement should pass').toBe(true);
  });

});
