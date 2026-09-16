/**
 * IHK WISO Andler'sche Formel (Optimale Bestellmenge) Engine
 * Calculates economic order quantity (EOQ / x_opt), order frequency (n_opt),
 * order interval (t_opt), and cost breakdown (ordering costs vs. holding costs).
 */

export function calculateAndlerOptimalOrder({
  jahresbedarf = 10000,
  bestellfixeKosten = 50.0,
  einstandspreis = 20.0,
  lagerkostensatzPercent = 15.0
}) {
  const j = Math.max(1, jahresbedarf);
  const kf = Math.max(1, bestellfixeKosten);
  const p = Math.max(0.1, einstandspreis);
  const ls = Math.max(0.1, lagerkostensatzPercent);

  // Andler formula: x_opt = sqrt( (200 * J * k_f) / (p * l_s) )
  const xOpt = Math.round(Math.sqrt((200 * j * kf) / (p * ls)));
  const nOpt = parseFloat((j / xOpt).toFixed(2));
  const tOptDays = parseFloat((360 / nOpt).toFixed(1));

  const bestellkosten = parseFloat((nOpt * kf).toFixed(2));
  const lagerkosten = parseFloat(((xOpt / 2) * p * (ls / 100)).toFixed(2));
  const gesamtkosten = parseFloat((bestellkosten + lagerkosten).toFixed(2));

  return {
    jahresbedarf: j,
    bestellfixeKosten: kf,
    einstandspreis: p,
    lagerkostensatzPercent: ls,
    xOpt,
    nOpt,
    tOptDays,
    bestellkosten,
    lagerkosten,
    gesamtkosten
  };
}
