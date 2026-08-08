import React, { useMemo } from 'react';
import { generateBenchmarkSeries, calculateAlphaBeta } from './performanceUtils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

interface BenchmarkComparisonProps {
  portfolioReturnPercent: number;
}

export const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({
  portfolioReturnPercent
}) => {
  const benchmarks = useMemo(() => generateBenchmarkSeries(30), []);

  const samplePortfolioRets = [0.01, 0.02, -0.01, 0.03, 0.015, 0.02, -0.005, 0.025];
  const sampleMarketRets = [0.008, 0.015, -0.012, 0.022, 0.01, 0.018, -0.008, 0.02];

  const metrics = calculateAlphaBeta(samplePortfolioRets, sampleMarketRets, 2.0);

  const chartData = Array.from({ length: 30 }, (_, i) => {
    return {
      day: `Tag ${i + 1}`,
      Portfolio: Math.round(100 + (i / 30) * portfolioReturnPercent + Math.sin(i * 0.5) * 2),
      'MSCI World': Math.round(benchmarks[0].points[i]),
      'S&P 500': Math.round(benchmarks[1].points[i]),
      DAX: Math.round(benchmarks[2].points[i]),
      Bitcoin: Math.round(benchmarks[3].points[i])
    };
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Benchmark-Vergleich & Alpha/Beta Engine</h3>
            <p className="text-xs text-slate-400">Vergleich deiner Rendite mit MSCI World, S&P 500, DAX & Bitcoin</p>
          </div>
        </div>

        {/* Alpha/Beta Metrics */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Alpha (α):</span>
            <span className="font-bold text-emerald-400">+{metrics.alphaPercent.toFixed(2)}%</span>
          </div>

          <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Beta (β):</span>
            <span className="font-bold text-blue-400">{metrics.beta.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Comparison Line Chart */}
      <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="Portfolio" stroke="#3b82f6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="MSCI World" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="S&P 500" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="DAX" stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Bitcoin" stroke="#ec4899" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-blue-400">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Dein Portfolio
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> MSCI World
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> S&P 500
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="w-3 h-3 rounded bg-purple-500 inline-block" /> DAX 40
          </span>
          <span className="flex items-center gap-1.5 text-pink-400">
            <span className="w-3 h-3 rounded bg-pink-500 inline-block" /> Bitcoin
          </span>
        </div>
      </div>

    </div>
  );
};
