import React from 'react';
import type { Holding, TargetAllocation } from '../types';
import { Target } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface AllocationRadarChartProps {
  holdings: Holding[];
  targetAllocations?: TargetAllocation[];
}

export const AllocationRadarChart: React.FC<AllocationRadarChartProps> = ({
  holdings
}) => {
  const totalVal = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  // Group current holdings by Sector
  const sectorMap: Record<string, number> = {
    Technology: 0,
    Financials: 0,
    Healthcare: 0,
    Consumer: 0,
    Industrials: 0,
    Energy: 0
  };

  holdings.forEach(h => {
    const sec = h.sector || 'Technology';
    sectorMap[sec] = (sectorMap[sec] || 0) + h.currentValue;
  });

  const radarData = [
    { subject: 'Technology', Ist: totalVal > 0 ? Math.round((sectorMap.Technology / totalVal) * 100) : 35, Soll: 30 },
    { subject: 'Financials', Ist: totalVal > 0 ? Math.round((sectorMap.Financials / totalVal) * 100) : 20, Soll: 20 },
    { subject: 'Healthcare', Ist: totalVal > 0 ? Math.round((sectorMap.Healthcare / totalVal) * 100) : 15, Soll: 15 },
    { subject: 'Consumer', Ist: totalVal > 0 ? Math.round((sectorMap.Consumer / totalVal) * 100) : 10, Soll: 15 },
    { subject: 'Industrials', Ist: totalVal > 0 ? Math.round((sectorMap.Industrials / totalVal) * 100) : 10, Soll: 10 },
    { subject: 'Energy', Ist: totalVal > 0 ? Math.round((sectorMap.Energy / totalVal) * 100) : 10, Soll: 10 }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Soll- vs. Ist-Allokation (Radar-Chart)</h3>
            <p className="text-xs text-slate-400">Vergleich deiner aktuellen Branchengewichtung mit der Ziel-Strategie</p>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-64 w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
            <PolarRadiusAxis angle={30} domain={[0, 50]} stroke="#475569" fontSize={10} />
            <Radar name="Ist-Zustand (%)" dataKey="Ist" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
            <Radar name="Soll-Ziel (%)" dataKey="Soll" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeDasharray="3 3" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
          <span>Ist-Allokation (%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-500 border border-blue-400 border-dashed inline-block" />
          <span>Soll-Strategie (%)</span>
        </div>
      </div>

    </div>
  );
};
