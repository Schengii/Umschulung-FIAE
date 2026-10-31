import React, { useState, useMemo } from 'react';
import { calculateMaschinenstundensatz } from '../../utils/wisoMaschinenstundensatzEngine';

export default function WisoMaschinenstundensatzLab() {
  const [params, setParams] = useState({
    wiederbeschaffungswert: 120000,
    restwert: 0,
    nutzungsdauerJahre: 6,
    kalkZinssatzProzent: 8,
    jaehrlicheLaufstunden: 1600,
    raumflaecheQm: 25,
    raumkostensatzProQm: 120,
    leistungKw: 15,
    strompreisKwh: 0.35,
    instandhaltungProJahr: 3500,
    werkzeugkostenProJahr: 2000
  });

  const calculation = useMemo(() => {
    return calculateMaschinenstundensatz(params);
  }, [params]);

  const handleChange = (field, value) => {
    setParams(prev => ({
      ...prev,
      [field]: Number(value) || 0
    }));
  };

  const loadPreset = (preset) => {
    if (preset === 'server-cluster') {
      setParams({
        wiederbeschaffungswert: 85000,
        restwert: 5000,
        nutzungsdauerJahre: 4,
        kalkZinssatzProzent: 6,
        jaehrlicheLaufstunden: 8760, // 24/7 Betrieb
        raumflaecheQm: 15,
        raumkostensatzProQm: 240, // Rechenzentrum m²
        leistungKw: 8,
        strompreisKwh: 0.42,
        instandhaltungProJahr: 4200,
        werkzeugkostenProJahr: 800
      });
    } else if (preset === 'cnc-fraese') {
      setParams({
        wiederbeschaffungswert: 250000,
        restwert: 25000,
        nutzungsdauerJahre: 8,
        kalkZinssatzProzent: 7,
        jaehrlicheLaufstunden: 2000,
        raumflaecheQm: 40,
        raumkostensatzProQm: 90,
        leistungKw: 30,
        strompreisKwh: 0.32,
        instandhaltungProJahr: 8500,
        werkzeugkostenProJahr: 12000
      });
    } else {
      // standard ihk prüfung
      setParams({
        wiederbeschaffungswert: 120000,
        restwert: 0,
        nutzungsdauerJahre: 6,
        kalkZinssatzProzent: 8,
        jaehrlicheLaufstunden: 1600,
        raumflaecheQm: 25,
        raumkostensatzProQm: 120,
        leistungKw: 15,
        strompreisKwh: 0.35,
        instandhaltungProJahr: 3500,
        werkzeugkostenProJahr: 2000
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                IHK Kosten- und Leistungsrechnung (KLR)
              </span>
              <span className="text-xs text-slate-400">AP2 WISO Standard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Maschinenstundensatz-Rechner (MSS)
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Berechne kalkulatorische Abschreibung, Zinsen nach Durchschnittsmethode, Raum-, Energie-, Instandhaltungs- und Werkzeugkosten zur Ermittlung des exakten Stundensatzes einer Anlage oder IT-Infrastruktur.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadPreset('ihk-standard')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              IHK Standard-Aufgabe
            </button>
            <button
              onClick={() => loadPreset('server-cluster')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              24/7 RZ Server-Cluster
            </button>
            <button
              onClick={() => loadPreset('cnc-fraese')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Industrie-Maschine
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Inputs & Result Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Stammdaten & Laufzeit
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Wiederbeschaffungswert (€)
                </label>
                <input
                  type="number"
                  value={params.wiederbeschaffungswert}
                  onChange={(e) => handleChange('wiederbeschaffungswert', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Geschätzter Restwert (€)
                </label>
                <input
                  type="number"
                  value={params.restwert}
                  onChange={(e) => handleChange('restwert', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Nutzungsdauer (Jahre)
                </label>
                <input
                  type="number"
                  value={params.nutzungsdauerJahre}
                  onChange={(e) => handleChange('nutzungsdauerJahre', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Kalkulatorischer Zinssatz (% p.a.)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={params.kalkZinssatzProzent}
                  onChange={(e) => handleChange('kalkZinssatzProzent', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Geplante jährliche Maschinenlaufzeit (Stunden / Jahr)
                </label>
                <input
                  type="number"
                  value={params.jaehrlicheLaufstunden}
                  onChange={(e) => handleChange('jaehrlicheLaufstunden', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              2. Raum-, Energie- & Betriebskosten
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Raumfläche (m²)
                </label>
                <input
                  type="number"
                  value={params.raumflaecheQm}
                  onChange={(e) => handleChange('raumflaecheQm', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Raumkostensatz (€ / m² / Jahr)
                </label>
                <input
                  type="number"
                  value={params.raumkostensatzProQm}
                  onChange={(e) => handleChange('raumkostensatzProQm', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Leistungsaufnahme (kW)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={params.leistungKw}
                  onChange={(e) => handleChange('leistungKw', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Strompreis (€ / kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={params.strompreisKwh}
                  onChange={(e) => handleChange('strompreisKwh', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Instandhaltungskosten (€ / Jahr)
                </label>
                <input
                  type="number"
                  value={params.instandhaltungProJahr}
                  onChange={(e) => handleChange('instandhaltungProJahr', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">
                  Werkzeugkosten (€ / Jahr)
                </label>
                <input
                  type="number"
                  value={params.werkzeugkostenProJahr}
                  onChange={(e) => handleChange('werkzeugkostenProJahr', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results & IHK Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Key Result Card */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
              Ergebnis Maschinenstundensatz
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black text-white font-mono">
                {calculation.maschinenstundensatzGesamt.toFixed(2)}
              </span>
              <span className="text-xl font-medium text-amber-300">€ / Stunde</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
              <span>Gesamtkosten pro Jahr:</span>
              <span className="font-semibold text-slate-200 font-mono">
                {calculation.maschinenkostenGesamtProJahr.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Kostenbestandteile pro Maschinenstunde
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-slate-300 font-medium">1. Kalk. Abschreibung</span>
                  <span className="block text-[10px] text-slate-500">(WBW - RW) / ND / Laufstunden</span>
                </div>
                <span className="font-mono text-amber-400 font-semibold">
                  {calculation.abschreibungProStunde.toFixed(2)} €/h
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-slate-300 font-medium">2. Kalk. Zinsen</span>
                  <span className="block text-[10px] text-slate-500">IHK Durchschnittsmethode ((WBW+RW)/2 * p)</span>
                </div>
                <span className="font-mono text-amber-400 font-semibold">
                  {calculation.zinsenProStunde.toFixed(2)} €/h
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-slate-300 font-medium">3. Raumkosten</span>
                  <span className="block text-[10px] text-slate-500">Fläche × Satz / Laufstunden</span>
                </div>
                <span className="font-mono text-cyan-400 font-semibold">
                  {calculation.raumkostenProStunde.toFixed(2)} €/h
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-slate-300 font-medium">4. Energiekosten</span>
                  <span className="block text-[10px] text-slate-500">kW × Strompreis</span>
                </div>
                <span className="font-mono text-cyan-400 font-semibold">
                  {calculation.energiekostenProStunde.toFixed(2)} €/h
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-slate-300 font-medium">5. Instandhaltung</span>
                  <span className="block text-[10px] text-slate-500">Jahreskosten / Laufstunden</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold">
                  {calculation.instandhaltungProStunde.toFixed(2)} €/h
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-slate-300 font-medium">6. Werkzeugkosten</span>
                  <span className="block text-[10px] text-slate-500">Jahreskosten / Laufstunden</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold">
                  {calculation.werkzeugkostenProStunde.toFixed(2)} €/h
                </span>
              </div>
            </div>
          </div>

          {/* IHK Formula Alert */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block">💡 IHK Prüfungstipp:</span>
            <p>
              In Prüfungsaufgaben wird für die kalkulatorischen Zinsen fast ausnahmslos die <strong>Durchschnittsmethode</strong> verlangt: 
              <span className="block font-mono text-[11px] text-amber-300 mt-1 bg-slate-900 p-1.5 rounded">
                Zinsen = ((Wiederbeschaffungswert + Restwert) / 2) × Zinssatz
              </span>
              Beachte außerdem: Maschinenstundensätze trennen maschinenabhängige Fertigungsgemeinkosten (FGK) von restlichen Fertigungsgemeinkosten (Rest-FGK).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
