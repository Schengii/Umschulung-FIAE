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
import { KAFKA_DRILL_QUESTIONS } from '../utils/kafkaEventEngine';
import { WASM_DRILL_QUESTIONS } from '../utils/wasmBinaryEngine';
import { DOCKER_DRILL_QUESTIONS } from '../utils/dockerEngine';
import { K8S_DRILL_QUESTIONS } from '../utils/kubernetesEngine';
import { OAUTH_OIDC_DRILL_QUESTIONS } from '../utils/oauthOidcEngine';
import { CLOUD_DEVOPS_DRILL_QUESTIONS } from '../utils/cloudDevOpsEngine';
import { IHK_CLASS_DRILL_QUESTIONS } from '../utils/umlEngine';
import { WEBSOCKETS_DRILL_QUESTIONS } from '../utils/webSocketsEngine';
import { IHK_BAB_DRILL_QUESTIONS } from '../utils/wisoBabEngine';
import { normalizeDrillQuestions } from '../utils/drillFormat';
import {
  DGUV_V3_DRILL_QUESTIONS,
  BSI_GRUNDSCHUTZ_DRILL_QUESTIONS,
  DPIA_DRILL_QUESTIONS,
  TOM_DRILL_QUESTIONS,
  CPM_DRILL_QUESTIONS,
  NWA_DRILL_QUESTIONS,
  TCO_DRILL_QUESTIONS,
  ITSM_DRILL_QUESTIONS
} from './labDrillsIhk';

// Quelle je Lab: `lab` ist die Modul-ID aus LAB_MODULES (Grundlage für Lernpfad-Empfehlungen).
const SOURCES = [
  { lab: 'database_normalization_lab', questions: NORMALIZATION_DRILL_QUESTIONS },
  { lab: 'dhcp_dora_lab', questions: DHCP_DRILL_QUESTIONS },
  { lab: 'nat_pat_lab', questions: NAT_PAT_DRILL_QUESTIONS },
  { lab: 'struktogramm_lab', questions: STRUKTOGRAMM_DRILL_QUESTIONS },
  { lab: 'testverfahren_lab', questions: TESTVERFAHREN_DRILL_QUESTIONS },
  { lab: 'usv_calculator_lab', questions: USV_DRILL_QUESTIONS },
  { lab: 'vlan_trunking_lab', questions: VLAN_DRILL_QUESTIONS },
  { lab: 'wiso_angebotsvergleich_lab', questions: WISO_ANGEBOTSVERGLEICH_DRILL },
  { lab: 'raid_calculator', questions: RAID_DRILL_QUESTIONS },
  { lab: 'wiso_liquiditaet_lab', questions: LIQUIDITAET_DRILL_QUESTIONS },
  { lab: 'wiso_andler', questions: ANDLER_DRILL_QUESTIONS },
  { lab: 'wiso_contribution_margin', questions: CONTRIBUTION_MARGIN_DRILL_QUESTIONS },
  { lab: 'kafka', questions: KAFKA_DRILL_QUESTIONS },
  { lab: 'wasm_rust_studio', questions: WASM_DRILL_QUESTIONS },
  { lab: 'docker', questions: DOCKER_DRILL_QUESTIONS },
  { lab: 'kubernetes', questions: K8S_DRILL_QUESTIONS },
  { lab: 'oauth_oidc', questions: OAUTH_OIDC_DRILL_QUESTIONS },
  { lab: 'cloud_devops', questions: CLOUD_DEVOPS_DRILL_QUESTIONS },
  { lab: 'uml_diagram', questions: IHK_CLASS_DRILL_QUESTIONS },
  { lab: 'websockets', questions: WEBSOCKETS_DRILL_QUESTIONS },
  { lab: 'wiso_bab_lab', questions: IHK_BAB_DRILL_QUESTIONS },
  { lab: 'dguv_v3_lab', questions: DGUV_V3_DRILL_QUESTIONS },
  { lab: 'bsi_grundschutz_lab', questions: BSI_GRUNDSCHUTZ_DRILL_QUESTIONS },
  { lab: 'ihk_dpia_lab', questions: DPIA_DRILL_QUESTIONS },
  { lab: 'ihk_tom_catalog_lab', questions: TOM_DRILL_QUESTIONS },
  { lab: 'cpm_network', questions: CPM_DRILL_QUESTIONS },
  { lab: 'nwa_scoring', questions: NWA_DRILL_QUESTIONS },
  { lab: 'tco_roi_lab', questions: TCO_DRILL_QUESTIONS },
  { lab: 'itsm_simulator', questions: ITSM_DRILL_QUESTIONS }
];

/** @type {Array<{ id: string, question: string, options: string[], correct: number, explanation: string }>} */
export const DRILL_QUESTIONS = SOURCES.flatMap((source) => normalizeDrillQuestions(source.questions)).map((q) => ({
  id: q.id,
  question: q.frage,
  options: q.optionen,
  correct: q.korrektIndex,
  explanation: q.erklaerung
}));

/** Frage-ID → Modul-ID des Labs, zu dem die Drill-Frage gehört. */
/** @type {Record<string, string>} */
export const DRILL_LAB_BY_QUESTION_ID = Object.fromEntries(
  SOURCES.flatMap((source) => source.questions.map((q) => [String(q.id), source.lab]))
);
