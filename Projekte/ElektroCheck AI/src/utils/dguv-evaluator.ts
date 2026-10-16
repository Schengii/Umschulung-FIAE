export type ProtectionClass = 'SK_I' | 'SK_II' | 'SK_III' | 'INSTALLATION_VDE0100';

export interface DguvInputData {
  protectionClass: ProtectionClass;
  rPe?: string;          // Schutzleiterwiderstand in Ohm (nur SK I oder Schutzleiterdurchgängigkeit)
  cableLengthMeters?: number; // Leitungslänge in Metern (für R_PE Zuschlag)
  rIso?: string;         // Isolationswiderstand in MOhm
  isHeatingElement?: boolean; // Z.B. Wasserkocher, Kaffeemaschine mit Heizelement
  iLeak?: string;        // Schutzleiter-/Ableitstrom in mA (SK I)
  iTouch?: string;       // Berührungsstrom in mA (SK II)
  inspectionIntervalMonths?: number; // 6, 12, 24, 48 Monate
  // Erweiterung für ortsfeste Anlagen / Verteilungen (DIN VDE 0100-600 / 0105-100)
  rcdTripTimeMs?: string;    // RCD / FI Auslösezeit in ms (Grenzwert meist <= 300ms)
  rcdTripCurrentMa?: string; // RCD / FI Auslösestrom in mA (z.B. <= 30mA bei 30mA RCD)
  loopImpedanceZs?: string;  // Schleifenimpedanz Z_s in Ohm
  mcbRatingA?: number;       // Nennstrom LSS (z.B. 16A)
  mcbChar?: 'B' | 'C' | 'D'; // Charakteristik LSS
}

export interface DguvRuleCheck {
  name: string;
  value: string;
  limit: string;
  passed: boolean;
  message: string;
}

export interface DguvEvaluationResult {
  passed: boolean;
  status: 'BESTANDEN' | 'NICHT BESTANDEN' | 'KEINE MESSDATEN';
  protectionClass: ProtectionClass;
  ruleChecks: DguvRuleCheck[];
  details: string[];
  nextInspectionDateFormatted: string;
}

/**
 * Berechnet das Datum der nächsten DGUV V3 Prüfung
 */
export function calculateNextInspectionDate(intervalMonths: number = 12): string {
  const date = new Date();
  date.setMonth(date.getMonth() + intervalMonths);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
}

/**
 * Bewertet DGUV V3 / VDE 0701-0702 Messwerte streng nach Norm
 */
