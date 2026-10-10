// @ts-check
/**
 * IHK WISO & AP2 Investitions- & Wirtschaftlichkeitsrechnung:
 * Kapitalwertmethode (Net Present Value - NPV), Interner Zinsfuß (IRR / IZF),
 * Dynamische Amortisation (Discounted Payback Period), Profitabilitätsindex (PI)
 * und IHK Projektdokumentations-Export (AP2 Kosten-Nutzen-Analyse).
 */

/**
 * Berechnet die Annuität / den internen Zinsfuß (IRR) via Sekantenverfahren / Newton-Raphson
 * @param {number} i0 Anschaffungsauszahlung (t=0)
 * @param {number[]} cashflows Jährliche Cashflows (t=1..n)
 * @param {number} ln Liquidationserlös im Jahr n
 * @returns {number|null} IRR in Prozent oder null falls keine Konvergenz
 */
export function calculateInternalRateOfReturn(i0, cashflows, ln = 0) {
  if (i0 <= 0 || !cashflows || cashflows.length === 0) return null;

  // NPV-Funktion für Zinssatz r (als Dezimalzahl)
  /** @param {number} r */
  const npvFn = (r) => {
    let sum = 0;
    for (let t = 1; t <= cashflows.length; t++) {
      sum += cashflows[t - 1] / Math.pow(1 + r, t);
    }
    sum += ln / Math.pow(1 + r, cashflows.length);
    return sum - i0;
  };

  // Sekantenverfahren im Intervall [-0.5, 2.0]
  let r0 = 0.05;
  let r1 = 0.15;
  let f0 = npvFn(r0);
  let f1 = npvFn(r1);

  for (let iter = 0; iter < 100; iter++) {
    if (Math.abs(f1 - f0) < 1e-9) break;
    const r2 = r1 - f1 * (r1 - r0) / (f1 - f0);
    if (Math.abs(r2 - r1) < 1e-6) {
      const irrPercent = parseFloat((r2 * 100).toFixed(2));
      return isFinite(irrPercent) && irrPercent > -100 ? irrPercent : null;
    }
    r0 = r1;
    f0 = f1;
    r1 = r2;
    f1 = npvFn(r1);
  }

  const finalIrr = parseFloat((r1 * 100).toFixed(2));
  return isFinite(finalIrr) && finalIrr > -100 ? finalIrr : null;
}

/**
 * Umfassende dynamische Investitionsrechnung nach IHK-Standard
 * @param {Object} params
 * @param {number} [params.anschaffungsauszahlung] Anschaffungskosten I_0
 * @param {number} [params.kalkulationszinssatzPercent] Zins i in % (z. B. 8.0)
 * @param {number[]} [params.cashflows] Jährliche Cashflows R_t
 * @param {number} [params.liquidationserloes] Restwert L_n am Ende
 * @param {number} [params.betriebskostenProJahr] Jährliche Wartungs-/Betriebskosten
 * @param {number} [params.kosteneinsparungProJahr] Jährliche Einsparung gegenüber Altsystem
 */
