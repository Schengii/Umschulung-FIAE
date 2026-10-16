export interface BasicDguvStatus {
  passed: boolean;
  message: string;
  details: string[];
}

interface Limit {
  label: string;
  unit: string;
  value: string;
  kind: "max" | "min";
  limit: number;
}

/**
 * Schnelle Bewertung der Handeingaben im Diagnose-Tab (R_PE ≤ 0,3 Ω, R_ISO ≥ 1,0 MΩ, I_leak ≤ 3,5 mA).
 * Die vollständige Bewertung nach Schutzklasse liegt in dguv-evaluator.ts.
 */
export function evaluateBasicDguv(input: { rPe: string; rIso: string; iLeak: string }): BasicDguvStatus {
  const checks: Limit[] = [
    { label: "R_PE", unit: "Ω", value: input.rPe, kind: "max", limit: 0.3 },
    { label: "R_ISO", unit: "MΩ", value: input.rIso, kind: "min", limit: 1.0 },
    { label: "Ableitstrom", unit: "mA", value: input.iLeak, kind: "max", limit: 3.5 },
  ];

  const details: string[] = [];
  let passed = true;
  let hasAny = false;

  for (const check of checks) {
    if (!check.value.trim()) continue;
    hasAny = true;
    const val = parseFloat(check.value.replace(",", "."));
    // Ältere Beschriftung bei ungültigen Werten: "I_leak" statt "Ableitstrom"
    const invalidLabel = check.label === "Ableitstrom" ? "I_leak" : check.label;

    if (isNaN(val)) {
      details.push(`${invalidLabel}: Ungültiger Wert`);
      passed = false;
    } else if (check.kind === "max") {
      const ok = val <= check.limit;
      details.push(ok
        ? `${check.label}: ${val} ${check.unit} (≤ ${check.limit} ${check.unit}) ✅`
        : `${check.label}: ${val} ${check.unit} (> ${check.limit} ${check.unit} Grenzwert) ❌`);
      if (!ok) passed = false;
    } else {
      const ok = val >= check.limit;
      details.push(ok
        ? `${check.label}: ${val} ${check.unit} (≥ ${check.limit.toFixed(1)} ${check.unit}) ✅`
        : `${check.label}: ${val} ${check.unit} (< ${check.limit.toFixed(1)} ${check.unit} Grenzwert) ❌`);
      if (!ok) passed = false;
    }
  }

  if (!hasAny) {
    return { passed: true, message: "Keine Messdaten eingetragen", details: [] };
  }
  return { passed, message: passed ? "BESTANDEN" : "NICHT BESTANDEN", details };
}
