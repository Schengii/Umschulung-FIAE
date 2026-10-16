import type { DiagnosisResult } from '../services/ai-types';

export interface FaultOption {
  id: string;
  label: string;
  nextNodeId: string;
}

export interface FaultNode {
  id: string;
  question: string;
  safetyHint?: string;
  options: FaultOption[];
  diagnosis?: DiagnosisResult; // Wenn gesetzt, ist dies ein Endknoten mit Ergebnis
}

export interface FaultTree {
  id: string;
  title: string;
  category: 'MOTOR' | 'DISTRIBUTION' | 'PV' | 'APPLIANCE';
  icon: string;
  description: string;
  rootNodeId: string;
  nodes: Record<string, FaultNode>;
}

export const FAULT_TREES: FaultTree[] = [
  {
    id: 'motor_tree',
    title: 'Elektromotor & Antriebe',
    category: 'MOTOR',
    icon: '⚙️',
    description: 'Motor brummt, läuft nicht an, überhitzt oder RCD löst aus.',
    rootNodeId: 'node_m1',
    nodes: {
      node_m1: {
        id: 'node_m1',
        question: 'Welches Symptom zeigt der Elektromotor?',
        safetyHint: '⚠️ Vor Messungen: Anlage spannungsfrei schalten oder isolierten Werkzeuge verwenden!',
        options: [
          { id: 'opt_m1_1', label: 'Motor brummt laut, dreht sich aber nicht', nextNodeId: 'node_m2' },
          { id: 'opt_m1_2', label: 'RCD / FI-Schalter löst beim Einschalten sofort aus', nextNodeId: 'node_m3' },
          { id: 'opt_m1_3', label: 'Motor läuft an, wird aber nach kurzer Zeit extrem heiß', nextNodeId: 'node_m4' },
        ],
      },
      node_m2: {
        id: 'node_m2',
        question: 'Liegt an allen drei Phasen L1, L2, L3 die volle Nennspannung (400V gegeneinander) an?',
        safetyHint: '⚡ Spannungsmessung mit zweipoligem Spannungsprüfer (Duspol) durchführen.',
        options: [
          { id: 'opt_m2_yes', label: 'Ja, alle 3 Phasen sind voll da (400V)', nextNodeId: 'node_m2_mech' },
          { id: 'opt_m2_no', label: 'Nein, eine Phase fehlt oder hat Unterspannung', nextNodeId: 'diag_m_phase_loss' },
        ],
      },
      node_m2_mech: {
        id: 'node_m2_mech',
        question: 'Lässt sich die Motorwelle im freigeschalteten Zustand leicht von Hand drehen?',
        options: [
          { id: 'opt_m2_mech_yes', label: 'Ja, Welle dreht leicht gängig', nextNodeId: 'diag_m_capacitor_or_winding' },
          { id: 'opt_m2_mech_no', label: 'Nein, Welle ist blockiert / schwergängig', nextNodeId: 'diag_m_bearing_blocked' },
        ],
      },
      node_m3: {
        id: 'node_m3',
        question: 'Wie hoch ist der Isolationswiderstand (R_ISO) der Motorwicklungen gegen Erde (PE)?',
        safetyHint: '⚡ Isolationsmessung mit 500V DC Prüfspannung nach DIN VDE 0100-600.',
        options: [
          { id: 'opt_m3_low', label: 'R_ISO < 1.0 MΩ (Isolationsfehler)', nextNodeId: 'diag_m_iso_fault' },
          { id: 'opt_m3_high', label: 'R_ISO ≥ 1.0 MΩ (Isolation in Ordnung)', nextNodeId: 'diag_m_rcd_surge' },
        ],
      },
      node_m4: {
        id: 'node_m4',
        question: 'Ist der aufgenommen Betriebsstrom auf allen Phasen symmetrisch und innerhalb des Typenschild-Nennstroms?',
        options: [
          { id: 'opt_m4_high', label: 'Strom übersteigt Nennstrom deutlich (Überlast)', nextNodeId: 'diag_m_overload' },
          { id: 'opt_m4_asym', label: 'Strome stark asymmetrisch zwischen den Phasen', nextNodeId: 'diag_m_winding_interturn' },
        ],
      },
      // Diagnosen
      diag_m_phase_loss: {
        id: 'diag_m_phase_loss',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: '3-Phasen Asynchronmotor',
          identifiedDefect: 'Phasenausfall / 2-Phasenlauf (Unterbrechung L1, L2 oder L3)',
          recommendation: 'Sicherung, Schütz-Hauptkontakte und Klemmenleiste überprüfen. Motor vor weiterem Betrieb schützen (Motorschutzschalter prüfen).',
          repairDifficulty: 2,
          safetyLevel: 'WARNING',
          estimatedRepairCost: '35 - 90 €',
          additionalTips: ['Zweipolige Messung vor Schütz und nach Schütz durchführen.', 'Motorschutzrelais auf Phasenausfall-Empfindlichkeit prüfen.'],
          sparePartSearchTerm: 'Motorschutzschalter 3-polig',
          customerExperience: 'Häufiger Fehler bei verschlissenen Schützkontakten oder durchgebrannter Schmelzsicherung.',
        },
      },
      diag_m_bearing_blocked: {
        id: 'diag_m_bearing_blocked',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Elektromotor Kugel- / Wälzlager',
          identifiedDefect: 'Mechanischer Lagerschaden / Fressspuren / Blockierte Welle',
          recommendation: 'Lagerschilde demontieren, Rillenkugellager (z.B. 6204-2Z) mit Abzieher erneuern oder Motor-Austausch vornehmen.',
          repairDifficulty: 3,
          safetyLevel: 'SAFE',
          estimatedRepairCost: '25 - 60 € (Eigenreparatur) / 180 € (Neumotor)',
          additionalTips: ['Beide Lager (A-Seite und B-Seite) gleichzeitig tauschen.', 'Passendes Lagerfett für Betriebstemperatur wählen.'],
          sparePartSearchTerm: 'Rillenkugellager 2Z C3',
          customerExperience: 'Mechanische Festsetzer führen schnell zu Wicklungsüberhitzung.',
        },
      },
      diag_m_capacitor_or_winding: {
        id: 'diag_m_capacitor_or_winding',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Wechselstrommotor / Betriebskondensator',
          identifiedDefect: 'Defekter / Kapazitätsloser Betriebskondensator oder Wicklungsunterbrechung',
          recommendation: 'Betriebskondensator mit Kapazitätsmessgerät prüfen und ggf. austauschen (z.B. 12µF 450V AC).',
          repairDifficulty: 1,
          safetyLevel: 'SAFE',
          estimatedRepairCost: '12 - 25 €',
          additionalTips: ['Kondensator vor Demontage über Widerstand entladen!', 'Spannungsfestigkeit (min. 450V AC) beachten.'],
          sparePartSearchTerm: 'Motorkondensator 450V mit Steckfahnen',
          customerExperience: 'Ein defekter Anlauf-/Betriebskondensator ist die Ursache bei >70% aller Wechselstrommotor-Anlaufprobleme.',
        },
      },
      diag_m_iso_fault: {
        id: 'diag_m_iso_fault',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Motorwicklungs-Isolierung',
          identifiedDefect: 'Isolationsdurchschlag / Körperschluss der Statorwicklung gegen Gehäuse (PE)',
          recommendation: 'Motor neu wickeln lassen (Neuwicklung) oder Stator/Gesamtmotor austauschen.',
          repairDifficulty: 4,
          safetyLevel: 'DANGER',
          estimatedRepairCost: '150 - 350 €',
          additionalTips: ['Feuchtigkeit im Klemmkasten vorher ausschließen und austrocknen.', 'Kabelzuführung auf Scheuerstellen prüfen.'],
          sparePartSearchTerm: 'IE3 Drehstrommotor 0.75kW',
          customerExperience: 'Bei R_ISO < 1 MΩ darf der Motor nach VDE 0100-600 nicht wieder zugeschaltet werden.',
        },
      },
      diag_m_rcd_surge: {
        id: 'diag_m_rcd_surge',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Frequenzumrichter / RCD Zuordnung',
          identifiedDefect: 'Kapazitive Ableitströme durch EMV-Filter / Schirmleitung lösen RCD aus',
          recommendation: 'RCD Typ F oder Typ B (allstromsensitiv) einsetzen oder Kurzzeitverzögerten RCD verwenden.',
          repairDifficulty: 2,
          safetyLevel: 'WARNING',
          estimatedRepairCost: '80 - 190 €',
          additionalTips: ['Kabellänge zwischen FU und Motor überprüfen.', 'Allstromsensitiven RCD Typ B nach VDE 0100-530 wählen.'],
          sparePartSearchTerm: 'FI-Schalter 40A 30mA Typ B allstromsensitiv',
          customerExperience: 'Standard RCDs Typ A lösen bei hochfrequenten Ableitströmen von Frequenzumrichtern fehlerhaft aus.',
        },
      },
      diag_m_overload: {
        id: 'diag_m_overload',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Mechanischer Antrieb / Arbeitsmaschine',
          identifiedDefect: 'Überlastung durch mechanische Verstopfung / Auslegungsfehler',
          recommendation: 'Angekoppelte Arbeitsmaschine (Pumpe, Gebläse, Getriebe) auf Festsetzung prüfen.',
          repairDifficulty: 2,
          safetyLevel: 'SAFE',
          estimatedRepairCost: '0 - 50 €',
          additionalTips: ['Strom mit Zangenstrommesser auf allen 3 Phasen messen.'],
          sparePartSearchTerm: 'Zangenstrommesser True-RMS',
          customerExperience: 'Meist liegt die Ursache nicht im Motor, sondern im verstopften Fördergut.',
        },
      },
      diag_m_winding_interturn: {
        id: 'diag_m_winding_interturn',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Statorwicklung',
          identifiedDefect: 'Windungsschluss innerhalb einer Phasenwicklung',
          recommendation: 'Wicklungswiderstand aller 3 Phasen messen (U1-U2, V1-V2, W1-W2). Motor erneuern.',
          repairDifficulty: 4,
          safetyLevel: 'WARNING',
          estimatedRepairCost: '120 - 300 €',
          additionalTips: ['Widerstandsunterschiede > 5% deuten auf Windungsschluss hin.'],
          sparePartSearchTerm: 'Drehstrommotor 400V B3',
          customerExperience: 'Ein Windungsschluss führt zu starker lokaler Erwärmung und schmilzt den Isolierlack.',
        },
      },
    },
  },
  {
    id: 'distribution_tree',
    title: 'Schaltschrank & RCD / FI-Schutz',
    category: 'DISTRIBUTION',
    icon: '🔌',
    description: 'FI-Schalter löst aus, Hauptsicherung fliegt oder Schütz klappert.',
    rootNodeId: 'node_d1',
    nodes: {
      node_d1: {
        id: 'node_d1',
        question: 'Was genau ist die Störung im Schaltschrank / Verteilung?',
        safetyHint: '⚠️ Arbeiten in Verteilungen erfordern Abdeckung unter Spannung stehender Teile!',
        options: [
          { id: 'opt_d1_rcd', label: 'RCD / FI-Schalter (30mA) lässt sich nicht mehr einschalten', nextNodeId: 'node_d2' },
          { id: 'opt_d1_mcb', label: 'Leitungsschutzschalter (LS) fliegt sofort beim Einschalten', nextNodeId: 'node_d3' },
          { id: 'opt_d1_contactor', label: 'Schütz klappert, brummt oder fällt sporadisch ab', nextNodeId: 'node_d4' },
        ],
      },
      node_d2: {
        id: 'node_d2',
        question: 'Löst der RCD auch dann aus, wenn ALLE nachgeschalteten Leitungsschutzschalter ausgeschaltet sind?',
        options: [
          { id: 'opt_d2_yes', label: 'Ja, RCD löst selbst bei ausgeschalteten LS-Schaltern aus', nextNodeId: 'diag_d_n_pe_bridge' },
          { id: 'opt_d2_no', label: 'Nein, RCD hält. Er löst erst bei einem bestimmten LS-Schalter aus', nextNodeId: 'diag_d_subcircuit_leak' },
        ],
      },
      node_d3: {
        id: 'node_d3',
        question: 'Löst der LS-Schalter sofort elektromagnetisch (Kurzschluss) oder thermisch nach Minuten (Überlast) aus?',
        options: [
          { id: 'opt_d3_short', label: 'Sofortiger Knall / Auslösung ohne Verzögerung (Kurzschluss)', nextNodeId: 'diag_d_short_circuit' },
          { id: 'opt_d3_thermal', label: 'Löst erst nach einigen Minuten unter Last aus (Überlast)', nextNodeId: 'diag_d_overload_circuit' },
        ],
      },
      node_d4: {
        id: 'node_d4',
        question: 'Wie hoch ist die Steuerspannung an der Schützspule (A1 / A2) im eingeschalteten Zustand?',
        options: [
          { id: 'opt_d4_low', label: 'Steuerspannung bricht ein (<85% Nennspannung)', nextNodeId: 'diag_d_control_voltage_drop' },
          { id: 'opt_d4_ok', label: 'Steuerspannung ist stabil (230V bzw. 24V DC)', nextNodeId: 'diag_d_contactor_mechanical' },
        ],
      },
      // Diagnosen
      diag_d_n_pe_bridge: {
        id: 'diag_d_n_pe_bridge',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Neutralleiter N / PE Schiene',
          identifiedDefect: 'N-PE Kurzschluss / unzulässige N-PE Verbindung nach dem RCD',
          recommendation: 'N-Leiter aller Stromkreise abklemmen und R_ISO N gegen PE messen. Fehlerhaften N-Leiter lokalisieren.',
          repairDifficulty: 2,
          safetyLevel: 'WARNING',
          estimatedRepairCost: '45 - 90 €',
          additionalTips: ['Häufig verursachen feuchte Außenleuchten oder beschädigte Erdkabel N-PE Schlüsse.'],
          sparePartSearchTerm: 'Isolationsprüfgerät 1000V',
          customerExperience: 'Ein N-PE Schluss lässt den RCD auch bei ausgeschaltetem LS auslösen, da der Betriebs-N-Strom über PE zurückfließt.',
        },
      },
      diag_d_subcircuit_leak: {
        id: 'diag_d_subcircuit_leak',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Endstromkreis / Verbraucher',
          identifiedDefect: 'Erdschluss / Ableitstrom in einem spezifischen Endstromkreis',
          recommendation: 'Alle Verbraucher im betroffenen Stromkreis ausstecken. R_ISO L gegen PE messen.',
          repairDifficulty: 2,
          safetyLevel: 'SAFE',
          estimatedRepairCost: '30 - 75 €',
          additionalTips: ['Kaffeemaschinen, Heizstäbe und Außenbereich-Steckdosen zuerst prüfen.'],
          sparePartSearchTerm: 'FI-Schalter 40A 0.03A 4-polig',
          customerExperience: 'Typischer Summenableitstrom-Fehler bei mehreren angeschlossenen EDV-Geräten.',
        },
      },
      diag_d_short_circuit: {
        id: 'diag_d_short_circuit',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Leitungsschutz / Verbraucherleitung',
          identifiedDefect: 'L-N oder L-L Kurzschluss in der Installation',
          recommendation: 'Durchgangswiderstand R (L gegen N) stromlos messen. Kurzgesschlossenes Betriebsmittel bzw. Kabelstelle austauschen.',
          repairDifficulty: 2,
          safetyLevel: 'DANGER',
          estimatedRepairCost: '50 - 120 €',
          additionalTips: ['Sichtprüfung auf angebohrte Leitungen oder geschmolzene Klemmstellen.'],
          sparePartSearchTerm: 'Leitungsschutzschalter B16A 1-polig',
          customerExperience: 'Der Schnellauslöser des LS-Schalters schützt die Leitung vor Brand durch extrem hohe Kurzschlussströme.',
        },
      },
      diag_d_overload_circuit: {
        id: 'diag_d_overload_circuit',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Stromkreisabsicherung',
          identifiedDefect: 'Überlastung des Stromkreises (Gesamtstrom > LS-Nennstrom)',
          recommendation: 'Lastverteilung ändern oder Stromkreis aufteilen. Betriebsstrom mit Stromzange prüfen.',
          repairDifficulty: 1,
          safetyLevel: 'WARNING',
          estimatedRepairCost: '0 - 45 €',
          additionalTips: ['Keine mehrfachen Mehrfachsteckdosen hintereinander betreiben!'],
          sparePartSearchTerm: 'Zangenstrommesser AC/DC',
          customerExperience: 'Kombination aus Großverbrauchern (z.B. Wasserkocher + Waschmaschine an einer Phase) überlastet die B16-Sicherung.',
        },
      },
      diag_d_control_voltage_drop: {
        id: 'diag_d_control_voltage_drop',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Steuertrafo / 24V Netzteil',
          identifiedDefect: 'Spannungsfall im Steuerstromkreis / Überlastetes 24V DC Netzteil',
          recommendation: 'Netzteil-Ausgangsspannung prüfen. Steuerkabelquerschnitt und Hilfskontakte reinigen.',
          repairDifficulty: 2,
          safetyLevel: 'SAFE',
          estimatedRepairCost: '35 - 85 €',
          additionalTips: ['Pufferkondensator oder stärkeres Netzteil (z.B. 24V 5A) einbauen.'],
          sparePartSearchTerm: 'Hutschiene Netzteil 24V DC 5A',
          customerExperience: 'Einbrüche in der Steuerspannung lassen Schütze takten und zerstören die Hauptkontakte.',
        },
      },
      diag_d_contactor_mechanical: {
        id: 'diag_d_contactor_mechanical',
        question: 'Diagnose abgeschlossen',
        options: [],
        diagnosis: {
          deviceName: 'Leistungsschütz Hauptkontakte',
          identifiedDefect: 'Verschlissene/Verschweißte Hauptkontakte oder Magnetkern verschmutzt',
          recommendation: 'Schütz austauschen. Magnetkern von Staub reinigen.',
          repairDifficulty: 2,
          safetyLevel: 'WARNING',
          estimatedRepairCost: '25 - 65 €',
          additionalTips: ['Löschglied (RC-Glied) über der Schützspule installieren.'],
          sparePartSearchTerm: 'Leistungsschütz 3-polig 230V Spule 18A',
          customerExperience: 'Brummen entsteht meist durch Staub auf den Polflächen des Wechselstrom-Magnetkerns.',
        },
      },
    },
  },
];

export function getCategoryTrees(category?: string): FaultTree[] {
  if (!category) return FAULT_TREES;
  return FAULT_TREES.filter((t) => t.category === category);
}

export function getTreeNode(treeId: string, nodeId: string): FaultNode | null {
  const tree = FAULT_TREES.find((t) => t.id === treeId);
  if (!tree) return null;
  return tree.nodes[nodeId] || null;
}
