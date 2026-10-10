// @ts-check
/**
 * IHK WISO Kaufvertragsstörungen: Sachmängelhaftung & Gewährleistung Engine
 * Covers:
 * - Mangelarten nach BGB § 434 / § 435 (Beschaffenheit, Montage, IKEA-Klausel, Aliud, Minderlieferung, Rechtsmangel)
 * - Vorrangige Rechte (Nacherfüllung: Nachbesserung vs. Nachlieferung § 439)
 * - Nachrangige Rechte (Rücktritt § 323/440, Minderung § 441, Schadensersatz § 280/281)
 * - Rügefristen beim beiderseitigen Handelskauf (HGB § 377) vs. Verbrauchsgüterkauf (BGB § 477 Beweislastumkehr 1 Jahr)
 * - Verjährungsfristen nach BGB § 438
 * @module wisoSachmaengelEngine
 */

/**
 * @typedef {'BESCHAFFENHEIT' | 'MONTAGE' | 'IKEA_KLAUSEL' | 'ALIUD_FALSCHLIEFERUNG' | 'MINDERLIEFERUNG' | 'RECHTSMANGEL'} MangelType
 * @typedef {'B2B_HANDELSKAUF' | 'B2C_VERBRAUCHER' | 'C2C_PRIVAT'} BuyerContractType
 *
 * @typedef {{
 *   type: MangelType;
 *   title: string;
 *   paragraph: string;
 *   description: string;
 *   example: string;
 * }} MangelDefinition
 */

export const MANGEL_TYPES = {
  BESCHAFFENHEIT: {
    type: 'BESCHAFFENHEIT',
    title: 'Mangel in der Beschaffenheit',
    paragraph: '§ 434 Abs. 2 BGB',
    description: 'Die Ware weicht von der vereinbarten Beschaffenheit oder den üblichen Produkteigenschaften ab.',
    example: 'Ein bestellter Firmenlaptop hat nur 8 GB statt der im Angebot garantierten 32 GB RAM.'
  },
  MONTAGE: {
    type: 'MONTAGE',
    title: 'Unsachgemäße Montage durch Verkäufer',
    paragraph: '§ 434 Abs. 4 BGB',
    description: 'Wurde die Montage vertraglich übernommen und fehlerhaft ausgeführt, liegt ein Sachmangel vor.',
    example: 'Techniker des Systemhauses installiert 19"-Server-Rack schief und beschädigt Führungsschienen.'
  },
  IKEA_KLAUSEL: {
    type: 'IKEA_KLAUSEL',
    title: 'Mangelhafte Montageanleitung (IKEA-Klausel)',
    paragraph: '§ 434 Abs. 4 Satz 2 BGB',
    description: 'Fehlerhafte, unverständliche oder lückenhafte Montageanleitung führt zur Fehlmontage durch den Käufer.',
    example: 'Anleitung für USV-Akku-Tausch vertauscht Plus- und Minus-Pol, Akku brennt durch.'
  },
  ALIUD_FALSCHLIEFERUNG: {
    type: 'ALIUD_FALSCHLIEFERUNG',
    title: 'Falschlieferung (Aliud)',
    paragraph: '§ 434 Abs. 5 BGB',
    description: 'Die Lieferung einer anderen als der geschuldeten Sache steht einem Sachmangel gleich.',
    example: 'Statt 24x Cisco Catalyst Switches werden 24x unmanaged TP-Link Switche geliefert.'
  },
  MINDERLIEFERUNG: {
    type: 'MINDERLIEFERUNG',
    title: 'Zuweniglieferung (Mindermenge)',
    paragraph: '§ 434 Abs. 5 BGB',
    description: 'Die Lieferung einer zu geringen Menge steht einem Sachmangel gesetzlich gleich.',
    example: 'Lieferschein und Rechnung weisen 50 NVMe-SSDs aus, im Paket befinden sich jedoch nur 30 Stück.'
  },
  RECHTSMANGEL: {
    type: 'RECHTSMANGEL',
    title: 'Rechtsmangel',
    paragraph: '§ 435 BGB',
    description: 'Dritte können in Bezug auf die Sache Rechte (z. B. Patente, Eigentum, Pfandrechte) geltend machen.',
    example: 'Gelieferte Software verletzt Urheberrechte Dritter; Nutzung wird per einstweiliger Verfügung untersagt.'
  }
};

/**
 * Evaluates buyer rights based on contract type, flaw, attempts, and notice
 * @param {{
 *   mangelType: MangelType;
 *   contractType: BuyerContractType;
 *   isOpenDefect: boolean;
 *   inspectionNoticeWithinDays: number;
 *   nacherfuellungAttempts: number;
 *   sellerRefused: boolean;
 *   flawIsMinor: boolean;
 *   monthsSincePurchase: number;
 * }} scenario
 * @returns {{
 *   goodsDeemedAccepted: boolean;
 *   availableRights: Array<{ name: string; paragraph: string; allowed: boolean; reason: string }>;
 *   burdenOfProof: 'SELLER' | 'BUYER';
 *   statuteOfLimitationsYears: number;
 *   recommendation: string;
 * }}
 */
