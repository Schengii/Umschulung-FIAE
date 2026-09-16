import React, { useMemo } from 'react';
import { Leaf, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Holding, EsgScoreResult } from '../types';

interface EsgAuditWidgetProps {
  holdings: Holding[];
}

export const EsgAuditWidget: React.FC<EsgAuditWidgetProps> = ({ holdings }) => {
  const esgData: EsgScoreResult = useMemo(() => {
    if (holdings.length === 0) {
      return {
        overallScore: 75,
        environmentalScore: 78,
        socialScore: 72,
        governanceScore: 76,
        ratingGrade: 'AA',
        controversies: []
      };
    }

    let weightedEnv = 0;
    let weightedSoc = 0;
    let weightedGov = 0;
    let totalWeight = 0;
    const controversiesSet = new Set<string>();

    holdings.forEach(h => {
      const weight = h.currentValue;
      totalWeight += weight;

      // Base scores by sector
      let env = 75;
      let soc = 75;
      let gov = 80;

      if (h.sector === 'Technology') { env = 85; soc = 80; gov = 85; }
      else if (h.sector === 'Healthcare') { env = 80; soc = 90; gov = 85; }
      else if (h.sector === 'Utilities' || h.sector === 'Energy') { env = 55; soc = 65; gov = 70; }
      else if (h.sector === 'Financials') { env = 70; soc = 75; gov = 80; }

      // Check controversial tickers / names
      const lowerName = (h.name + ' ' + h.ticker).toLowerCase();
      if (lowerName.includes('shell') || lowerName.includes('exxon') || lowerName.includes('bp') || lowerName.includes('total')) {
        env -= 30;
        controversiesSet.add('Fossile Brennstoffe / Öl & Gas Exploration');
      }
      if (lowerName.includes('rheinmetall') || lowerName.includes('lockheed') || lowerName.includes('boeing')) {
        soc -= 25;
        controversiesSet.add('Rüstungsindustrie / Militärische Güter');
      }
      if (lowerName.includes('tobacco') || lowerName.includes('philip morris') || lowerName.includes('bat')) {
        soc -= 35;
        controversiesSet.add('Tabakindustrie');
      }

      weightedEnv += env * weight;
      weightedSoc += soc * weight;
      weightedGov += gov * weight;
    });

    const envScore = totalWeight > 0 ? Math.round(weightedEnv / totalWeight) : 75;
    const socScore = totalWeight > 0 ? Math.round(weightedSoc / totalWeight) : 75;
    const govScore = totalWeight > 0 ? Math.round(weightedGov / totalWeight) : 78;
    const overall = Math.round((envScore * 0.4) + (socScore * 0.3) + (govScore * 0.3));

    let ratingGrade: EsgScoreResult['ratingGrade'] = 'A';
    if (overall >= 85) ratingGrade = 'AAA';
    else if (overall >= 78) ratingGrade = 'AA';
    else if (overall >= 70) ratingGrade = 'A';
    else if (overall >= 60) ratingGrade = 'BBB';
    else if (overall >= 50) ratingGrade = 'BB';
    else if (overall >= 40) ratingGrade = 'B';
    else ratingGrade = 'CCC';

    return {
      overallScore: overall,
      environmentalScore: envScore,
      socialScore: socScore,
      governanceScore: govScore,
      ratingGrade,
      controversies: Array.from(controversiesSet)
    };
  }, [holdings]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'var(--accent-emerald)';
    if (score >= 60) return '#f59e0b';
    return 'var(--accent-rose)';
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">ESG & Nachhaltigkeits-Audit</h3>
            <p className="text-xs text-slate-400">Umwelt (E), Soziales (S) und Unternehmensführung (G) Bewertung</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4" /> Rating: {esgData.ratingGrade}
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-slate-400 font-semibold block">Gesamt ESG-Score</span>
          <span className="text-2xl font-black block mt-1" style={{ color: getScoreColor(esgData.overallScore) }}>
            {esgData.overallScore} / 100
          </span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-emerald-400 font-semibold block">Umwelt (Environment)</span>
          <span className="text-xl font-bold text-slate-200 block mt-1">{esgData.environmentalScore} / 100</span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-blue-400 font-semibold block">Soziales (Social)</span>
          <span className="text-xl font-bold text-slate-200 block mt-1">{esgData.socialScore} / 100</span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-purple-400 font-semibold block">Führung (Governance)</span>
          <span className="text-xl font-bold text-slate-200 block mt-1">{esgData.governanceScore} / 100</span>
        </div>
      </div>

      {/* Controversies / Warning Section */}
      <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Kontroversen-Prüfung
        </h4>
        
        {esgData.controversies.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" /> Keine kritischen Kontroversen (Rüstung, Tabak, Fossile Energien) im Depot identifiziert.
          </div>
        ) : (
          <div className="space-y-1.5">
            {esgData.controversies.map((c, i) => (
              <div key={i} className="text-xs text-amber-400 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {c}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
