// Feste Zuordnung einzelner Labs zu einem Prüfungsbereich (überschreibt die Heuristik in
// `learningPathEngine.domainOfLab`). Schlüssel = Modul-ID aus LAB_MODULES,
// Werte: 'ap1' | 'ap2_1' (Planen & Konzipieren) | 'ap2_2' (Entwicklung & Fachaufgaben) | 'wiso'.
// Bewusst NICHT enthalten: reine Lern- und Prüfungswerkzeuge (Lernplaner, Karteikarten, Quiz,
// Fachgespräch- und Präsentationstrainer, Spickzettel). Sie gehören zu keinem der vier Testbereiche
// und bekommen daher kein Schwächen-Signal.
export const LAB_EXAM_DOMAINS = {
  // AP1: Arbeitsplatz, Sicherheit, Hardware
  dguv_v3_lab: 'ap1',

  // AP2 Planen & Konzipieren: Projekt, Wirtschaftlichkeit, Risiko, Datenschutz, Betrieb
  ihk_proposal_pdf_lab: 'ap2_1',
  ihk_project_proposal: 'ap2_1',
  ihk_project_gantt_lab: 'ap2_1',
  ihk_doc_generator: 'ap2_1',
  cpm_network: 'ap2_1',
  nwa_scoring: 'ap2_1',
  ihk_wirtschaftlichkeit_lab: 'ap2_1',
  tco_roi_lab: 'ap2_1',
  ihk_risk_analysis_lab: 'ap2_1',
  ihk_burndown_lab: 'ap2_1',
  scrum_simulator: 'ap2_1',
  itsm_simulator: 'ap2_1',
  ihk_tom_catalog_lab: 'ap2_1',
  ihk_dpia_lab: 'ap2_1',
  bsi_grundschutz_lab: 'ap2_1',
  raid6_galois_lab: 'ap2_1',

  // AP2 Entwicklung & Fachaufgaben
  clean_arch_lab: 'ap2_2'
};
