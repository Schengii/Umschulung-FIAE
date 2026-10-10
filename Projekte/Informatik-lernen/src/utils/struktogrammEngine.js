// @ts-check
/**
 * @file struktogrammEngine.js
 * DIN 66261 Nassi-Shneiderman Struktogramm Engine & Schreibtischtest Trace-Simulator.
 * Unterstützt Sequenzen, Verzweigungen (IF-THEN-ELSE), Mehrfachauswahl (CASE),
 * kopfgesteuerte Schleifen (WHILE), fußgesteuerte Schleifen (DO-WHILE) und Zählschleifen (FOR).
 */

/**
 * @typedef {'sequence' | 'branch' | 'case' | 'while' | 'do_while' | 'for'} StruktogrammElementType
 * 
 * @typedef {object} StruktogrammNode
 * @property {string} id
 * @property {StruktogrammElementType} type
 * @property {string} [text]
 * @property {string} [condition]
 * @property {StruktogrammNode[]} [children]
 * @property {StruktogrammNode[]} [thenBranch]
 * @property {StruktogrammNode[]} [elseBranch]
 * @property {Array<{ label: string, nodes: StruktogrammNode[] }>} [cases]
 * @property {string} [variable]
 * @property {number} [from]
 * @property {number} [to]
 * @property {number} [step]
 */

/**
 * @typedef {object} TraceStep
 * @property {number} stepNumber
 * @property {string} action
 * @property {Record<string, any>} variables
 * @property {string} [nodeId]
 * @property {string} description
 */

/**
 * Vordefinierte IHK-Prüfungsszenarien für Struktogramme
 */
export const STRUKTOGRAMM_PRESETS = [
  {
    id: 'rabatt_staffel',
    title: 'IHK AP1 Klassiker: Rabattstaffelung nach Bestellwert',
    description: 'Berechnet den Rabattbetrag und Endpreis anhand des Bestellwerts (>= 500€: 10%, >= 200€: 5%, sonst 0%).',
    initialVariables: { bestellwert: 350, rabattsatz: 0, rabattbetrag: 0, endpreis: 0 },
    testCases: [
      { input: { bestellwert: 150 }, expected: { rabattsatz: 0, rabattbetrag: 0, endpreis: 150 } },
      { input: { bestellwert: 300 }, expected: { rabattsatz: 5, rabattbetrag: 15, endpreis: 285 } },
      { input: { bestellwert: 600 }, expected: { rabattsatz: 10, rabattbetrag: 60, endpreis: 540 } }
    ],
    root: {
      id: 'root',
      type: 'sequence',
      children: [
        { id: 'n1', type: 'sequence', text: 'Eingabe: bestellwert' },
        {
          id: 'n2',
          type: 'branch',
          condition: 'bestellwert >= 500',
          thenBranch: [
            { id: 'n2_then', type: 'sequence', text: 'rabattsatz = 10' }
          ],
          elseBranch: [
            {
              id: 'n3',
              type: 'branch',
              condition: 'bestellwert >= 200',
              thenBranch: [
                { id: 'n3_then', type: 'sequence', text: 'rabattsatz = 5' }
              ],
              elseBranch: [
                { id: 'n3_else', type: 'sequence', text: 'rabattsatz = 0' }
              ]
            }
          ]
        },
        { id: 'n4', type: 'sequence', text: 'rabattbetrag = (bestellwert * rabattsatz) / 100' },
        { id: 'n5', type: 'sequence', text: 'endpreis = bestellwert - rabattbetrag' },
        { id: 'n6', type: 'sequence', text: 'Ausgabe: rabattbetrag, endpreis' }
      ]
    }
  },
  {
    id: 'maximum_suche',
    title: 'IHK AP2 Klassiker: Maximum-Suche in Zahlenreihe',
    description: 'Ermittelt das Maximum einer 4-elementigen Zahlenfolge mit Zählschleife (FOR).',
    initialVariables: { array: [12, 45, 8, 32], max: 0, i: 0 },
    testCases: [
      { input: { array: [5, 19, 3, 14] }, expected: { max: 19 } },
      { input: { array: [99, 12, 40, 88] }, expected: { max: 99 } }
    ],
    root: {
      id: 'root',
      type: 'sequence',
      children: [
        { id: 'n1', type: 'sequence', text: 'Eingabe: Zahlenreihe werte[0..3]' },
        { id: 'n2', type: 'sequence', text: 'max = werte[0]' },
        {
          id: 'n3',
          type: 'for',
          variable: 'i',
          from: 1,
          to: 3,
          step: 1,
          text: 'Zähle i von 1 bis 3',
          children: [
            {
              id: 'n3_branch',
              type: 'branch',
              condition: 'werte[i] > max',
              thenBranch: [
                { id: 'n3_update', type: 'sequence', text: 'max = werte[i]' }
              ],
              elseBranch: [
                { id: 'n3_skip', type: 'sequence', text: 'Tue nichts' }
              ]
            }
          ]
        },
        { id: 'n4', type: 'sequence', text: 'Ausgabe: max' }
      ]
    }
  },
  {
    id: 'zinseszins_verdopplung',
    title: 'IHK WISO/FIAE: Kapitalverdopplung mit WHILE-Schleife',
    description: 'Kopfgesteuerte Schleife zur Ermittlung der Jahre, bis sich ein Startkapital bei festem Zinssatz p verdoppelt.',
    initialVariables: { startkapital: 1000, kapital: 1000, p: 5, jahre: 0 },
    testCases: [
      { input: { startkapital: 1000, p: 7 }, expected: { jahre: 11 } },
      { input: { startkapital: 1000, p: 10 }, expected: { jahre: 8 } }
    ],
    root: {
      id: 'root',
      type: 'sequence',
      children: [
        { id: 'n1', type: 'sequence', text: 'kapital = startkapital; jahre = 0' },
        {
          id: 'n2',
          type: 'while',
          condition: 'kapital < startkapital * 2',
          text: 'Solange kapital < startkapital * 2',
          children: [
            { id: 'n2_calc', type: 'sequence', text: 'kapital = kapital * (1 + p / 100)' },
            { id: 'n2_inc', type: 'sequence', text: 'jahre = jahre + 1' }
          ]
        },
        { id: 'n3', type: 'sequence', text: 'Ausgabe: jahre, kapital' }
      ]
    }
  }
];

