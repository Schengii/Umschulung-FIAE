// @ts-check
/**
 * WISO Calculations Utility
 * Handelskalkulation, Deckungsbeitrag, Break-Even-Point & Netzplantechnik (CPM)
 */

export function calculateVorwaertskalkulation({
  listeneinkaufspreis = 100,
  lieferantenrabattProzent = 10,
  lieferskontoProzent = 2,
  bezugskosten = 5,
  handlungskostenzuschlagProzent = 25,
  gewinnzuschlagProzent = 15,
  kundenskontoProzent = 2,
  kundenrabattProzent = 5,
  umsatzsteuerProzent = 19
}) {
  const rabattBetrag = (listeneinkaufspreis * lieferantenrabattProzent) / 100;
  const zieleinkaufspreis = listeneinkaufspreis - rabattBetrag;

  const skontoBetrag = (zieleinkaufspreis * lieferskontoProzent) / 100;
  const bareinkaufspreis = zieleinkaufspreis - skontoBetrag;

  const bezugspreis = bareinkaufspreis + Number(bezugskosten);

  const handlungskosten = (bezugspreis * handlungskostenzuschlagProzent) / 100;
  const selbstkosten = bezugspreis + handlungskosten;

  const gewinn = (selbstkosten * gewinnzuschlagProzent) / 100;
  const barverkaufspreis = selbstkosten + gewinn;

  // Im Verkauf ist Skonto im Zielverkaufspreis eingerechnet: Zielverkaufspreis = Barverkaufspreis / (1 - Skonto/100)
  const zielverkaufspreis = kundenskontoProzent >= 100 ? barverkaufspreis : (barverkaufspreis / (1 - kundenskontoProzent / 100));
  const kundenskontoBetrag = zielverkaufspreis - barverkaufspreis;

  // Kundenrabatt im Nettoverkaufspreis eingerechnet: Nettoverkaufspreis = Zielverkaufspreis / (1 - Rabatt/100)
  const nettoverkaufspreis = kundenrabattProzent >= 100 ? zielverkaufspreis : (zielverkaufspreis / (1 - kundenrabattProzent / 100));
  const kundenrabattBetrag = nettoverkaufspreis - zielverkaufspreis;

  const umsatzsteuer = (nettoverkaufspreis * umsatzsteuerProzent) / 100;
  const bruttoverkaufspreis = nettoverkaufspreis + umsatzsteuer;

  return {
    listeneinkaufspreis: Number(listeneinkaufspreis.toFixed(2)),
    rabattBetrag: Number(rabattBetrag.toFixed(2)),
    zieleinkaufspreis: Number(zieleinkaufspreis.toFixed(2)),
    skontoBetrag: Number(skontoBetrag.toFixed(2)),
    bareinkaufspreis: Number(bareinkaufspreis.toFixed(2)),
    bezugskosten: Number(bezugskosten),
    bezugspreis: Number(bezugspreis.toFixed(2)),
    handlungskosten: Number(handlungskosten.toFixed(2)),
    selbstkosten: Number(selbstkosten.toFixed(2)),
    gewinn: Number(gewinn.toFixed(2)),
    barverkaufspreis: Number(barverkaufspreis.toFixed(2)),
    kundenskontoBetrag: Number(kundenskontoBetrag.toFixed(2)),
    zielverkaufspreis: Number(zielverkaufspreis.toFixed(2)),
    kundenrabattBetrag: Number(kundenrabattBetrag.toFixed(2)),
    nettoverkaufspreis: Number(nettoverkaufspreis.toFixed(2)),
    umsatzsteuer: Number(umsatzsteuer.toFixed(2)),
    bruttoverkaufspreis: Number(bruttoverkaufspreis.toFixed(2))
  };
}

/**
 * Rückwärtskalkulation (Berechnung des maximal zulässigen Listeneinkaufspreises LEP ausgehend vom gegebenen Verkaufspreis)
 */
