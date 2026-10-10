// @ts-check
/**
 * @file wisoCompanyFormsEngine.js
 * IHK WISO Rechtsformen & Haftungs-Entscheidungsmatrix
 * (Einzelunternehmen, e.K., GbR, OHG, KG, GmbH, UG haftungsbeschränkt, AG)
 */

/**
 * @typedef {object} CompanyFormDetail
 * @property {string} id
 * @property {string} name
 * @property {string} category - 'Einzelunternehmung' | 'Personengesellschaft' | 'Kapitalgesellschaft'
 * @property {string} minCapital - Mindestkapital bei Gründung
 * @property {string} liability - Haftungsumfang
 * @property {string} commercialRegister - Handelsregister (Kein / Abt. A / Abt. B)
 * @property {string} management - Geschäftsführung & Vertretung
 * @property {string} organs - Organe / Entscheidungsträger
 * @property {string} profitDistribution - Gewinnverteilung (gesetzlich)
 * @property {string} bestFor - Typischer Einsatzzweck im IHK-Kontext
 */

/**
 * Vollständiger IHK-Katalog der Rechtsformen
 * @type {CompanyFormDetail[]}
 */
export const COMPANY_FORMS = [
  {
    id: 'einzelunternehmen',
    name: 'Einzelunternehmen (Kleingewerbetreibender)',
    category: 'Einzelunternehmung',
    minCapital: 'Kein Mindestkapital (0 €)',
    liability: 'Unbeschränkt persönlich mit dem gesamten Geschäfts- und Privatvermögen',
    commercialRegister: 'Kein Handelsregistereintrag (nur Gewerbeanmeldung)',
    management: 'Inhaber allein (volle Entscheidungsfreiheit)',
    organs: 'Inhaber',
    profitDistribution: '100% Gewinn/Verlust an den Inhaber',
    bestFor: 'Freelancer, kleine IT-Dienstleister mit geringem Haftungsrisiko'
  },
  {
    id: 'ek',
    name: 'Eingetragener Kaufmann (e. K. / e. Kfm. / e. Kfr.)',
    category: 'Einzelunternehmung',
    minCapital: 'Kein Mindestkapital (0 €)',
    liability: 'Unbeschränkt persönlich mit dem gesamten Geschäfts- und Privatvermögen',
    commercialRegister: 'Pflicht: Handelsregister Abteilung A (HRA)',
    management: 'Kaufmann allein',
    organs: 'Inhaber (Kaufmann nach HGB)',
    profitDistribution: '100% Gewinn/Verlust an den Kaufmann',
    bestFor: 'Kaufmännisch eingerichteter Geschäftsbetrieb im Alleineigentum'
  },
  {
    id: 'gbr',
    name: 'Gesellschaft bürgerlichen Rechts (GbR / BGB-Gesellschaft)',
    category: 'Personengesellschaft',
    minCapital: 'Kein Mindestkapital (0 €)',
    liability: 'Gesamtschuldnerisch, unbeschränkt und persönlich aller Gesellschafter',
    commercialRegister: 'Kein Eintrag (optional: Gesellschaftsregister eGbR)',
    management: 'Gemeinschaftliche Geschäftsführung aller Gesellschafter (§ 709 BGB)',
    organs: 'Gesellschafter',
    profitDistribution: 'Nach Köpfen (sofern vertraglich nicht anders vereinbart)',
    bestFor: 'Gemeinsame Projektarbeit, Startups in der Findungsphase'
  },
  {
    id: 'ohg',
    name: 'Offene Handelsgesellschaft (OHG)',
    category: 'Personengesellschaft',
    minCapital: 'Kein Mindestkapital (0 €)',
    liability: 'Unbeschränkt, persönlich, primär und gesamtschuldnerisch aller Gesellschafter (§ 128 HGB)',
    commercialRegister: 'Pflicht: Handelsregister Abteilung A (HRA)',
    management: 'Einzelgeschäftsführung & Einzelvertretung (§§ 115, 125 HGB)',
    organs: 'Gesellschafter',
    profitDistribution: '4% auf den Kapitalanteil, Rest nach Köpfen (§ 121 HGB a.F.)',
    bestFor: 'Handelsbetriebe mehrerer Partner mit hoher gegenseitiger Vertrauensbasis'
  },
  {
    id: 'kg',
    name: 'Kommanditgesellschaft (KG)',
    category: 'Personengesellschaft',
    minCapital: 'Kein gesetzliches Mindestkapital (Einlage der Kommanditisten)',
    liability: 'Komplementär: unbeschränkt persönlich; Kommanditist: beschränkt auf die Einlage (§ 171 HGB)',
    commercialRegister: 'Pflicht: Handelsregister Abteilung A (HRA)',
    management: 'Ausschließlich Komplementär (Kommanditist ist von Führung ausgeschlossen)',
    organs: 'Komplementär (Vollhafter) & Kommanditist (Teilhafter)',
    profitDistribution: '4% auf Kapitalanteil, Rest im angemessenen Verhältnis (§ 168 HGB)',
    bestFor: 'Beschaffung von Eigenkapital durch reine Geldgeber ohne Führungsbefugnis'
  },
  {
    id: 'ug',
    name: 'Unternehmergesellschaft (UG haftungsbeschränkt)',
    category: 'Kapitalgesellschaft',
    minCapital: 'Mindestens 1 € (gesetzliche Rücklagepflicht: 25% des Jahresüberschusses bis 25.000 €)',
    liability: 'Beschränkt auf das Gesellschaftsvermögen (§ 13 GmbHG)',
    commercialRegister: 'Pflicht: Handelsregister Abteilung B (HRB)',
    management: 'Geschäftsführer (Gesellschafter oder Fremdgeschäftsführer)',
    organs: 'Geschäftsführung, Gesellschafterversammlung',
    profitDistribution: 'Nach Geschäftsanteilen (nach Abzug der 25% gesetzlichen Rücklage)',
    bestFor: 'Kapitalarme Startup-Gründungen mit Haftungsbeschränkung ("Mini-GmbH")'
  },
  {
    id: 'gmbh',
    name: 'Gesellschaft mit beschränkter Haftung (GmbH)',
    category: 'Kapitalgesellschaft',
    minCapital: 'Mindestens 25.000 € (mind. 12.500 € bei Gründung bar einzuzahlen)',
    liability: 'Beschränkt auf das Gesellschaftsvermögen (§ 13 GmbHG)',
    commercialRegister: 'Pflicht: Handelsregister Abteilung B (HRB)',
    management: 'Geschäftsführer (Bestellt durch Gesellschafterversammlung)',
    organs: 'Geschäftsführer, Gesellschafterversammlung (optional: Aufsichtsrat ab 500 MA)',
    profitDistribution: 'Im Verhältnis der Geschäftsanteile (§ 29 GmbHG)',
    bestFor: 'Mittelständische IT-Unternehmen, Software-Agenturen, Systemhäuser'
  },
  {
    id: 'ag',
    name: 'Aktiengesellschaft (AG)',
    category: 'Kapitalgesellschaft',
    minCapital: 'Mindestens 50.000 € Grundkapital',
    liability: 'Beschränkt auf das Gesellschaftsvermögen der AG',
    commercialRegister: 'Pflicht: Handelsregister Abteilung B (HRB)',
    management: 'Vorstand (Leitung der Gesellschaft in eigener Verantwortung)',
    organs: 'Vorstand (Leitung), Aufsichtsrat (Kontrolle), Hauptversammlung (Eigentümer)',
    profitDistribution: 'Dividende pro Aktie (nach Beschluss der Hauptversammlung)',
    bestFor: 'Großunternehmen und Konzerne mit breitem Kapitalmarktzugang'
  }
];

/**
 * Filtert und empfiehlt eine Rechtsform basierend auf Anforderungen
 * @param {{
 *   maxInitialCapital: number,
 *   needLimitedLiability: boolean,
 *   singleFounder: boolean,
 *   wantExternalInvestorsOnly: boolean
 * }} criteria
 * @returns {CompanyFormDetail[]}
 */
export function recommendCompanyForms(criteria) {
  return COMPANY_FORMS.filter(form => {
    // Kapitalbeschränkung
    if (form.id === 'gmbh' && criteria.maxInitialCapital < 12500) return false;
    if (form.id === 'ag' && criteria.maxInitialCapital < 50000) return false;

    // Haftungsbeschränkung erwünscht?
    if (criteria.needLimitedLiability) {
      if (['einzelunternehmen', 'ek', 'gbr', 'ohg'].includes(form.id)) return false;
    }

    // Ein-Personen-Gründung
    if (criteria.singleFounder) {
      if (['gbr', 'ohg', 'kg'].includes(form.id)) return false;
    }

    // Reine Investoren ohne Mitsprache
    if (criteria.wantExternalInvestorsOnly) {
      if (!['kg', 'ug', 'gmbh', 'ag'].includes(form.id)) return false;
    }

    return true;
  });
}
