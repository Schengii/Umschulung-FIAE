import React from 'react';
import { analyzePortfolioHealth } from './performanceUtils';
import type { Holding, Transaction } from '../types';
import { ShieldCheck, AlertTriangle, AlertCircle, Info, Sparkles, CheckCircle2 } from 'lucide-react';

interface PortfolioHealthAuditProps {
  holdings: Holding[];
  transactions: Transaction[];
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const PortfolioHealthAudit: React.FC<PortfolioHealthAuditProps> = ({
  holdings,
  transactions
}) => {
  const issues = analyzePortfolioHealth(holdings, transactions);

  const criticalCount = issues.filter(i => i.type === 'CRITICAL').length;
  const warningCount = issues.filter(i => i.type === 'WARNING').length;

  const healthScore = Math.max(0, 100 - (criticalCount * 25 + warningCount * 10));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">KI-Depot-Check & Risikodiagnose</h3>
            <p className="text-xs text-slate-400">Automatische Prüfung auf Klumpenrisiken, ETF-Overlaps & Gebühren</p>
          </div>
        </div>

        {/* Health Score Badge */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold">Health Score:</span>
          <span className={`text-lg font-black ${healthScore >= 80 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
            {healthScore} / 100
          </span>
        </div>
      </div>

      {/* Issues List or All Clear */}
      {issues.length === 0 ? (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Exzellent! Es wurden keine Klumpenrisiken oder gebührenkritische Auffälligkeiten in deinem Portfolio entdeckt.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((iss) => {
            const isCrit = iss.type === 'CRITICAL';
            const isWarn = iss.type === 'WARNING';

            return (
              <div
                key={iss.id}
                className={`p-4 rounded-xl border space-y-2 text-xs transition-colors ${
                  isCrit
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-100'
                    : isWarn
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-100'
                    : 'bg-slate-950/40 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    {isCrit ? <AlertCircle className="w-4 h-4 text-rose-400" /> : isWarn ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <Info className="w-4 h-4 text-blue-400" />}
                    <span>{iss.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isCrit ? 'bg-rose-500/20 text-rose-300' : isWarn ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {iss.type}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{iss.description}</p>

                <div className="pt-1 flex items-start gap-1.5 font-semibold text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Empfehlung: {iss.suggestion}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