export function calculateRueckwaertskalkulation({
  bruttoverkaufspreis = 1485.45,
  umsatzsteuerProzent = 19,
  kundenrabattProzent = 5,
  kundenskontoProzent = 2,
  gewinnzuschlagProzent = 15,
  handlungskostenzuschlagProzent = 25,
  bezugskosten = 20,
  lieferskontoProzent = 2,
  lieferantenrabattProzent = 10
}) {
  const nettoverkaufspreis = umsatzsteuerProzent > 0 
    ? bruttoverkaufspreis / (1 + umsatzsteuerProzent / 100) 
    : bruttoverkaufspreis;
  const umsatzsteuer = bruttoverkaufspreis - nettoverkaufspreis;

  const kundenrabattBetrag = (nettoverkaufspreis * kundenrabattProzent) / 100;
  const zielverkaufspreis = nettoverkaufspreis - kundenrabattBetrag;

  const kundenskontoBetrag = (zielverkaufspreis * kundenskontoProzent) / 100;
  const barverkaufspreis = zielverkaufspreis - kundenskontoBetrag;

  const selbstkosten = gewinnzuschlagProzent > 0
    ? barverkaufspreis / (1 + gewinnzuschlagProzent / 100)
    : barverkaufspreis;
  const gewinn = barverkaufspreis - selbstkosten;

  const bezugspreis = handlungskostenzuschlagProzent > 0
    ? selbstkosten / (1 + handlungskostenzuschlagProzent / 100)
    : selbstkosten;
  const handlungskosten = selbstkosten - bezugspreis;

  const bareinkaufspreis = bezugspreis - Number(bezugskosten);

  // Bareinkaufspreis = Zieleinkaufspreis - Lieferskonto (Im Einkauf: Bar = Ziel * (1 - Skonto/100))
  const zieleinkaufspreis = lieferskontoProzent < 100
    ? bareinkaufspreis / (1 - lieferskontoProzent / 100)
    : bareinkaufspreis;
  const skontoBetrag = zieleinkaufspreis - bareinkaufspreis;

  // Zieleinkaufspreis = LEP - Lieferantenrabatt (Ziel = LEP * (1 - Rabatt/100))
  const maxListeneinkaufspreis = lieferantenrabattProzent < 100
    ? zieleinkaufspreis / (1 - lieferantenrabattProzent / 100)
    : zieleinkaufspreis;
  const rabattBetrag = maxListeneinkaufspreis - zieleinkaufspreis;

  return {
    bruttoverkaufspreis: Number(bruttoverkaufspreis.toFixed(2)),
    umsatzsteuer: Number(umsatzsteuer.toFixed(2)),
    nettoverkaufspreis: Number(nettoverkaufspreis.toFixed(2)),
    kundenrabattBetrag: Number(kundenrabattBetrag.toFixed(2)),
    zielverkaufspreis: Number(zielverkaufspreis.toFixed(2)),
    kundenskontoBetrag: Number(kundenskontoBetrag.toFixed(2)),
    barverkaufspreis: Number(barverkaufspreis.toFixed(2)),
    gewinn: Number(gewinn.toFixed(2)),
    selbstkosten: Number(selbstkosten.toFixed(2)),
    handlungskosten: Number(handlungskosten.toFixed(2)),
    bezugspreis: Number(bezugspreis.toFixed(2)),
    bezugskosten: Number(bezugskosten),
    bareinkaufspreis: Number(bareinkaufspreis.toFixed(2)),
    skontoBetrag: Number(skontoBetrag.toFixed(2)),
    zieleinkaufspreis: Number(zieleinkaufspreis.toFixed(2)),
    rabattBetrag: Number(rabattBetrag.toFixed(2)),
    maxListeneinkaufspreis: Number(maxListeneinkaufspreis.toFixed(2))
  };
}

/**
 * Differenzkalkulation (Berechnung des erzielbaren Gewinns bei vorgegebenem Einkaufs- und Verkaufspreis)
 */