export function evaluateDguvV3(data: DguvInputData): DguvEvaluationResult {
  const ruleChecks: DguvRuleCheck[] = [];
  const details: string[] = [];
  let passed = true;

  const interval = data.inspectionIntervalMonths || 12;
  const nextDate = calculateNextInspectionDate(interval);

  const hasRPe = data.rPe !== undefined && data.rPe.trim() !== '';
  const hasRIso = data.rIso !== undefined && data.rIso.trim() !== '';
  const hasILeak = data.iLeak !== undefined && data.iLeak.trim() !== '';
  const hasITouch = data.iTouch !== undefined && data.iTouch.trim() !== '';
  const hasRcdTime = data.rcdTripTimeMs !== undefined && data.rcdTripTimeMs.trim() !== '';
  const hasRcdCurrent = data.rcdTripCurrentMa !== undefined && data.rcdTripCurrentMa.trim() !== '';
  const hasZs = data.loopImpedanceZs !== undefined && data.loopImpedanceZs.trim() !== '';

  const hasAnyData = hasRPe || hasRIso || hasILeak || hasITouch || hasRcdTime || hasRcdCurrent || hasZs;

  if (!hasAnyData) {
    return {
      passed: true,
      status: 'KEINE MESSDATEN',
      protectionClass: data.protectionClass,
      ruleChecks: [],
      details: ['Keine Messdaten eingetragen (optional)'],
      nextInspectionDateFormatted: nextDate,
    };
  }

  // Ortsfeste elektrische Anlagen & Stromkreise (DIN VDE 0100-600 / DIN VDE 0105-100)
  if (data.protectionClass === 'INSTALLATION_VDE0100') {
    // A) Schutzleiterdurchgängigkeit (Niederohmmessung R_PE)
    if (hasRPe) {
      const val = parseFloat(data.rPe!.replace(',', '.'));
      const maxAllowed = 1.0; // VDE 0100-600 Richtwert für Durchgängigkeit typ. < 1.0 Ohm
      const checkPassed = !isNaN(val) && val >= 0 && val <= maxAllowed;
      if (!checkPassed) passed = false;
      ruleChecks.push({
        name: 'Schutzleiterdurchgängigkeit (R_PE)',
        value: `${val} Ω`,
        limit: `≤ ${maxAllowed.toFixed(1)} Ω`,
        passed: checkPassed,
        message: checkPassed ? `Durchgängig (≤ ${maxAllowed.toFixed(1)} Ω)` : `Widerstand zu hoch (> ${maxAllowed.toFixed(1)} Ω)`,
      });
      details.push(`PE-Durchgängigkeit: ${val} Ω ${checkPassed ? '✅' : '❌'}`);
    }

    // B) Isolationswiderstand R_ISO (VDE 0100-600: >= 1.0 MOhm bei 500V Prüfspannung)
    if (hasRIso) {
      const val = parseFloat(data.rIso!.replace(',', '.'));
      const minAllowed = 1.0;
      const checkPassed = !isNaN(val) && val >= minAllowed;
      if (!checkPassed) passed = false;
      ruleChecks.push({
        name: 'Isolationswiderstand Anlage (R_ISO)',
        value: `${val} MΩ`,
        limit: `≥ ${minAllowed.toFixed(1)} MΩ`,
        passed: checkPassed,
        message: checkPassed ? `Passend (≥ ${minAllowed.toFixed(1)} MΩ)` : `Unterschritten (< ${minAllowed.toFixed(1)} MΩ)`,
      });
      details.push(`R_ISO Anlage: ${val} MΩ (Limit ≥ 1.0 MΩ) ${checkPassed ? '✅' : '❌'}`);
    }

    // C) RCD / FI Auslösezeit (t_a nach DIN VDE 0100-410: <= 300 ms für Standard-RCD)
    if (hasRcdTime) {
      const val = parseFloat(data.rcdTripTimeMs!.replace(',', '.'));
      const maxAllowed = 300;
      const checkPassed = !isNaN(val) && val >= 0 && val <= maxAllowed;
      if (!checkPassed) passed = false;
      ruleChecks.push({
        name: 'FI/RCD Auslösezeit (t_a)',
        value: `${val} ms`,
        limit: `≤ ${maxAllowed} ms`,
        passed: checkPassed,
        message: checkPassed ? `Rechtzeitig abgeschaltet (≤ ${maxAllowed} ms)` : `Abschaltzeit überschritten (> ${maxAllowed} ms)`,
      });
      details.push(`RCD Auslösezeit t_a: ${val} ms ${checkPassed ? '✅' : '❌'}`);
    }

    // D) RCD / FI Auslösestrom (I_delta N <= 30mA für Personenschutz)
    if (hasRcdCurrent) {
      const val = parseFloat(data.rcdTripCurrentMa!.replace(',', '.'));
      const maxAllowed = 30.0;
      const minAllowed = 15.0; // Soll zwischen 50% und 100% von I_deltaN auslösen
      const checkPassed = !isNaN(val) && val >= minAllowed && val <= maxAllowed;
      if (!checkPassed) passed = false;
      ruleChecks.push({
        name: 'FI/RCD Auslösestrom (I_ΔN)',
        value: `${val} mA`,
        limit: `15 - 30 mA`,
        passed: checkPassed,
        message: checkPassed ? `Normgerechte Auslösung (15-30 mA)` : `Außerhalb Normtoleranz (${val} mA)`,
      });
      details.push(`RCD Auslösestrom: ${val} mA ${checkPassed ? '✅' : '❌'}`);
    }

    // E) Schleifenimpedanz Z_s
    if (hasZs) {
      const val = parseFloat(data.loopImpedanceZs!.replace(',', '.'));
      const rating = data.mcbRatingA || 16;
      const char = data.mcbChar || 'B';
      const factor = char === 'C' ? 10 : (char === 'D' ? 20 : 5);
      const Ia = rating * factor;
      const maxZs = (0.8 * 230) / Ia; // Mit 0.8 Sicherheitsfaktor (VDE 0100-600)
      const checkPassed = !isNaN(val) && val > 0 && val <= maxZs;
      if (!checkPassed) passed = false;
      ruleChecks.push({
        name: `Schleifenimpedanz (Z_s für ${char}${rating})`,
        value: `${val} Ω`,
        limit: `≤ ${maxZs.toFixed(2)} Ω`,
        passed: checkPassed,
        message: checkPassed ? `Abschaltung gewährleistet (≤ ${maxZs.toFixed(2)} Ω)` : `Zu hoch für Schutzorgan (> ${maxZs.toFixed(2)} Ω)`,
      });
      details.push(`Schleifenimpedanz Z_s: ${val} Ω (Limit ≤ ${maxZs.toFixed(2)} Ω) ${checkPassed ? '✅' : '❌'}`);
    }

    return {
      passed,
      status: passed ? 'BESTANDEN' : 'NICHT BESTANDEN',
      protectionClass: data.protectionClass,
      ruleChecks,
      details,
      nextInspectionDateFormatted: nextDate,
    };
  }

  // 1. Schutzleiterwiderstand R_PE (nur für Schutzklasse I)
  if (data.protectionClass === 'SK_I') {
    if (hasRPe) {
      const val = parseFloat(data.rPe!.replace(',', '.'));
      if (isNaN(val) || val < 0) {
        ruleChecks.push({
          name: 'Schutzleiterwiderstand (R_PE)',
          value: data.rPe!,
          limit: '≤ 0.3 Ω (+0.1 Ω / 7.5m)',
          passed: false,
          message: 'Ungültiger Zahlenwert',
        });
        details.push('R_PE: Ungültiger Wert ❌');
        passed = false;
      } else {
        // VDE 0701-0702: Basis 0.3 Ohm + 0.1 Ohm je 7.5m Leitungslänge, max. 1.0 Ohm
        const length = data.cableLengthMeters || 0;
        const extraLength = Math.max(0, length - 5);
        const maxAllowed = Math.min(1.0, 0.3 + Math.ceil(extraLength / 7.5) * 0.1);

        const checkPassed = val <= maxAllowed;
        if (!checkPassed) passed = false;

        ruleChecks.push({
          name: 'Schutzleiterwiderstand (R_PE)',
          value: `${val} Ω`,
          limit: `≤ ${maxAllowed.toFixed(1)} Ω`,
          passed: checkPassed,
          message: checkPassed
            ? `Passend (≤ ${maxAllowed.toFixed(1)} Ω)`
            : `Überschritten (> ${maxAllowed.toFixed(1)} Ω)`,
        });
        details.push(
          `R_PE: ${val} Ω (Grenzwert: ≤ ${maxAllowed.toFixed(1)} Ω) ${checkPassed ? '✅' : '❌'}`
        );
      }
    } else {
      ruleChecks.push({
        name: 'Schutzleiterwiderstand (R_PE)',
        value: 'Fehlt',
        limit: '≤ 0.3 Ω',
        passed: false,
        message: 'Pflichtmessung für Schutzklasse I fehlt',
      });
      details.push('R_PE Messung fehlt für Schutzklasse I ❌');
      passed = false;
    }
  }

  // 2. Isolationswiderstand R_ISO (SK I, SK II, SK III)
  if (hasRIso) {
    const val = parseFloat(data.rIso!.replace(',', '.'));
    if (isNaN(val) || val < 0) {
      ruleChecks.push({
        name: 'Isolationswiderstand (R_ISO)',
        value: data.rIso!,
        limit: 'Gültig',
        passed: false,
        message: 'Ungültiger Zahlenwert',
      });
      details.push('R_ISO: Ungültiger Wert ❌');
      passed = false;
    } else {
      let minAllowed = 1.0; // Default SK I
      if (data.protectionClass === 'SK_I') {
        minAllowed = data.isHeatingElement ? 0.3 : 1.0;
      } else if (data.protectionClass === 'SK_II') {
        minAllowed = 2.0;
      } else if (data.protectionClass === 'SK_III') {
        minAllowed = 0.25;
      }

      const checkPassed = val >= minAllowed;
      if (!checkPassed) passed = false;

      ruleChecks.push({
        name: 'Isolationswiderstand (R_ISO)',
        value: `${val} MΩ`,
        limit: `≥ ${minAllowed} MΩ`,
        passed: checkPassed,
        message: checkPassed ? `Passend (≥ ${minAllowed} MΩ)` : `Unterschritten (< ${minAllowed} MΩ)`,
      });
      details.push(
        `R_ISO: ${val} MΩ (Grenzwert: ≥ ${minAllowed} MΩ) ${checkPassed ? '✅' : '❌'}`
      );
    }
  }

  // 3. Schutzleiter-/Ableitstrom I_PE (SK I)
  if (data.protectionClass === 'SK_I' && hasILeak) {
    const val = parseFloat(data.iLeak!.replace(',', '.'));
    if (isNaN(val) || val < 0) {
      ruleChecks.push({
        name: 'Schutzleiterstrom (I_PE)',
        value: data.iLeak!,
        limit: '≤ 3.5 mA',
        passed: false,
        message: 'Ungültiger Zahlenwert',
      });
      details.push('I_PE Ableitstrom: Ungültiger Wert ❌');
      passed = false;
    } else {
      const maxAllowed = 3.5;
      const checkPassed = val <= maxAllowed;
      if (!checkPassed) passed = false;

      ruleChecks.push({
        name: 'Schutzleiterstrom (I_PE)',
        value: `${val} mA`,
        limit: `≤ ${maxAllowed} mA`,
        passed: checkPassed,
        message: checkPassed ? `Passend (≤ ${maxAllowed} mA)` : `Überschritten (> ${maxAllowed} mA)`,
      });
      details.push(
        `Ableitstrom I_PE: ${val} mA (Grenzwert: ≤ ${maxAllowed} mA) ${checkPassed ? '✅' : '❌'}`
      );
    }
  }

  // 4. Berührungsstrom I_B (SK II)
  if (data.protectionClass === 'SK_II' && hasITouch) {
    const val = parseFloat(data.iTouch!.replace(',', '.'));
    if (isNaN(val) || val < 0) {
      ruleChecks.push({
        name: 'Berührungsstrom (I_B)',
        value: data.iTouch!,
        limit: '≤ 0.5 mA',
        passed: false,
        message: 'Ungültiger Zahlenwert',
      });
      details.push('Berührungsstrom: Ungültiger Wert ❌');
      passed = false;
    } else {
      const maxAllowed = 0.5;
      const checkPassed = val <= maxAllowed;
      if (!checkPassed) passed = false;

      ruleChecks.push({
        name: 'Berührungsstrom (I_B)',
        value: `${val} mA`,
        limit: `≤ ${maxAllowed} mA`,
        passed: checkPassed,
        message: checkPassed ? `Passend (≤ ${maxAllowed} mA)` : `Überschritten (> ${maxAllowed} mA)`,
      });
      details.push(
        `Berührungsstrom I_B: ${val} mA (Grenzwert: ≤ ${maxAllowed} mA) ${checkPassed ? '✅' : '❌'}`
      );
    }
  }

  return {
    passed,
    status: passed ? 'BESTANDEN' : 'NICHT BESTANDEN',
    protectionClass: data.protectionClass,
    ruleChecks,
    details,
    nextInspectionDateFormatted: nextDate,
  };
}
