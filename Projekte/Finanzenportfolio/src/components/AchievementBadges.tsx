import React from 'react';
import { calculateAchievements } from './performanceUtils';
import type { Holding, Transaction, PortfolioStats } from '../types';
import { Award, Lock } from 'lucide-react';

interface AchievementBadgesProps {
  stats: PortfolioStats;
  holdings: Holding[];
  transactions: Transaction[];
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  stats,
  holdings,
  transactions
}) => {
  const badges = calculateAchievements(stats, holdings, transactions);
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Meilensteine & Depot-Erfolge (Badges)</h3>
            <p className="text-xs text-slate-400">Spielerische Finanz-Erfolge freischalten</p>
          </div>
        </div>

        <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
          <span className="text-slate-400 font-semibold">Freigeschaltet: </span>
          <span className="font-bold text-amber-400">{unlockedCount} / {badges.length}</span>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {badges.map(b => (
          <div
            key={b.id}
            className={`p-4 rounded-xl border space-y-2 transition-all ${
              b.isUnlocked
                ? 'bg-gradient-to-br from-slate-950 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                : 'bg-slate-950/40 border-slate-800/80 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <span className="font-bold block text-slate-200">{b.title}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{b.category}</span>
                </div>
              </div>

              {!b.isUnlocked && <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />}
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">{b.description}</p>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>Fortschritt</span>
                <span>{b.progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${b.isUnlocked ? 'bg-amber-400' : 'bg-slate-600'}`}
                  style={{ width: `${b.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