export function calculateDifferenzkalkulation({
  listeneinkaufspreis = 1000,
  lieferantenrabattProzent = 10,
  lieferskontoProzent = 2,
  bezugskosten = 20,
  handlungskostenzuschlagProzent = 25,
  nettoverkaufspreis = 1250,
  kundenrabattProzent = 5,
  kundenskontoProzent = 2
}) {
  // Einkaufsteil -> Selbstkosten
  const rabattBetrag = (listeneinkaufspreis * lieferantenrabattProzent) / 100;
  const zieleinkaufspreis = listeneinkaufspreis - rabattBetrag;
  const skontoBetrag = (zieleinkaufspreis * lieferskontoProzent) / 100;
  const bareinkaufspreis = zieleinkaufspreis - skontoBetrag;
  const bezugspreis = bareinkaufspreis + Number(bezugskosten);
  const handlungskosten = (bezugspreis * handlungskostenzuschlagProzent) / 100;
  const selbstkosten = bezugspreis + handlungskosten;

  // Verkaufsteil von oben -> Barverkaufspreis
  const kundenrabattBetrag = (nettoverkaufspreis * kundenrabattProzent) / 100;
  const zielverkaufspreis = nettoverkaufspreis - kundenrabattBetrag;
  const kundenskontoBetrag = (zielverkaufspreis * kundenskontoProzent) / 100;
  const barverkaufspreis = zielverkaufspreis - kundenskontoBetrag;

  // Differenz ist der erzielbare Gewinn
  const erzielbarerGewinnBetrag = barverkaufspreis - selbstkosten;
  const gewinnsatzProzent = selbstkosten > 0 ? (erzielbarerGewinnBetrag / selbstkosten) * 100 : 0;

  return {
    selbstkosten: Number(selbstkosten.toFixed(2)),
    barverkaufspreis: Number(barverkaufspreis.toFixed(2)),
    erzielbarerGewinnBetrag: Number(erzielbarerGewinnBetrag.toFixed(2)),
    gewinnsatzProzent: Number(gewinnsatzProzent.toFixed(2)),
    isRentabel: erzielbarerGewinnBetrag > 0
  };
}

export function calculateDeckungsbeitrag({
  verkaufspreisStueck = 50,
  variableKostenStueck = 20,
  fixkostenGesamt = 15000,
  absetzbareMenge = 800
}) {
  const deckungsbeitragStueck = verkaufspreisStueck - variableKostenStueck;
  const deckungsbeitragGesamt = deckungsbeitragStueck * absetzbareMenge;
  const breakEvenPoint = deckungsbeitragStueck > 0 ? Math.ceil(fixkostenGesamt / deckungsbeitragStueck) : 0;
  const gewinnOderVerlust = deckungsbeitragGesamt - fixkostenGesamt;
  const deckungsbeitragsquoteProzent = verkaufspreisStueck > 0 ? (deckungsbeitragStueck / verkaufspreisStueck) * 100 : 0;

  return {
    deckungsbeitragStueck: Number(deckungsbeitragStueck.toFixed(2)),
    deckungsbeitragGesamt: Number(deckungsbeitragGesamt.toFixed(2)),
    breakEvenPoint,
    gewinnOderVerlust: Number(gewinnOderVerlust.toFixed(2)),
    deckungsbeitragsquoteProzent: Number(deckungsbeitragsquoteProzent.toFixed(1))
  };
}

/**
 * @typedef {object} NetzplanNodeInput
 * @property {string} id
 * @property {number|string} dauer
 * @property {string[]} [vorgaenger]
 *
 * @typedef {NetzplanNodeInput & { dauer: number, vorgaenger: string[], nachfolger: string[], faz: number, fez: number, saz: number, sez: number, gp: number, fp: number, isKritisch: boolean }} NetzplanNode
 */

