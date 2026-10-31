// Prüfungsdrills der Labs im Format der Prüfungsfragen (`examData.js`), damit das
// Fehlerjournal (MistakeReviewWidget) auch hier falsch beantwortete Fragen wiederholen kann.
// Neue Drills mit dem Format { id, frage, optionen, korrektIndex, erklaerung } hier ergänzen.
import { NORMALIZATION_DRILL_QUESTIONS } from '../utils/databaseNormalizationEngine';
import { DHCP_DRILL_QUESTIONS } from '../utils/dhcpDoraEngine';
import { NAT_PAT_DRILL_QUESTIONS } from '../utils/natPatEngine';
import { STRUKTOGRAMM_DRILL_QUESTIONS } from '../utils/struktogrammEngine';
import { TESTVERFAHREN_DRILL_QUESTIONS } from '../utils/testverfahrenEngine';
import { USV_DRILL_QUESTIONS } from '../utils/usvCalculationsEngine';
import { VLAN_DRILL_QUESTIONS } from '../utils/vlanTrunkingEngine';
import { WISO_ANGEBOTSVERGLEICH_DRILL } from '../utils/wisoAngebotsvergleichEngine';
import { RAID_DRILL_QUESTIONS } from '../utils/raidEngine';
import { LIQUIDITAET_DRILL_QUESTIONS } from '../utils/wisoLiquiditaetEngine';
import { ANDLER_DRILL_QUESTIONS } from '../utils/wisoAndlerEngine';
import { CONTRIBUTION_MARGIN_DRILL_QUESTIONS } from '../utils/wisoContributionMarginEngine';

const SOURCES = [
  NORMALIZATION_DRILL_QUESTIONS,
  DHCP_DRILL_QUESTIONS,
  NAT_PAT_DRILL_QUESTIONS,
  STRUKTOGRAMM_DRILL_QUESTIONS,
  TESTVERFAHREN_DRILL_QUESTIONS,
  USV_DRILL_QUESTIONS,
  VLAN_DRILL_QUESTIONS,
  WISO_ANGEBOTSVERGLEICH_DRILL,
  RAID_DRILL_QUESTIONS,
  LIQUIDITAET_DRILL_QUESTIONS,
  ANDLER_DRILL_QUESTIONS,
  CONTRIBUTION_MARGIN_DRILL_QUESTIONS
];

/** @type {Array<{ id: string, question: string, options: string[], correct: number, explanation: string }>} */
export const DRILL_QUESTIONS = SOURCES.flat().map((q) => ({
  id: String(q.id),
  question: q.frage,
  options: q.optionen,
  correct: q.korrektIndex,
  explanation: q.erklaerung
}));