/**
 * Führt einen Schreibtischtest (Trace Table) für das Rabattstaffel-Szenario aus.
 * @param {number} bestellwert
 * @returns {TraceStep[]}
 */
export function traceRabattStaffel(bestellwert) {
  /** @type {TraceStep[]} */
  const steps = [];
  /** @type {Record<string, any>} */
  const vars = { bestellwert, rabattsatz: 0, rabattbetrag: 0, endpreis: 0 };

  steps.push({
    stepNumber: 1,
    action: 'Eingabe',
    variables: { ...vars },
    nodeId: 'n1',
    description: `Bestellwert wird mit ${bestellwert} € initialisiert.`
  });

  const cond1 = bestellwert >= 500;
  steps.push({
    stepNumber: 2,
    action: 'Bedingung',
    variables: { ...vars },
    nodeId: 'n2',
    description: `Prüfe 'bestellwert >= 500': ${bestellwert} >= 500 ist ${cond1 ? 'WAHR (Ja)' : 'FALSCH (Nein)'}.`
  });

  if (cond1) {
    vars.rabattsatz = 10;
    steps.push({
      stepNumber: 3,
      action: 'Zuweisung',
      variables: { ...vars },
      nodeId: 'n2_then',
      description: '10% Rabattsatz gewährt.'
    });
  } else {
    const cond2 = bestellwert >= 200;
    steps.push({
      stepNumber: 3,
      action: 'Bedingung',
      variables: { ...vars },
      nodeId: 'n3',
      description: `Prüfe 'bestellwert >= 200': ${bestellwert} >= 200 ist ${cond2 ? 'WAHR (Ja)' : 'FALSCH (Nein)'}.`
    });

    if (cond2) {
      vars.rabattsatz = 5;
      steps.push({
        stepNumber: 4,
        action: 'Zuweisung',
        variables: { ...vars },
        nodeId: 'n3_then',
        description: '5% Rabattsatz gewährt.'
      });
    } else {
      vars.rabattsatz = 0;
      steps.push({
        stepNumber: 4,
        action: 'Zuweisung',
        variables: { ...vars },
        nodeId: 'n3_else',
        description: 'Kein Rabatt gewährt (0%).'
      });
    }
  }

  vars.rabattbetrag = Math.round(((bestellwert * vars.rabattsatz) / 100) * 100) / 100;
  steps.push({
    stepNumber: steps.length + 1,
    action: 'Berechnung',
    variables: { ...vars },
    nodeId: 'n4',
    description: `rabattbetrag = (${bestellwert} * ${vars.rabattsatz}) / 100 = ${vars.rabattbetrag} €.`
  });

  vars.endpreis = Math.round((bestellwert - vars.rabattbetrag) * 100) / 100;
  steps.push({
    stepNumber: steps.length + 1,
    action: 'Berechnung',
    variables: { ...vars },
    nodeId: 'n5',
    description: `endpreis = ${bestellwert} - ${vars.rabattbetrag} = ${vars.endpreis} €.`
  });

  steps.push({
    stepNumber: steps.length + 1,
    action: 'Ausgabe',
    variables: { ...vars },
    nodeId: 'n6',
    description: `Fertig. Endpreis beträgt ${vars.endpreis} € bei ${vars.rabattsatz}% Rabatt.`
  });

  return steps;
}