/**
 * Netzplantechnik (CPM): Vorwärts-/Rückwärtsrechnung mit FAZ/FEZ/SAZ/SEZ,
 * Gesamtpuffer (GP), freiem Puffer (FP) und kritischem Pfad.
 * @param {NetzplanNodeInput[]} [nodes]
 * @returns {{ projektdauer: number, nodes: NetzplanNode[] }}
 */
export function calculateNetzplan(nodes = []) {
  /** @type {Record<string, NetzplanNode>} */
  const nodeMap = {};
  nodes.forEach(n => {
    nodeMap[n.id] = {
      ...n,
      dauer: Number(n.dauer),
      vorgaenger: Array.isArray(n.vorgaenger) ? n.vorgaenger : [],
      nachfolger: /** @type {string[]} */ ([]),
      faz: 0,
      fez: 0,
      saz: 0,
      sez: 0,
      gp: 0,
      fp: 0,
      isKritisch: false
    };
  });

  Object.values(nodeMap).forEach(n => {
    n.vorgaenger.forEach(vId => {
      if (nodeMap[vId]) {
        nodeMap[vId].nachfolger.push(n.id);
      }
    });
  });

  const visited = new Set();
  const forwardQueue = Object.values(nodeMap).filter(n => n.vorgaenger.length === 0);

  const calculateForward = (/** @type {string} */ nodeId) => {
    const node = nodeMap[nodeId];
    if (!node) return;
    if (node.vorgaenger.length === 0) {
      node.faz = 0;
    } else {
      let maxFez = 0;
      node.vorgaenger.forEach(vId => {
        if (nodeMap[vId]) {
          maxFez = Math.max(maxFez, nodeMap[vId].fez);
        }
      });
      node.faz = maxFez;
    }
    node.fez = node.faz + node.dauer;
    visited.add(nodeId);

    node.nachfolger.forEach(nachId => {
      const nachNode = nodeMap[nachId];
      if (nachNode && nachNode.vorgaenger.every(v => visited.has(v))) {
        calculateForward(nachId);
      }
    });
  };

  forwardQueue.forEach(n => calculateForward(n.id));

  let maxProjektdauer = 0;
  Object.values(nodeMap).forEach(n => {
    maxProjektdauer = Math.max(maxProjektdauer, n.fez);
  });

  const backwardQueue = Object.values(nodeMap).filter(n => n.nachfolger.length === 0);
  const backwardVisited = new Set();

  const calculateBackward = (/** @type {string} */ nodeId) => {
    const node = nodeMap[nodeId];
    if (!node) return;

    if (node.nachfolger.length === 0) {
      node.sez = maxProjektdauer;
    } else {
      let minSaz = Infinity;
      node.nachfolger.forEach(nachId => {
        if (nodeMap[nachId]) {
          minSaz = Math.min(minSaz, nodeMap[nachId].saz);
        }
      });
      node.sez = minSaz === Infinity ? maxProjektdauer : minSaz;
    }

    node.saz = node.sez - node.dauer;
    node.gp = node.saz - node.faz;

    if (node.nachfolger.length === 0) {
      node.fp = maxProjektdauer - node.fez;
    } else {
      let minNachfolgerFaz = Infinity;
      node.nachfolger.forEach(nachId => {
        if (nodeMap[nachId]) {
          minNachfolgerFaz = Math.min(minNachfolgerFaz, nodeMap[nachId].faz);
        }
      });
      node.fp = minNachfolgerFaz - node.fez;
    }

    node.isKritisch = node.gp === 0;
    backwardVisited.add(nodeId);

    node.vorgaenger.forEach(vId => {
      const vNode = nodeMap[vId];
      if (vNode && vNode.nachfolger.every(nach => backwardVisited.has(nach))) {
        calculateBackward(vId);
      }
    });
  };

  backwardQueue.forEach(n => calculateBackward(n.id));

  return {
    projektdauer: maxProjektdauer,
    nodes: Object.values(nodeMap)
  };
}
