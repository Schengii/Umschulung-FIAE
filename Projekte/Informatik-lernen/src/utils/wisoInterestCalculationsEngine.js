/**
 * IHK WISO Zins- und Zinseszinsrechnung Engine
 * Implements the German interest method (30/360 days), simple interest calculation,
 * compound interest accumulation (Aufzinsung), and discounting (Abzinsung / Barwert).
 */

export function calculateSimpleInterest({
  kapital = 50000,
  zinssatzPercent = 6.0,
  tage = 90
}) {
  const k = Math.max(0, kapital);
  const p = Math.max(0, zinssatzPercent);
  const t = Math.max(1, tage);

  // German interest method: Z = (K * p * t) / (100 * 360)
  const zinsen = (k * p * t) / (100 * 360);
  const endkapital = k + zinsen;

  return {
    kapital: k,
    zinssatzPercent: p,
    tage: t,
    zinsen: parseFloat(zinsen.toFixed(2)),
    endkapital: parseFloat(endkapital.toFixed(2))
  };
}

export function calculateCompoundInterest({
  anfangskapital = 50000,
  zinssatzPercent = 5.0,
  jahre = 5
}) {
  const k0 = Math.max(0, anfangskapital);
  const i = Math.max(0, zinssatzPercent) / 100;
  const n = Math.max(1, jahre);

  const aufzinsungsfaktor = Math.pow(1 + i, n);
  const abzinsungsfaktor = 1 / aufzinsungsfaktor;
  const endkapital = k0 * aufzinsungsfaktor;
  const gesamtzinsen = endkapital - k0;

  const yearlyProgression = [];
  let currentK = k0;
  for (let y = 1; y <= n; y++) {
    const yearInterest = currentK * i;
    currentK += yearInterest;
    yearlyProgression.push({
      jahr: y,
      zinsenImJahr: parseFloat(yearInterest.toFixed(2)),
      kapitalEndeJahr: parseFloat(currentK.toFixed(2))
    });
  }

  return {
    anfangskapital: k0,
    zinssatzPercent,
    jahre: n,
    aufzinsungsfaktor: parseFloat(aufzinsungsfaktor.toFixed(4)),
    abzinsungsfaktor: parseFloat(abzinsungsfaktor.toFixed(4)),
    endkapital: parseFloat(endkapital.toFixed(2)),
    gesamtzinsen: parseFloat(gesamtzinsen.toFixed(2)),
    yearlyProgression
  };
}
