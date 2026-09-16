import React, { useState } from 'react';

import { Calculator, TrendingUp, GitBranch, Scale, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { 
  calculateVorwaertskalkulation, 
  calculateDeckungsbeitrag, 
  calculateNetzplan 
} from '../../utils/wisoCalculations';
import { useStore } from '../../store/useStore';

export default function WisoKalkulationLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('handelskalkulation');
  const [completedQuizzes, setCompletedQuizzes] = useState({});
  const [headerXpClaimed, setHeaderXpClaimed] = useState(false);

  // Handelskalkulation State
  const [kalkParams, setKalkParams] = useState({
    listeneinkaufspreis: 1000,
    lieferantenrabattProzent: 10,
    lieferskontoProzent: 2,
    bezugskosten: 20,
    handlungskostenzuschlagProzent: 25,
    gewinnzuschlagProzent: 15,
    kundenskontoProzent: 2,
    kundenrabattProzent: 5,
    umsatzsteuerProzent: 19
  });

  const kalkResult = calculateVorwaertskalkulation(kalkParams);

  // Deckungsbeitrag State
  const [dbParams, setDbParams] = useState({
    verkaufspreisStueck: 50,
    variableKostenStueck: 20,
    fixkostenGesamt: 15000,
    absetzbareMenge: 800
  });

  const dbResult = calculateDeckungsbeitrag(dbParams);

  // Netzplan State
  const netzplanNodes = [
    { id: 'A', name: 'Projektinitialisierung & Kickoff', dauer: 3, vorgaenger: [] },
    { id: 'B', name: 'Anforderungsanalyse (Lastenheft)', dauer: 5, vorgaenger: ['A'] },
    { id: 'C', name: 'Systemarchitektur & DB-Design', dauer: 4, vorgaenger: ['B'] },
    { id: 'D', name: 'UI/UX Prototyping', dauer: 3, vorgaenger: ['B'] },
    { id: 'E', name: 'Backend & API Implementierung', dauer: 6, vorgaenger: ['C'] },
    { id: 'F', name: 'Frontend Entwicklung', dauer: 5, vorgaenger: ['D', 'C'] },
    { id: 'G', name: 'Integrationstest & Deployment', dauer: 3, vorgaenger: ['E', 'F'] }
  ];

  const netzplanResult = calculateNetzplan(netzplanNodes);

  // WISO Quiz Data
  const wisoQuestions = [
    {
      id: 'wiso_1',
      question: 'Ein Arbeitnehmer ist seit 4 Jahren im Betrieb beschäftigt. Welche gesetzliche Kündigungsfrist gilt für eine Kündigung durch den Arbeitgeber nach § 622 BGB?',
      options: [
        '4 Wochen zum Fünfzehnten oder zum Ende eines Kalendermonats',
        '1 Monat zum Ende eines Kalendermonats',
        '2 Monate zum Ende eines Kalendermonats',
        '3 Monate zum Ende eines Kalendermonats'
      ],
      correct: 1,
      explanation: 'Nach § 622 Abs. 2 Nr. 1 BGB beträgt die Kündigungsfrist bei 2 Jahren Betriebszugehörigkeit 1 Monat zum Ende eines Kalendermonats (ab 5 Jahren: 2 Monate).'
    },
    {
      id: 'wiso_2',
      question: 'Welches Organ vertritt die Interessen der Auszubildenden und jugendlichen Beschäftigten im Betrieb gegenüber dem Betriebsrat?',
      options: [
        'Die Gewerkschaftsjugend (GJ)',
        'Die Jugend- und Auszubildendenvertretung (JAV)',
        'Die IHK Prüfungskommission',
        'Der Schlichtungsausschuss der Agentur für Arbeit'
      ],
      correct: 1,
      explanation: 'Die JAV (nach BetrVG §§ 60 ff.) vertritt Jugendliche unter 18 und Azubis unter 25 Jahren und beantragt Maßnahmen beim Betriebsrat.'
    },
    {
      id: 'wiso_3',
      question: 'Was versteht man unter dem "Kritischen Pfad" in der Netzplantechnik?',
      options: [
        'Die Vorgänge mit dem höchsten finanziellen Budgetrisiko',
        'Die Kette von Vorgängen mit einem Gesamtpuffer von 0, die die minimale Projektdauer bestimmt',
        'Die Vorgänge, die zwingend von externen Lieferanten ausgeführt werden müssen',
        'Der Pfad mit der geringsten Anzahl an Mitarbeitern'
      ],
      correct: 1,
      explanation: 'Der Kritische Pfad besteht aus allen Vorgängen ohne zeitlichen Puffer (GP = 0, FP = 0). Jede Verzögerung hier verlängert unmittelbar das Gesamtprojekt.'
    }
  ];

  const handleQuizAnswer = (qId, selectedIdx) => {
    if (completedQuizzes[qId] !== undefined) return;
    const q = wisoQuestions.find(x => x.id === qId);
    const isCorrect = q.correct === selectedIdx;
    setCompletedQuizzes(prev => ({ ...prev, [qId]: { selected: selectedIdx, isCorrect } }));
    if (isCorrect) {
      awardXP(25, 'wiso_master');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                IHK & Wirtschaftsinformatik Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +100 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-400" />
              WISO & Handelskalkulations-Studio
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Interaktive Rechner für Handelskalkulation, Break-Even-Deckungsbeiträge, Netzplantechnik (CPM) und prüfungsrelevante Wirtschafts- & Arbeitsrechts-Fälle.
            </p>
          </div>
          <button
            onClick={() => { if (!headerXpClaimed) { setHeaderXpClaimed(true); awardXP(30, 'wiso_master'); } }}
            disabled={headerXpClaimed}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-lg shrink-0"
          >
            <Award className="w-4 h-4" />
            {headerXpClaimed ? 'XP gesichert!' : 'WISO XP sichern'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('handelskalkulation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'handelskalkulation'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Handelskalkulation (Vorwärts)
        </button>
        <button
          onClick={() => setActiveTab('deckungsbeitrag')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'deckungsbeitrag'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Deckungsbeitrag & Break-Even
        </button>
        <button
          onClick={() => setActiveTab('netzplan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'netzplan'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Netzplantechnik (Kritischer Pfad)
        </button>
        <button
          onClick={() => setActiveTab('wiso_recht')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'wiso_recht'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Scale className="w-4 h-4" />
          WISO-Arbeitsrecht & IHK-Fälle
        </button>
      </div>

      {/* Content Tab 1: Handelskalkulation */}
      {activeTab === 'handelskalkulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Eingabeparameter */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Eingabeparameter
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-slate-300 block mb-1">Listeneinkaufspreis (LEP in €)</label>
                <input
                  type="number"
                  value={kalkParams.listeneinkaufspreis}
                  onChange={(e) => setKalkParams({ ...kalkParams, listeneinkaufspreis: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Lieferantenrabatt (%)</label>
                  <input
                    type="number"
                    value={kalkParams.lieferantenrabattProzent}
                    onChange={(e) => setKalkParams({ ...kalkParams, lieferantenrabattProzent: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Lieferskonto (%)</label>
                  <input
                    type="number"
                    value={kalkParams.lieferskontoProzent}
                    onChange={(e) => setKalkParams({ ...kalkParams, lieferskontoProzent: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Bezugskosten (Fracht, Porto in €)</label>
                <input
                  type="number"
                  value={kalkParams.bezugskosten}
                  onChange={(e) => setKalkParams({ ...kalkParams, bezugskosten: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Handlungskosten (%)</label>
                  <input
                    type="number"
                    value={kalkParams.handlungskostenzuschlagProzent}
                    onChange={(e) => setKalkParams({ ...kalkParams, handlungskostenzuschlagProzent: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Gewinnzuschlag (%)</label>
                  <input
                    type="number"
                    value={kalkParams.gewinnzuschlagProzent}
                    onChange={(e) => setKalkParams({ ...kalkParams, gewinnzuschlagProzent: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Kundenskonto (%)</label>
                  <input
                    type="number"
                    value={kalkParams.kundenskontoProzent}
                    onChange={(e) => setKalkParams({ ...kalkParams, kundenskontoProzent: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Kundenrabatt (%)</label>
                  <input
                    type="number"
                    value={kalkParams.kundenrabattProzent}
                    onChange={(e) => setKalkParams({ ...kalkParams, kundenrabattProzent: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kalkulationsschema Ergebnis */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Kalkulationsschema (Schritt für Schritt)</span>
              <span className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                IHK Standard Schema
              </span>
            </h2>

            <div className="space-y-1.5 text-sm font-mono divide-y divide-slate-800">
              <div className="flex justify-between py-1 text-slate-200">
                <span>Listeneinkaufspreis (LEP):</span>
                <span className="font-bold">{kalkResult.listeneinkaufspreis.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-rose-400">
                <span>- Lieferantenrabatt ({kalkParams.lieferantenrabattProzent}%):</span>
                <span>- {kalkResult.rabattBetrag.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-slate-200 font-semibold">
                <span>= Zieleinkaufspreis (ZEP):</span>
                <span>{kalkResult.zieleinkaufspreis.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-rose-400">
                <span>- Lieferskonto ({kalkParams.lieferskontoProzent}%):</span>
                <span>- {kalkResult.skontoBetrag.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-slate-200">
                <span>= Bareinkaufspreis (BEP):</span>
                <span>{kalkResult.bareinkaufspreis.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-amber-400">
                <span>+ Bezugskosten:</span>
                <span>+ {kalkResult.bezugskosten.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-blue-300 font-bold">
                <span>= Bezugspreis (Einstandspreis):</span>
                <span>{kalkResult.bezugspreis.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-amber-400">
                <span>+ Handlungskosten ({kalkParams.handlungskostenzuschlagProzent}%):</span>
                <span>+ {kalkResult.handlungskosten.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-indigo-300 font-bold">
                <span>= Selbstkosten (SK):</span>
                <span>{kalkResult.selbstkosten.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-400">
                <span>+ Gewinnzuschlag ({kalkParams.gewinnzuschlagProzent}%):</span>
                <span>+ {kalkResult.gewinn.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-slate-200">
                <span>= Barverkaufspreis (BVP):</span>
                <span>{kalkResult.barverkaufspreis.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-400">
                <span>+ Kundenskonto ({kalkParams.kundenskontoProzent}% im Ziel):</span>
                <span>+ {kalkResult.kundenskontoBetrag.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-slate-200">
                <span>= Zielverkaufspreis (ZVP):</span>
                <span>{kalkResult.zielverkaufspreis.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-400">
                <span>+ Kundenrabatt ({kalkParams.kundenrabattProzent}% im Netto):</span>
                <span>+ {kalkResult.kundenrabattBetrag.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-amber-300 font-bold text-base">
                <span>= Nettoverkaufspreis (NVP):</span>
                <span>{kalkResult.nettoverkaufspreis.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 text-slate-400">
                <span>+ Umsatzsteuer ({kalkParams.umsatzsteuerProzent}%):</span>
                <span>+ {kalkResult.umsatzsteuer.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-2 text-emerald-400 font-bold text-lg bg-emerald-950/40 px-2 rounded">
                <span>= Bruttoverkaufspreis (BKP):</span>
                <span>{kalkResult.bruttoverkaufspreis.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab 2: Deckungsbeitrag & Break-Even */}
      {activeTab === 'deckungsbeitrag' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Kostendaten eingeben
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-slate-300 block mb-1">Verkaufspreis pro Stück (p in €)</label>
                <input
                  type="number"
                  value={dbParams.verkaufspreisStueck}
                  onChange={(e) => setDbParams({ ...dbParams, verkaufspreisStueck: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Variable Stückkosten (kv in €)</label>
                <input
                  type="number"
                  value={dbParams.variableKostenStueck}
                  onChange={(e) => setDbParams({ ...dbParams, variableKostenStueck: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Fixkosten gesamt (Kf in €)</label>
                <input
                  type="number"
                  value={dbParams.fixkostenGesamt}
                  onChange={(e) => setDbParams({ ...dbParams, fixkostenGesamt: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Absatzmenge (x Stück)</label>
                <input
                  type="number"
                  value={dbParams.absetzbareMenge}
                  onChange={(e) => setDbParams({ ...dbParams, absetzbareMenge: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
            <h2 className="text-lg font-bold text-white">Analyse & Gewinnschwelle</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block">Deckungsbeitrag / Stück (db)</span>
                <span className="text-2xl font-bold text-blue-400">{dbResult.deckungsbeitragStueck.toFixed(2)} €</span>
                <span className="text-xs text-slate-400 block mt-1">p - kv</span>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block">Break-Even-Point (Gewinnschwelle)</span>
                <span className="text-2xl font-bold text-amber-400">{dbResult.breakEvenPoint} Stück</span>
                <span className="text-xs text-slate-400 block mt-1">Kf / db</span>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block">Deckungsbeitrag Gesamt (DB)</span>
                <span className="text-2xl font-bold text-indigo-400">{dbResult.deckungsbeitragGesamt.toFixed(2)} €</span>
                <span className="text-xs text-slate-400 block mt-1">db × Menge</span>
              </div>
              <div className={`p-4 rounded-xl border ${
                dbResult.gewinnOderVerlust >= 0 
                  ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300' 
                  : 'bg-rose-950/50 border-rose-800 text-rose-300'
              }`}>
                <span className="text-xs block opacity-80">Betriebsergebnis (Gewinn/Verlust)</span>
                <span className="text-2xl font-bold">{dbResult.gewinnOderVerlust.toFixed(2)} €</span>
                <span className="text-xs block mt-1 opacity-80">DB - Kf</span>
              </div>
            </div>

            {/* Visual Progress toward Break Even */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Aktueller Absatz: {dbParams.absetzbareMenge} Stück</span>
                <span>Break-Even: {dbResult.breakEvenPoint} Stück</span>
              </div>
              <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    dbParams.absetzbareMenge >= dbResult.breakEvenPoint ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(100, dbResult.breakEvenPoint > 0 ? (dbParams.absetzbareMenge / dbResult.breakEvenPoint) * 100 : 0)}%`
                  }}
                />
              </div>
              <p className="text-xs text-slate-400">
                {dbParams.absetzbareMenge >= dbResult.breakEvenPoint
                  ? '🎉 Die Gewinnschwelle ist überschritten! Jeder weitere Verkauf generiert reinen Reingewinn in Höhe des Deckungsbeitrags.'
                  : `⚠️ Es fehlen noch ${dbResult.breakEvenPoint - dbParams.absetzbareMenge} Stück, um die Fixkosten vollständig zu decken.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab 3: Netzplantechnik */}
      {activeTab === 'netzplan' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-indigo-400" />
                  Netzplan-Berechnung (Critical Path Method - CPM)
                </h2>
                <p className="text-xs text-slate-400">
                  Automatische Vorwärts- und Rückwärtsrechnung zur Ermittlung von FAZ, FEZ, SAZ, SEZ und Puffern.
                </p>
              </div>
              <div className="px-4 py-2 bg-indigo-950/60 border border-indigo-700/50 rounded-xl text-right">
                <span className="text-xs text-indigo-300 block">Kritische Projektdauer</span>
                <span className="text-xl font-bold text-white">{netzplanResult.projektdauer} Tage</span>
              </div>
            </div>

            {/* Tabelle der Vorgänge */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 text-xs uppercase tracking-wider">
                    <th className="p-3 border-b border-slate-700">Vorgang</th>
                    <th className="p-3 border-b border-slate-700">Bezeichnung</th>
                    <th className="p-3 border-b border-slate-700">Dauer (D)</th>
                    <th className="p-3 border-b border-slate-700">Vorgänger</th>
                    <th className="p-3 border-b border-slate-700">FAZ</th>
                    <th className="p-3 border-b border-slate-700">FEZ</th>
                    <th className="p-3 border-b border-slate-700">SAZ</th>
                    <th className="p-3 border-b border-slate-700">SEZ</th>
                    <th className="p-3 border-b border-slate-700">GP</th>
                    <th className="p-3 border-b border-slate-700">FP</th>
                    <th className="p-3 border-b border-slate-700">Kritisch?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {netzplanResult.nodes.map((node) => (
                    <tr
                      key={node.id}
                      className={node.isKritisch ? 'bg-rose-950/20 text-rose-200' : 'text-slate-300 hover:bg-slate-800/40'}
                    >
                      <td className="p-3 font-bold">{node.id}</td>
                      <td className="p-3 font-sans text-xs">{node.name}</td>
                      <td className="p-3">{node.dauer}</td>
                      <td className="p-3 text-slate-400">{node.vorgaenger.join(', ') || '-'}</td>
                      <td className="p-3 text-blue-400 font-bold">{node.faz}</td>
                      <td className="p-3 text-blue-300 font-bold">{node.fez}</td>
                      <td className="p-3 text-amber-400">{node.saz}</td>
                      <td className="p-3 text-amber-300">{node.sez}</td>
                      <td className="p-3 font-bold">{node.gp}</td>
                      <td className="p-3">{node.fp}</td>
                      <td className="p-3 font-sans">
                        {node.isKritisch ? (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            JA (Kritisch)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Nein</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab 4: WISO-Arbeitsrecht & IHK-Fälle */}
      {activeTab === 'wiso_recht' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              IHK-Prüfungsfälle: Arbeitsrecht & Betriebswirtschaft
            </h2>
            <p className="text-sm text-slate-300">
              Teste dein Wissen in den klassischen IHK-Klausurfragen aus Wirtschafts- und Sozialkunde (AP Teil 1 & AP Teil 2).
            </p>

            <div className="space-y-4 mt-4">
              {wisoQuestions.map((q) => {
                const answerState = completedQuizzes[q.id];
                return (
                  <div key={q.id} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                    <h3 className="font-semibold text-slate-100 text-sm md:text-base">
                      {q.question}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((opt, idx) => {
                        let btnStyle = 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-500';
                        if (answerState) {
                          if (idx === q.correct) {
                            btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                          } else if (answerState.selected === idx) {
                            btnStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(q.id, idx)}
                            disabled={answerState !== undefined}
                            className={`p-3 rounded-lg border text-left text-xs md:text-sm transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {answerState && idx === q.correct && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {answerState && (
                      <div className="text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-slate-300">
                        <span className="font-bold text-amber-400">Erklärung: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