export function evaluateSachmangelRights(scenario) {
  const {
    contractType,
    isOpenDefect,
    inspectionNoticeWithinDays,
    nacherfuellungAttempts,
    sellerRefused,
    flawIsMinor,
    monthsSincePurchase
  } = scenario;

  // 1. Check HGB § 377 for B2B Handelskauf
  let goodsDeemedAccepted = false;
  if (contractType === 'B2B_HANDELSKAUF') {
    // Unverzügliche Rügepflicht (in der Praxis max 1-3 Tage für offene Mängel)
    if (isOpenDefect && inspectionNoticeWithinDays > 3) {
      goodsDeemedAccepted = true;
    }
  }

  // 2. Beweislastumkehr nach BGB § 477 (seit 2022: 12 Monate für Verbraucher B2C)
  let burdenOfProof = 'BUYER';
  if (contractType === 'B2C_VERBRAUCHER' && monthsSincePurchase <= 12) {
    burdenOfProof = 'SELLER'; // Vermutung, dass Mangel bereits bei Übergabe vorlag
  }

  // 3. Verjährung BGB § 438
  const statuteOfLimitationsYears = 2;

  // 4. Determine available buyer rights
  const rights = [];

  // Vorrangiges Recht: Nacherfüllung (§ 439 BGB)
  if (goodsDeemedAccepted) {
    rights.push({
      name: 'Nacherfüllung (§ 439 BGB)',
      paragraph: '§ 439 BGB',
      allowed: false,
      reason: 'Ausgeschlossen: Ware gilt nach HGB § 377 Abs. 2 als genehmigt, da offener Mangel nicht unverzüglich gerügt wurde.'
    });
  } else {
    rights.push({
      name: 'Nacherfüllung (§ 439 BGB)',
      paragraph: '§ 439 BGB',
      allowed: true,
      reason: 'Vorrangiges Recht des Käufers! Wahlrecht zwischen Nachbesserung (Reparatur) oder Nachlieferung (neue mangelfreie Ware).'
    });
  }

  // Nachrangige Rechte: Setzen erfolglose Nacherfüllung voraus (2 Versuche § 440 oder Verweigerung)
  const nacherfuellungFailed = nacherfuellungAttempts >= 2 || sellerRefused;

  // Rücktritt (§ 323, 440 BGB)
  let canRuecktritt = false;
  let ruecktrittReason = '';
  if (goodsDeemedAccepted) {
    ruecktrittReason = 'Ausgeschlossen nach HGB § 377 (Genehmigungsfiktion).';
  } else if (!nacherfuellungFailed) {
    ruecktrittReason = 'Vorrang der Nacherfüllung: Erst nach 2 erfolglosen Nachbesserungsversuchen oder Verweigerung möglich.';
  } else if (flawIsMinor) {
    ruecktrittReason = 'Ausgeschlossen nach § 323 Abs. 5 Satz 2 BGB: Der Mangel ist unerheblich (Bagatellmangel).';
  } else {
    canRuecktritt = true;
    ruecktrittReason = 'Zulässig: Nacherfüllung fehlgeschlagen/verweigert und Mangel ist erheblich. Vertrag wird rückabgewickelt.';
  }

  rights.push({
    name: 'Rücktritt vom Kaufvertrag',
    paragraph: '§§ 437 Nr. 2, 323, 440 BGB',
    allowed: canRuecktritt,
    reason: ruecktrittReason
  });

  // Minderung (§ 441 BGB)
  let canMinderung = false;
  let minderungReason = '';
  if (goodsDeemedAccepted) {
    minderungReason = 'Ausgeschlossen nach HGB § 377 (Genehmigungsfiktion).';
  } else if (!nacherfuellungFailed) {
    minderungReason = 'Vorrang der Nacherfüllung: Erst nach fehlgeschlagener Frist/Nachbesserung zulässig.';
  } else {
    canMinderung = true;
    minderungReason = 'Zulässig: Käufer behält Ware und mindert den Kaufpreis im Verhältnis des tatsächlichen Wertes (auch bei geringfügigem Mangel).';
  }

  rights.push({
    name: 'Minderung des Kaufpreises',
    paragraph: '§§ 437 Nr. 2, 441 BGB',
    allowed: canMinderung,
    reason: minderungReason
  });

  // Schadensersatz statt der Leistung (§ 280, 281 BGB)
  let canSchadensersatz = false;
  let schadensersatzReason = '';
  if (goodsDeemedAccepted) {
    schadensersatzReason = 'Ausgeschlossen nach HGB § 377.';
  } else if (!nacherfuellungFailed) {
    schadensersatzReason = 'Erst nach Verstreichen einer angemessenen Nachfrist zur Nacherfüllung möglich.';
  } else {
    canSchadensersatz = true;
    schadensersatzReason = 'Zulässig, sofern der Verkäufer die Pflichtverletzung zu vertreten hat (Verschulden).';
  }

  rights.push({
    name: 'Schadensersatz statt der Leistung',
    paragraph: '§§ 437 Nr. 3, 280, 281 BGB',
    allowed: canSchadensersatz,
    reason: schadensersatzReason
  });

  let recommendation = '';
  if (goodsDeemedAccepted) {
    recommendation = 'Kaufmännische Rügefrist versäumt! Keine Gewährleistungsansprüche durchsetzbar.';
  } else if (!nacherfuellungFailed) {
    recommendation = 'Schriftliche Aufforderung zur Nacherfüllung mit Fristsetzung (Wahlrecht Nachbesserung / Nachlieferung).';
  } else if (canRuecktritt) {
    recommendation = 'Rücktritt erklären und vollen Kaufpreis Zug um Zug gegen Rückgabe der Ware zurückfordern.';
  } else if (canMinderung) {
    recommendation = 'Minderung geltend machen und anteiligen Kaufpreisnachlass zurückfordern.';
  }

  return {
    goodsDeemedAccepted,
    availableRights: rights,
    burdenOfProof: /** @type {'SELLER' | 'BUYER'} */ (burdenOfProof),
    statuteOfLimitationsYears,
    recommendation
  };
}
