import React from 'react';

import { Flame, Calendar, Trophy, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function ActivityHeatmapWidget() {
  const { userState } = useStore();
  const activityHistory = userState.activityHistory || {};

  // Letzte 52 Wochen (364 Tage) generieren
  const today = new Date();
  const days = [];
  
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const data = activityHistory[dateStr] || { count: 0, xp: 0 };
    days.push({
      date: dateStr,
      count: data.count,
      xp: data.xp,
      dayOfWeek: d.getDay() // 0 = So, 1 = Mo, ...
    });
  }

  // Gesamt-Aktivitäten & Max Streak berechnen
  const totalActions = Object.values(activityHistory).reduce((sum, item) => sum + (item.count || 0), 0);
  const totalXpLogged = Object.values(activityHistory).reduce((sum, item) => sum + (item.xp || 0), 0);

  const getHeatmapColor = (count) => {
    if (!count || count === 0) return 'bg-slate-800/80 border-slate-700/50';
    if (count === 1) return 'bg-emerald-900/80 border-emerald-700/60';
    if (count <= 3) return 'bg-emerald-700 border-emerald-500/80';
    if (count <= 6) return 'bg-emerald-500 border-emerald-400';
    return 'bg-emerald-400 border-white shadow-sm shadow-emerald-400/50';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Lern-Aktivität & 365-Tage Heatmap
            </h3>
            <p className="text-xs text-slate-400">
              Dein täglicher Lernfortschritt über das gesamte Jahr
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-800/50">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold">{userState.streak || 1} Tage Streak</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/50">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">{totalActions} Einheiten</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400 bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-800/50">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-bold">{totalXpLogged} XP gesamt</span>
          </div>
        </div>
      </div>

      {/* Grid: 52 Spalten x 7 Zeilen */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-rows-7 grid-flow-col gap-1 min-w-[700px]">
          {days.map((d, idx) => (
            <div
              key={idx}
              title={`${d.date}: ${d.count} Aktivitäten (${d.xp} XP)`}
              className={`w-3 h-3 rounded-sm border transition-transform hover:scale-125 cursor-pointer ${getHeatmapColor(d.count)}`}
            />
          ))}
        </div>
      </div>

      {/* Legende */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
        <span>Geringe Aktivität</span>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-700" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-900 border border-emerald-700" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700 border border-emerald-500" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-400" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 border border-white" />
        </div>
        <span>Hohe Aktivität</span>
      </div>
    </div>
  );
}