export function calculateNetPresentValue({
  anschaffungsauszahlung = 100000,
  kalkulationszinssatzPercent = 8.0,
  cashflows = [30000, 35000, 40000, 30000],
  liquidationserloes = 10000,
  betriebskostenProJahr = 0,
  kosteneinsparungProJahr = 0
}) {
  const i0 = Math.max(0, Number(anschaffungsauszahlung) || 0);
  const ratePercent = Math.max(0, Number(kalkulationszinssatzPercent) || 0);
  const rate = ratePercent / 100;
  const ln = Math.max(0, Number(liquidationserloes) || 0);

  let sumBarwerte = 0;
  let kumulierterBarwert = 0;
  /** @type {number | null} */
  let dynamicPaybackPeriod = null; // Jahre bis kumulierter Barwert >= I0

  const cashflowDetails = cashflows.map((cfVal, idx) => {
    const t = idx + 1;
    const cf = Number(cfVal) || 0;
    const abzinsungsfaktor = 1 / Math.pow(1 + rate, t);
    const barwert = cf * abzinsungsfaktor;
    sumBarwerte += barwert;

    const vorKumuliert = kumulierterBarwert;
    kumulierterBarwert += barwert;

    // Dynamische Amortisationsdauer mit linearer Interpolation
    if (dynamicPaybackPeriod === null && kumulierterBarwert >= i0 && i0 > 0) {
      const restBedarf = i0 - vorKumuliert;
      const anteilJahr = barwert > 0 ? restBedarf / barwert : 0;
      dynamicPaybackPeriod = parseFloat(((t - 1) + anteilJahr).toFixed(2));
    }

    return {
      jahr: t,
      cashflow: cf,
      abzinsungsfaktor: parseFloat(abzinsungsfaktor.toFixed(4)),
      barwert: parseFloat(barwert.toFixed(2)),
      kumulierterBarwert: parseFloat(kumulierterBarwert.toFixed(2))
    };
  });

  const n = cashflows.length;
  const abzinsungsfaktorLn = n > 0 ? 1 / Math.pow(1 + rate, n) : 1;
  const barwertLn = ln * abzinsungsfaktorLn;
  sumBarwerte += barwertLn;

  // Falls Amortisation erst durch den Liquidationserlös erreicht wird
  if (dynamicPaybackPeriod === null && kumulierterBarwert + barwertLn >= i0 && i0 > 0) {
    const restBedarf = i0 - kumulierterBarwert;
    const anteil = barwertLn > 0 ? restBedarf / barwertLn : 0;
    dynamicPaybackPeriod = parseFloat((n - 1 + anteil).toFixed(2));
  }

  const kapitalwert = sumBarwerte - i0;
  const isProfitable = kapitalwert >= 0;

  // Profitabilitätsindex (PI) / Benefit-Cost-Ratio (BCR) = Barwert der Rückflüsse / Anschaffungsauszahlung
  const profitabilityIndex = i0 > 0 ? parseFloat((sumBarwerte / i0).toFixed(3)) : 0;

  // Annuität der Investition: Annuitätenfaktor a = (q^n * (q - 1)) / (q^n - 1) mit q = 1 + i
  let annuitaetenFaktor = 0;
  let annuitaet = 0;
  if (n > 0 && rate > 0) {
    const qPowN = Math.pow(1 + rate, n);
    annuitaetenFaktor = (qPowN * rate) / (qPowN - 1);
    annuitaet = parseFloat((kapitalwert * annuitaetenFaktor).toFixed(2));
  } else if (n > 0) {
    annuitaet = parseFloat((kapitalwert / n).toFixed(2));
  }

  // Interner Zinsfuß (IRR / IZF)
  const irrPercent = calculateInternalRateOfReturn(i0, cashflows, ln);

  return {
    anschaffungsauszahlung: i0,
    kalkulationszinssatzPercent: ratePercent,
    sumBarwerte: parseFloat(sumBarwerte.toFixed(2)),
    liquidationserloes: ln,
    barwertLn: parseFloat(barwertLn.toFixed(2)),
    kapitalwert: parseFloat(kapitalwert.toFixed(2)),
    isProfitable,
    cashflowDetails,
    dynamicPaybackPeriod,
    profitabilityIndex,
    annuitaet,
    internalRateOfReturn: irrPercent,
    betriebskostenProJahr,
    kosteneinsparungProJahr,
    recommendation: isProfitable
      ? `Die Investition ist vorteilhaft (Kapitalwert = +${kapitalwert.toFixed(2)} € >= 0 €). Das Kapital verzinst sich über dem Kalkulationszins von ${ratePercent}%.`
      : `Die Investition ist unvorteilhaft (Kapitalwert = ${kapitalwert.toFixed(2)} € < 0 €). Die Mindestverzinsung von ${ratePercent}% wird verfehlt.`
  };
}

/**
 * Erzeugt einen standardisierten Markdown-Bericht für den IHK-Projektdokumentations-Anhang (AP2 Kosten-Nutzen-Analyse)
 * @param {ReturnType<typeof calculateNetPresentValue>} npvResult
 * @param {string} projectName
 * @returns {string} Markdown-Dokument
 */
