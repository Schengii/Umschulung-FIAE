/**
 * IHK WISO Darlehensarten & Kreditsicherheiten Engine
 * Computes amortization schedules for Annuity, Installment (Ratendarlehen),
 * and Fixed-Maturity (Fälligkeitsdarlehen) loans, and classifies collateral types.
 */

export function calculateLoanSchedule({
  darlehensbetrag = 100000,
  zinssatzPercent = 5.0,
  laufzeitJahre = 5,
  darlehensTyp = 'ANNUITY' // 'ANNUITY' | 'INSTALLMENT' | 'FIXED_MATURITY'
}) {
  const k0 = Math.max(1000, darlehensbetrag);
  const p = Math.max(0.1, zinssatzPercent) / 100;
  const n = Math.max(1, laufzeitJahre);

  const schedule = [];
  let restschuld = k0;
  let gesamtZinsen = 0;
  let gesamtKapitaldienst = 0;

  if (darlehensTyp === 'ANNUITY') {
    const q = 1 + p;
    const annuitaet = k0 * ((Math.pow(q, n) * (q - 1)) / (Math.pow(q, n) - 1));

    for (let jahr = 1; jahr <= n; jahr++) {
      const zinsen = restschuld * p;
      let tilgung = annuitaet - zinsen;
      if (jahr === n || tilgung > restschuld) {
        tilgung = restschuld;
      }
      const kapitaldienst = zinsen + tilgung;
      restschuld = Math.max(0, restschuld - tilgung);

      gesamtZinsen += zinsen;
      gesamtKapitaldienst += kapitaldienst;

      schedule.push({
        jahr,
        zinsen: parseFloat(zinsen.toFixed(2)),
        tilgung: parseFloat(tilgung.toFixed(2)),
        kapitaldienst: parseFloat(kapitaldienst.toFixed(2)),
        restschuld: parseFloat(restschuld.toFixed(2))
      });
    }
  } else if (darlehensTyp === 'INSTALLMENT') {
    const festeTilgung = k0 / n;

    for (let jahr = 1; jahr <= n; jahr++) {
      const zinsen = restschuld * p;
      const tilgung = festeTilgung;
      const kapitaldienst = zinsen + tilgung;
      restschuld = Math.max(0, restschuld - tilgung);

      gesamtZinsen += zinsen;
      gesamtKapitaldienst += kapitaldienst;

      schedule.push({
        jahr,
        zinsen: parseFloat(zinsen.toFixed(2)),
        tilgung: parseFloat(tilgung.toFixed(2)),
        kapitaldienst: parseFloat(kapitaldienst.toFixed(2)),
        restschuld: parseFloat(restschuld.toFixed(2))
      });
    }
  } else {
    // FIXED_MATURITY
    for (let jahr = 1; jahr <= n; jahr++) {
      const zinsen = k0 * p;
      const tilgung = jahr === n ? k0 : 0;
      const kapitaldienst = zinsen + tilgung;
      restschuld = jahr === n ? 0 : k0;

      gesamtZinsen += zinsen;
      gesamtKapitaldienst += kapitaldienst;

      schedule.push({
        jahr,
        zinsen: parseFloat(zinsen.toFixed(2)),
        tilgung: parseFloat(tilgung.toFixed(2)),
        kapitaldienst: parseFloat(kapitaldienst.toFixed(2)),
        restschuld: parseFloat(restschuld.toFixed(2))
      });
    }
  }

  return {
    darlehensbetrag: k0,
    zinssatzPercent,
    laufzeitJahre: n,
    darlehensTyp,
    gesamtZinsen: parseFloat(gesamtZinsen.toFixed(2)),
    gesamtKapitaldienst: parseFloat(gesamtKapitaldienst.toFixed(2)),
    schedule
  };
}
