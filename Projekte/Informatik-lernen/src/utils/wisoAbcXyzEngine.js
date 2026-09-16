/**
 * IHK WISO ABC & XYZ Materialanalyse Engine
 * Calculates cumulative value distribution (Lorenz Curve A <= 80%, B <= 95%, C > 95%),
 * consumption predictability (X <= 20%, Y 20-50%, Z > 50%), and 3x3 procurement matrix strategies.
 */

export function calculateAbcXyzMatrix(items = [
  { id: 1, name: 'Server CPUs (Intel Xeon)', menge: 150, preis: 800, schwankungPercent: 12 },
  { id: 2, name: 'DDR5 ECC RAM Riegel', menge: 800, preis: 120, schwankungPercent: 18 },
  { id: 3, name: 'NVMe Datacenter SSDs', menge: 400, preis: 250, schwankungPercent: 35 },
  { id: 4, name: 'Patchkabel Cat 6a', menge: 5000, preis: 2.5, schwankungPercent: 65 },
  { id: 5, name: 'Käfigmuttern & Schrauben', menge: 20000, preis: 0.15, schwankungPercent: 80 }
]) {
  // 1. Calculate total values
  const itemsWithValues = items.map(it => ({
    ...it,
    gesamtwert: it.menge * it.preis
  })).sort((a, b) => b.gesamtwert - a.gesamtwert);

  const summeGesamtwert = itemsWithValues.reduce((acc, it) => acc + it.gesamtwert, 0);

  // 2. Classify ABC and XYZ
  let kumulierterWert = 0;

  const analyzedItems = itemsWithValues.map(it => {
    kumulierterWert += it.gesamtwert;
    const kumulierterAnteilPercent = summeGesamtwert > 0 ? (kumulierterWert / summeGesamtwert) * 100 : 0;

    let abcClass = 'C';
    if (kumulierterAnteilPercent <= 80) abcClass = 'A';
    else if (kumulierterAnteilPercent <= 95) abcClass = 'B';

    let xyzClass = 'Z';
    if (it.schwankungPercent <= 20) xyzClass = 'X';
    else if (it.schwankungPercent <= 50) xyzClass = 'Y';

    const matrixCode = `${abcClass}${xyzClass}`;
    let strategie = 'Vorratsbeschaffung';
    if (matrixCode === 'AX') strategie = 'Just-in-Time (JIT) / Kanban (Höchste Priorität)';
    else if (matrixCode === 'AY') strategie = 'Bedarfsgesteuerte synchrone Beschaffung';
    else if (matrixCode === 'CZ') strategie = 'Einzelbeschaffung im Bedarfsfall (Keine Lagerhaltung)';

    return {
      ...it,
      kumulierterAnteilPercent: parseFloat(kumulierterAnteilPercent.toFixed(2)),
      abcClass,
      xyzClass,
      matrixCode,
      strategie
    };
  });

  return {
    summeGesamtwert,
    analyzedItems
  };
}