/**
 * Führt einen Schreibtischtest für die Maximum-Suche aus.
 * @param {number[]} werte
 * @returns {TraceStep[]}
 */
export function traceMaximumSuche(werte) {
  if (!werte || werte.length === 0) return [];
  /** @type {TraceStep[]} */
  const steps = [];
  const vars = { werte: [...werte], max: werte[0], i: 0 };

  steps.push({
    stepNumber: 1,
    action: 'Initialisierung',
    variables: { ...vars, werte: [...werte] },
    nodeId: 'n2',
    description: `max wird auf den ersten Wert werte[0] = ${werte[0]} gesetzt.`
  });

  for (let i = 1; i < werte.length; i++) {
    vars.i = i;
    const isLarger = werte[i] > vars.max;
    steps.push({
      stepNumber: steps.length + 1,
      action: `Schleife i=${i}`,
      variables: { ...vars, werte: [...werte] },
      nodeId: 'n3_branch',
      description: `Durchlauf i=${i}: Prüfe werte[${i}] (${werte[i]}) > max (${vars.max}) -> ${isLarger ? 'WAHR' : 'FALSCH'}.`
    });

    if (isLarger) {
      vars.max = werte[i];
      steps.push({
        stepNumber: steps.length + 1,
        action: `Update max`,
        variables: { ...vars, werte: [...werte] },
        nodeId: 'n3_update',
        description: `Neues Maximum gefunden: max = ${vars.max}.`
      });
    }
  }

  steps.push({
    stepNumber: steps.length + 1,
    action: 'Ausgabe',
    variables: { ...vars, werte: [...werte] },
    nodeId: 'n4',
    description: `Schleife beendet. Das Maximum ist ${vars.max}.`
  });

  return steps;
}

/**
 * Führt einen Schreibtischtest für die Kapitalverdopplung (WHILE) aus.
 * @param {number} startkapital
 * @param {number} p - Zinssatz in Prozent
 * @returns {TraceStep[]}
 */
export function traceKapitalVerdopplung(startkapital, p) {
  /** @type {TraceStep[]} */
  const steps = [];
  const zielkapital = startkapital * 2;
  const vars = { startkapital, kapital: startkapital, p, jahre: 0 };

  steps.push({
    stepNumber: 1,
    action: 'Initialisierung',
    variables: { ...vars },
    nodeId: 'n1',
    description: `Startkapital: ${startkapital} €, Zielkapital: ${zielkapital} €, Zinssatz: ${p}%.`
  });

  while (vars.kapital < zielkapital && vars.jahre < 50) {
    steps.push({
      stepNumber: steps.length + 1,
      action: 'Bedingung',
      variables: { ...vars },
      nodeId: 'n2',
      description: `Jahr ${vars.jahre}: Kapital ${vars.kapital.toFixed(2)} € < Ziel ${zielkapital} € -> Schleife läuft weiter.`
    });

    vars.kapital = Math.round(vars.kapital * (1 + p / 100) * 100) / 100;
    vars.jahre += 1;

    steps.push({
      stepNumber: steps.length + 1,
      action: `Verzinsung Jahr ${vars.jahre}`,
      variables: { ...vars },
      nodeId: 'n2_calc',
      description: `Neues Kapital nach Jahr ${vars.jahre}: ${vars.kapital.toFixed(2)} €.`
    });
  }

  steps.push({
    stepNumber: steps.length + 1,
    action: 'Ausgabe',
    variables: { ...vars },
    nodeId: 'n3',
    description: `Ziel erreicht nach ${vars.jahre} Jahren mit ${vars.kapital.toFixed(2)} €.`
  });

  return steps;
}

/**
 * Validiert die DIN 66261 Normen-Definitionen
 */
