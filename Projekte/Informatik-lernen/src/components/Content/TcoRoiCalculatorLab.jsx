import React, { useState, useMemo } from 'react';

import { Calculator, TrendingUp, DollarSign, Cloud, Server, Award, Download, CheckCircle2, BarChart3 } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { calculateTcoAndRoi } from '../../utils/tcoCalculations';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function TcoRoiCalculatorLab() {
  const { awardXP } = useStore();
  const [xpClaimed, setXpClaimed] = useState(false);

  const [years, setYears] = useState(5);
  // On-Premises Inputs
  const [onPremHardwareCapex, setOnPremHardwareCapex] = useState(25000);
  const [onPremAnnualPowerCooling, setOnPremAnnualPowerCooling] = useState(2400);
  const [onPremAnnualLicensesMaintenance, setOnPremAnnualLicensesMaintenance] = useState(3500);
  const [onPremAdminHoursPerYear, setOnPremAdminHoursPerYear] = useState(120);
  const [onPremAdminHourlyRate, setOnPremAdminHourlyRate] = useState(80);

  // Cloud Inputs
  const [cloudOneTimeMigrationCost, setCloudOneTimeMigrationCost] = useState(6000);
  const [cloudMonthlyHosting, setCloudMonthlyHosting] = useState(550);
  const [cloudAdminHoursPerYear, setCloudAdminHoursPerYear] = useState(40);
  const [cloudAdminHourlyRate, setCloudAdminHourlyRate] = useState(80);

  const tcoResult = useMemo(() => {
    return calculateTcoAndRoi({
      years,
      onPremHardwareCapex,
      onPremAnnualPowerCooling,
      onPremAnnualLicensesMaintenance,
      onPremAdminHoursPerYear,
      onPremAdminHourlyRate,
      cloudOneTimeMigrationCost,
      cloudMonthlyHosting,
      cloudAdminHoursPerYear,
      cloudAdminHourlyRate
    });
  }, [
    years,
    onPremHardwareCapex,
    onPremAnnualPowerCooling,
    onPremAnnualLicensesMaintenance,
    onPremAdminHoursPerYear,
    onPremAdminHourlyRate,
    cloudOneTimeMigrationCost,
    cloudMonthlyHosting,
    cloudAdminHoursPerYear,
    cloudAdminHourlyRate
  ]);

  const handleExportJson = () => {
    const summary = {
      title: 'IHK Wirtschaftlichkeitsanalyse (TCO & ROI)',
      timestamp: new Date().toISOString(),
      parameters: {
        years,
        onPrem: { onPremHardwareCapex, onPremAnnualPowerCooling, onPremAnnualLicensesMaintenance, onPremAdminHoursPerYear, onPremAdminHourlyRate },
        cloud: { cloudOneTimeMigrationCost, cloudMonthlyHosting, cloudAdminHoursPerYear, cloudAdminHourlyRate }
      },
      results: tcoResult
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ihk-tco-roi-analyse-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundManager.playSFX('click');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-teal-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/30 text-teal-200 border border-teal-400/30">
                IHK Wirtschaftlichkeits-Studio (AP2 &amp; Projektarbeit)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +60 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Calculator className="w-8 h-8 text-teal-400" />
              TCO &amp; ROI Wirtschaftlichkeits-Simulator
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Vergleiche Total Cost of Ownership (On-Premises vs. Cloud-Migration) über mehrere Jahre mit Amortisationsmonat und ROI für IHK-Projekte.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportJson}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> JSON Export
            </button>
            <button
              onClick={() => { if (!xpClaimed) { setXpClaimed(true); awardXP(60, 'wiso_master'); } }}
              disabled={xpClaimed}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
            >
              <Award className="w-4 h-4" /> {xpClaimed ? 'XP gesichert!' : 'Analyse XP sichern'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* On-Prem TCO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-bold block flex items-center justify-center gap-1">
            <Server className="w-3.5 h-3.5 text-rose-400" /> On-Prem TCO ({years} J.)
          </span>
          <div className="text-xl md:text-2xl font-mono font-bold text-rose-400">
            {tcoResult.finalOnPremTco.toLocaleString('de-DE')} €
          </div>
        </div>

        {/* Cloud TCO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-bold block flex items-center justify-center gap-1">
            <Cloud className="w-3.5 h-3.5 text-cyan-400" /> Cloud TCO ({years} J.)
          </span>
          <div className="text-xl md:text-2xl font-mono font-bold text-cyan-400">
            {tcoResult.finalCloudTco.toLocaleString('de-DE')} €
          </div>
        </div>

        {/* Total Savings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-bold block flex items-center justify-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Gesamtersparnis
          </span>
          <div className="text-xl md:text-2xl font-mono font-bold text-emerald-400">
            {tcoResult.totalSavings.toLocaleString('de-DE')} €
          </div>
        </div>

        {/* ROI / Break-Even */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-bold block flex items-center justify-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> ROI &amp; Break-Even
          </span>
          <div className="text-lg md:text-xl font-mono font-bold text-amber-400">
            {tcoResult.roiPercentage}% / M. {tcoResult.breakEvenMonth || 'N/A'}
          </div>
        </div>
      </div>

      {/* Inputs vs Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cost Parameter Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-rose-400" />
              1. On-Premises Kostenparameter
            </h2>
            <div className="flex gap-1">
              {[3, 4, 5].map(y => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={`px-2.5 py-0.5 rounded text-xs font-bold transition ${
                    years === y ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {y} Jahre
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Hardware Anschaffung (CAPEX):</span>
                <span className="text-rose-300 font-mono font-bold">{onPremHardwareCapex.toLocaleString('de-DE')} €</span>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={1000}
                value={onPremHardwareCapex}
                onChange={(e) => setOnPremHardwareCapex(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Strom/Kühlung (€/Jahr):</label>
                <input
                  type="number"
                  value={onPremAnnualPowerCooling}
                  onChange={(e) => setOnPremAnnualPowerCooling(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Wartung/Lizenzen (€/Jahr):</label>
                <input
                  type="number"
                  value={onPremAnnualLicensesMaintenance}
                  onChange={(e) => setOnPremAnnualLicensesMaintenance(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Admin Stunden/Jahr:</label>
                <input
                  type="number"
                  value={onPremAdminHoursPerYear}
                  onChange={(e) => setOnPremAdminHoursPerYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Stundensatz (€/h):</label>
                <input
                  type="number"
                  value={onPremAdminHourlyRate}
                  onChange={(e) => setOnPremAdminHourlyRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Cloud Parameters */}
          <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" />
              2. Cloud Kostenparameter (AWS / Azure)
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Einmaliges Setup/Migration (€):</label>
                <input
                  type="number"
                  value={cloudOneTimeMigrationCost}
                  onChange={(e) => setCloudOneTimeMigrationCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Monatliches Hosting (€/M.):</label>
                <input
                  type="number"
                  value={cloudMonthlyHosting}
                  onChange={(e) => setCloudMonthlyHosting(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Cloud-Admin Std./Jahr:</label>
                <input
                  type="number"
                  value={cloudAdminHoursPerYear}
                  onChange={(e) => setCloudAdminHoursPerYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Stundensatz (€/h):</label>
                <input
                  type="number"
                  value={cloudAdminHourlyRate}
                  onChange={(e) => setCloudAdminHourlyRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Chart */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              Kumulierter Kostenverlauf über {years} Jahre
            </h2>
            <span className="text-xs text-slate-400 font-mono">in Euro (€)</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tcoResult.yearlyData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" textAnchor="middle" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value) => `${Number(value).toLocaleString('de-DE')} €`}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="onPremCost" name="On-Premises TCO" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="cloudCost" name="Cloud TCO" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* IHK Antrags-Empfehlung */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-300">
            <span className="font-bold text-teal-400 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Fazit für IHK-Projektdokumentation:
            </span>
            <p>
              Die Cloud-Migration führt nach {years} Jahren zu einer Gesamtersparnis von <strong className="text-white">{tcoResult.totalSavings.toLocaleString('de-DE')} €</strong> und amortisiert sich im <strong className="text-teal-300">Monat {tcoResult.breakEvenMonth || '1'}</strong> mit einem Return on Investment von <strong className="text-teal-300">{tcoResult.roiPercentage}%</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