export function generateIhkEconomicMarkdown(npvResult, projectName = 'IT-Projekt Kosten-Nutzen-Analyse') {
  const tableRows = npvResult.cashflowDetails
    .map(r => `| Jahr ${r.jahr} | ${r.cashflow.toLocaleString('de-DE')} € | ${r.abzinsungsfaktor.toFixed(4)} | ${r.barwert.toLocaleString('de-DE')} € | ${r.kumulierterBarwert.toLocaleString('de-DE')} € |`)
    .join('\n');

  return `# IHK Projektdokumentation Anhang: Wirtschaftlichkeitsbetrachtung
## Projekt: ${projectName}
*Erstellt nach IHK Prüfungsverordnung AO 2020 (AP2 Teil A)*

### 1. Ausgangsparameter & Investitionsrahmen
- **Anschaffungsauszahlung ($I_0$):** ${npvResult.anschaffungsauszahlung.toLocaleString('de-DE')} €
- **Kalkulationszinssatz ($i$):** ${npvResult.kalkulationszinssatzPercent}% p.a.
- **Betrachtungszeitraum ($n$):** ${npvResult.cashflowDetails.length} Jahre
- **Kalkulierter Liquidationserlös ($L_n$):** ${npvResult.liquidationserloes.toLocaleString('de-DE')} € (Barwert: ${npvResult.barwertLn.toLocaleString('de-DE')} €)

### 2. Dynamische Diskontierungstabelle (Barwert-Ermittlung)
Formel: $C_0 = -I_0 + \\sum_{t=1}^{n} \\frac{R_t}{(1 + i)^t} + \\frac{L_n}{(1 + i)^n}$

| Periode | Einzahlungsüberschuss ($R_t$) | Abzinsungsfaktor ($\\frac{1}{(1+i)^t}$) | Barwert (Diskontiert) | Kumulierter Barwert |
| :--- | :--- | :--- | :--- | :--- |
| **t = 0 ($I_0$)** | -${npvResult.anschaffungsauszahlung.toLocaleString('de-DE')} € | 1.0000 | -${npvResult.anschaffungsauszahlung.toLocaleString('de-DE')} € | -${npvResult.anschaffungsauszahlung.toLocaleString('de-DE')} € |
${tableRows}
| **Restwert ($L_n$)** | +${npvResult.liquidationserloes.toLocaleString('de-DE')} € | ${(npvResult.barwertLn / (npvResult.liquidationserloes || 1)).toFixed(4)} | +${npvResult.barwertLn.toLocaleString('de-DE')} € | ${(npvResult.sumBarwerte).toLocaleString('de-DE')} € |

### 3. Kennzahlen-Übersicht & Investitionsurteil
- **Summe der diskontierten Barwerte:** ${npvResult.sumBarwerte.toLocaleString('de-DE')} €
- **Kapitalwert ($NPV$):** **${npvResult.kapitalwert >= 0 ? '+' : ''}${npvResult.kapitalwert.toLocaleString('de-DE')} €**
- **Profitabilitätsindex (PI):** ${npvResult.profitabilityIndex} (${npvResult.profitabilityIndex >= 1 ? 'Vorteilhaft (>= 1.0)' : 'Unrentabel (< 1.0)'})
- **Interner Zinsfuß (IRR / IZF):** ${npvResult.internalRateOfReturn !== null ? `${npvResult.internalRateOfReturn}%` : 'n/a'}
- **Dynamische Amortisationsdauer:** ${npvResult.dynamicPaybackPeriod !== null ? `${npvResult.dynamicPaybackPeriod} Jahre` : 'Keine Amortisation im Zeitraum'}
- **Jährliche Annuität:** ${npvResult.annuitaet.toLocaleString('de-DE')} € / Jahr

### 4. Kaufmännische Handlungsempfehlung
> **Fazit:** ${npvResult.recommendation}
> Die Investitionsrechnung belegt die wirtschaftliche Sinnhaftigkeit des Projekts im Rahmen der IHK-Kriterien.
`;
}