export const DIN_66261_ELEMENTS = [
  {
    type: 'sequence',
    name: 'Lineare Struktur / Anweisungsblock',
    symbol: 'Rechteckiger Block',
    explanation: 'Aktionen werden sequenziell von oben nach unten ohne Verzweigung ausgeführt.'
  },
  {
    type: 'branch',
    name: 'Verzweigung / Alternative (IF-THEN-ELSE)',
    symbol: 'Dreiecke links/rechts mit Bedingung oben',
    explanation: 'Führt je nach Wahrheitswert der Bedingung den linken (Ja/True) oder rechten (Nein/False) Block aus.'
  },
  {
    type: 'case',
    name: 'Mehrfachauswahl (CASE / SWITCH)',
    symbol: 'Dachförmige Keile mit Fallunterscheidungen',
    explanation: 'Verzweigt in mehrere Pfade je nach Wert einer diskreten Selektorvariable.'
  },
  {
    type: 'while',
    name: 'Kopfgesteuerte Schleife (WHILE)',
    symbol: 'L-förmiger Balken mit Bedingung oben',
    explanation: 'Die Abbruch-/Fortsetzungsbedingung wird VOR dem ersten Durchlauf geprüft. Kann 0-mal durchlaufen werden.'
  },
  {
    type: 'do_while',
    name: 'Fußgesteuerte Schleife (DO-WHILE / REPEAT-UNTIL)',
    symbol: 'Umgekehrter L-Balken mit Bedingung unten',
    explanation: 'Die Prüfung erfolgt NACH dem Schleifenkörper. Wird MINDESTENS 1-mal durchlaufen.'
  },
  {
    type: 'for',
    name: 'Zählschleife (FOR)',
    symbol: 'Balken mit Start-, Endwert und Schrittweite',
    explanation: 'Wird eine vorab festgelegte Anzahl oft durchlaufen.'
  }
];

/**
 * IHK Prüfungsdrill Fragen für Nassi-Shneiderman & Schreibtischtest
 */
export const STRUKTOGRAMM_DRILL_QUESTIONS = [
  {
    id: 'str_1',
    frage: 'Welches Merkmal unterscheidet eine kopfgesteuerte Schleife (WHILE) von einer fußgesteuerten Schleife (DO-WHILE) nach DIN 66261?',
    optionen: [
      'Eine kopfgesteuerte Schleife kann 0-mal durchlaufen werden, wenn die Bedingung initial falsch ist.',
      'Eine fußgesteuerte Schleife darf keine Verzweigungen im Schleifenkörper enthalten.',
      'Eine kopfgesteuerte Schleife wird zwingend mindestens einmal ausgeführt.',
      'Fußgesteuerte Schleifen existieren in der DIN 66261 nicht.'
    ],
    korrektIndex: 0,
    erklaerung: 'Bei der kopfgesteuerten Schleife (WHILE) wird die Bedingung VOR dem ersten Betreten des Rumpfes geprüft. Ist sie sofort falsch, wird der Rumpf nie (0-mal) ausgeführt. Bei der fußgesteuerten Schleife wird der Rumpf mindestens 1-mal ausgeführt.'
  },
  {
    id: 'str_2',
    frage: 'Gegeben sei folgende Zählschleife: "Zähle i von 1 bis 5 mit Schrittweite 2". Wie viele Durchläufe finden statt und welche Werte nimmt i an?',
    optionen: [
      '5 Durchläufe mit den Werten 1, 2, 3, 4, 5',
      '3 Durchläufe mit den Werten 1, 3, 5',
      '2 Durchläufe mit den Werten 2, 4',
      'Endlosschleife, da 5 nicht durch 2 teilbar ist'
    ],
    korrektIndex: 1,
    erklaerung: 'Start bei 1. Nach Durchlauf 1: i = 1 + 2 = 3. Nach Durchlauf 2: i = 3 + 2 = 5. Nach Durchlauf 3: i = 5 + 2 = 7 (größer als Endwert 5 -> Abbruch). Insgesamt 3 Durchläufe.'
  },
  {
    id: 'str_3',
    frage: 'Was ist der primäre Zweck eines Schreibtischtests (Trace Table) in der IHK-Softwareentwicklung?',
    optionen: [
      'Die automatische Kompilierung von Quellcode in Bytecode.',
      'Das manuelle schrittweise Durchspielen eines Algorithmus mit Testdaten zur Verifikation von Variablenzuständen.',
      'Die Messung der Renderzeit von Benutzeroberflächen im Browser.',
      'Die Berechnung der zyklomatischen Komplexität nach McCabe.'
    ],
    korrektIndex: 1,
    erklaerung: 'Ein Schreibtischtest dient dazu, den logischen Ablauf und die Variablenbelegungen eines Algorithmus tabellarisch und reproduzierbar per Hand nachzuvollziehen, um Logik- oder Off-by-One-Fehler aufzudecken.'
  },
  {
    id: 'str_4',
    frage: 'Welches Symbol stellt in der DIN 66261 eine einseitige Verzweigung dar?',
    optionen: [
      'Ein Rechteck mit waagerechter Teilungslinie.',
      'Ein Dreieck oben mit Bedingung; auf der einen Seite steht die Aktion, die andere Seite bleibt leer (oder "leer").',
      'Ein Parallelogramm mit Ein- und Ausgabepfeilen.',
      'Eine Raute nach DIN 66001.'
    ],
    korrektIndex: 1,
    erklaerung: 'In der DIN 66261 teilt ein Dreieck den Block in "Ja" und "Nein". Bei einer einseitigen Verzweigung ist einer der beiden Zweige leer (bzw. enthält "leer" / keinen Befehl).'
  }
];
