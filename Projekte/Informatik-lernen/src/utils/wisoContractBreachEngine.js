// @ts-check
/**
 * @file wisoContractBreachEngine.js
 * IHK WISO Kaufvertragsstörungen, Mängelrüge (§ 433, 437, 439 BGB & § 377 HGB)
 */

/**
 * @typedef {'mangel' | 'lieferverzug' | 'zahlungsverzug' | 'annahmeverzug'} BreachType
 * @typedef {'b2b' | 'b2c' | 'c2c'} ContractParty
 * @typedef {'offen' | 'versteckt' | 'arglistig'} DefectType
 */

/**
 * Bestimmt die Rügefristen für Sachmängel nach BGB vs. HGB § 377
 * @param {ContractParty} partyType
 * @param {DefectType} defectType
 * @returns {{
 *   duePeriodText: string,
 *   lossOfWarrantyOnDelay: boolean,
 *   legalBasis: string,
 *   dutyOfInspection: boolean
 * }}
 */
export function evaluateDefectNoticeDeadline(partyType, defectType) {
  if (partyType === 'b2b') {
    // Handelsgesetzbuch (Handelskauf beiderseitig)
    switch (defectType) {
      case 'offen':
        return {
          duePeriodText: 'Unverzüglich nach Wareneingang (typischerweise binnen 1–3 Werktagen)',
          lossOfWarrantyOnDelay: true,
          legalBasis: 'HGB § 377 Abs. 1 & 2',
          dutyOfInspection: true
        };
      case 'versteckt':
        return {
          duePeriodText: 'Unverzüglich nach Entdeckung (innerhalb der 2-jährigen Verjährungsfrist)',
          lossOfWarrantyOnDelay: true,
          legalBasis: 'HGB § 377 Abs. 3',
          dutyOfInspection: true
        };
      case 'arglistig':
        return {
          duePeriodText: '3 Jahre ab Jahresende der Entdeckung (§ 195, 199 BGB)',
          lossOfWarrantyOnDelay: false,
          legalBasis: 'HGB § 377 Abs. 5 i.V.m. BGB § 438 Abs. 3',
          dutyOfInspection: false
        };
    }
  }

  // B2C (Verbrauchsgüterkauf nach § 474 BGB) oder C2C
  return {
    duePeriodText: '2 Jahre gesetzliche Gewährleistung (Keine Rügepflicht nach HGB § 377; 1 Jahr Beweislastumkehr)',
    lossOfWarrantyOnDelay: false,
    legalBasis: 'BGB § 438 Abs. 1 Nr. 3 & § 477',
    dutyOfInspection: false
  };
}

/**
 * Bestimmt die vorrangigen und nachrangigen Rechte des Käufers bei Sachmängeln
 * @param {{
 *   failedRepairAttempts?: number,
 *   sellerRefused?: boolean,
 *   deadlineExpired?: boolean,
 *   isImmaterialDefect?: boolean
 * }} options
 * @returns {{
 *   primaryRights: string[],
 *   secondaryRights: string[],
 *   canWithdraw: boolean,
 *   canReducePrice: boolean,
 *   canClaimDamages: boolean,
 *   explanation: string
 * }}
 */
export function evaluateBuyerRights(options = {}) {
  const {
    failedRepairAttempts = 0,
    sellerRefused = false,
    deadlineExpired = false,
    isImmaterialDefect = false
  } = options;

  const primaryRights = [
    'Nacherfüllung: Nachbesserung (Reparatur des Mangels)',
    'Nacherfüllung: Nachlieferung (Lieferung einer mangelfreien neuen Sache)'
  ];

  // Nach § 440 BGB gilt eine Nachbesserung nach dem 2. erfolglosen Versuch als fehlgeschlagen
  const secondaryRightsUnlocked = failedRepairAttempts >= 2 || sellerRefused || deadlineExpired;

  /** @type {string[]} */
  const secondaryRights = [];
  let canWithdraw = false;
  let canReducePrice = false;
  let canClaimDamages = false;
  let explanation = 'Vorrang der Nacherfüllung (§ 439 BGB): Der Käufer muss dem Verkäufer zunächst eine angemessene Frist zur Nacherfüllung gewähren.';

  if (secondaryRightsUnlocked) {
    canReducePrice = true;
    canClaimDamages = true;
    secondaryRights.push('Minderung des Kaufpreises (§ 441 BGB)');
    secondaryRights.push('Schadensersatz statt der Leistung (§ 280, 281 BGB)');

    if (!isImmaterialDefect) {
      canWithdraw = true;
      secondaryRights.push('Rücktritt vom Kaufvertrag / Wandlung (§ 437 Nr. 2, 323 BGB)');
      explanation = 'Nachrangige Rechte freigeschaltet: Nach 2 fehlgeschlagenen Nachbesserungsversuchen oder Fristablauf kann der Käufer mindern, zurücktreten oder Schadensersatz fordern.';
    } else {
      explanation = 'Unerheblicher Mangel (§ 323 Abs. 5 Satz 2 BGB): Rücktritt ist ausgeschlossen! Käufer kann jedoch den Kaufpreis mindern oder Schadensersatz verlangen.';
    }
  }

  return {
    primaryRights,
    secondaryRights,
    canWithdraw,
    canReducePrice,
    canClaimDamages,
    explanation
  };
}
