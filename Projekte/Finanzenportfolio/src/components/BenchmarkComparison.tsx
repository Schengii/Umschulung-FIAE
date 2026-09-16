import React, { useState, useMemo } from 'react';
import { generateBenchmarkSeries, calculateAlphaBeta } from './performanceUtils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Target, ShieldCheck, HelpCircle } from 'lucide-react';
import type { BenchmarkIndex } from '../types';

interface BenchmarkComparisonProps {
  portfolioReturnPercent: number;
}

interface BenchmarkMeta {
  id: BenchmarkIndex;
  name: string;
  ticker: string;
  color: string;
  desc: string;
  annualReturnEst: number;
}

const BENCHMARKS: BenchmarkMeta[] = [
  { id: 'MSCI_WORLD', name: 'MSCI World', ticker: 'URTH', color: '#10b981', desc: 'Weltweiter Aktienmarkt (Industrieländer)', annualReturnEst: 8.5 },
  { id: 'SP500', name: 'S&P 500', ticker: 'SPY', color: '#3b82f6', desc: 'Die 500 führenden US-Konzerne', annualReturnEst: 11.2 },
  { id: 'DAX40', name: 'DAX 40', ticker: 'DAX', color: '#f59e0b', desc: 'Deutsche Leitbörse (Blue Chips)', annualReturnEst: 6.8 },
  { id: 'BTC', name: 'Bitcoin', ticker: 'BTC', color: '#ec4899', desc: 'Größte Krypto-Leitwährung', annualReturnEst: 28.0 }
];

export const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({
  portfolioReturnPercent
}) => {
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkIndex>('MSCI_WORLD');
  const [visibleBenchmarks, setVisibleBenchmarks] = useState<Record<BenchmarkIndex, boolean>>({
    MSCI_WORLD: true,
    SP500: true,
    DAX40: false,
    BTC: false
  });

  const benchmarks = useMemo(() => generateBenchmarkSeries(30), []);

  const benchmarkPointsMap = useMemo(() => {
    return {
      MSCI_WORLD: benchmarks[0]?.points || [],
      SP500: benchmarks[1]?.points || [],
      DAX40: benchmarks[2]?.points || [],
      BTC: benchmarks[3]?.points || []
    };
  }, [benchmarks]);

  // Generate 30-day normalized portfolio trajectory
  const portfolioPoints = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const progress = i / 29;
      // Combine linear progress with smooth market noise
      return 100 + progress * portfolioReturnPercent + Math.sin(i * 0.45) * 1.2;
    });
  }, [portfolioReturnPercent]);

  // Calculate day-over-day returns for Alpha and Beta
  const { alphaPercent, beta, outperformance, trackingError } = useMemo(() => {
    const targetPoints = benchmarkPointsMap[selectedBenchmark] || benchmarkPointsMap.MSCI_WORLD;
    
    const pReturns: number[] = [];
    const bReturns: number[] = [];

    for (let i = 1; i < portfolioPoints.length; i++) {
      pReturns.push((portfolioPoints[i] - portfolioPoints[i - 1]) / portfolioPoints[i - 1]);
      bReturns.push((targetPoints[i] - targetPoints[i - 1]) / targetPoints[i - 1]);
    }

    const { alphaPercent, beta } = calculateAlphaBeta(pReturns, bReturns, 2.0);

    const pFinal = portfolioPoints[portfolioPoints.length - 1] - 100;
    const bFinal = targetPoints[targetPoints.length - 1] - 100;
    const outperformance = pFinal - bFinal;

    // Tracking error approximation
    const diffs = pReturns.map((p, idx) => p - bReturns[idx]);
    const meanDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const varianceDiff = diffs.reduce((a, b) => a + Math.pow(b - meanDiff, 2), 0) / diffs.length;
    const trackingError = Math.sqrt(varianceDiff) * Math.sqrt(252) * 100;

    return {
      alphaPercent,
      beta,
      outperformance,
      trackingError: isNaN(trackingError) ? 3.5 : trackingError
    };
  }, [portfolioPoints, benchmarkPointsMap, selectedBenchmark]);

  // Chart series data
  const chartData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      return {
        day: `Tag ${i + 1}`,
        Portfolio: Math.round(portfolioPoints[i] * 100) / 100,
        'MSCI World': Math.round(benchmarkPointsMap.MSCI_WORLD[i] * 100) / 100,
        'S&P 500': Math.round(benchmarkPointsMap.SP500[i] * 100) / 100,
        'DAX 40': Math.round(benchmarkPointsMap.DAX40[i] * 100) / 100,
        'Bitcoin': Math.round(benchmarkPointsMap.BTC[i] * 100) / 100
      };
    });
  }, [portfolioPoints, benchmarkPointsMap]);

  const toggleVisibility = (id: BenchmarkIndex) => {
    setVisibleBenchmarks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeBenchmarkMeta = BENCHMARKS.find(b => b.id === selectedBenchmark) || BENCHMARKS[0];

  return (
    <div style={{
      background: 'var(--card-bg, #0f172a)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      color: 'var(--text-color, #f8fafc)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderRadius: '12px' }}>
            <Activity size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Benchmark-Vergleich & Alpha/Beta Engine
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Messe deine Überrendite gegen globale Indizes & berechne dein systematisches Marktrisiko
            </p>
          </div>
        </div>

        {/* Benchmark Selector Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '10px', gap: '4px' }}>
          {BENCHMARKS.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBenchmark(b.id)}
              style={{
                border: 'none',
                background: selectedBenchmark === b.id ? b.color : 'transparent',
                color: selectedBenchmark === b.id ? '#ffffff' : 'var(--text-muted)',
                fontWeight: selectedBenchmark === b.id ? 700 : 500,
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                transition: 'all 0.2s ease'
              }}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Attribution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {/* Alpha */}
        <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Jensen's Alpha (α)</span>
            <Target size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: alphaPercent >= 0 ? '#10b981' : '#ef4444', marginTop: '0.25rem' }}>
            {alphaPercent >= 0 ? '+' : ''}{alphaPercent.toFixed(2)}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {alphaPercent >= 0 ? 'Überrendite ggü. Markt' : 'Unterperformance'}
          </div>
        </div>

        {/* Beta */}
        <div style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Markt-Beta (β)</span>
            <ShieldCheck size={14} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.25rem' }}>
            {beta.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {beta < 0.9 ? 'Defensiv (geringere Vola)' : beta > 1.1 ? 'Aggressiv (höhere Vola)' : 'Marktkonform (~1.0)'}
          </div>
        </div>

        {/* Outperformance */}
        <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>vs. {activeBenchmarkMeta.name}</span>
            {outperformance >= 0 ? <TrendingUp size={14} color="#10b981" /> : <TrendingDown size={14} color="#ef4444" />}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: outperformance >= 0 ? '#10b981' : '#ef4444', marginTop: '0.25rem' }}>
            {outperformance >= 0 ? '+' : ''}{outperformance.toFixed(2)}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Spread im Betrachtungszeitraum
          </div>
        </div>

        {/* Tracking Error */}
        <div style={{ background: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '1rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Tracking Error (p.a.)</span>
            <HelpCircle size={14} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#a855f7', marginTop: '0.25rem' }}>
            {trackingError.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Abweichungsvolatilität zum Index
          </div>
        </div>
      </div>

      {/* Comparison Line Chart */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '1.25rem 1rem 0.5rem 1rem'
      }}>
        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
              />
              {/* Portfolio Line (Thick & Glowing) */}
              <Line type="monotone" dataKey="Portfolio" stroke="#3b82f6" strokeWidth={3.5} dot={false} />
              
              {/* Benchmarks */}
              {visibleBenchmarks.MSCI_WORLD && (
                <Line type="monotone" dataKey="MSCI World" stroke="#10b981" strokeWidth={1.8} dot={false} strokeDasharray="4 3" />
              )}
              {visibleBenchmarks.SP500 && (
                <Line type="monotone" dataKey="S&P 500" stroke="#0ea5e9" strokeWidth={1.8} dot={false} strokeDasharray="4 3" />
              )}
              {visibleBenchmarks.DAX40 && (
                <Line type="monotone" dataKey="DAX 40" stroke="#f59e0b" strokeWidth={1.8} dot={false} strokeDasharray="4 3" />
              )}
              {visibleBenchmarks.BTC && (
                <Line type="monotone" dataKey="Bitcoin" stroke="#ec4899" strokeWidth={1.8} dot={false} strokeDasharray="4 3" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Legend & Curve Toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#3b82f6' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
            Dein Portfolio (Basis 100)
          </span>

          {BENCHMARKS.map(b => {
            const isVisible = visibleBenchmarks[b.id];
            return (
              <button
                key={b.id}
                onClick={() => toggleVisibility(b.id)}
                style={{
                  border: `1px solid ${isVisible ? b.color : 'rgba(255,255,255,0.1)'}`,
                  background: isVisible ? 'rgba(255,255,255,0.04)' : 'transparent',
                  color: isVisible ? b.color : 'var(--text-muted)',
                  borderRadius: '20px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                  opacity: isVisible ? 1 : 0.4
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.color, display: 'inline-block' }} />
                {b.name} ({isVisible ? 'An' : 'Aus'})
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Referenzzins: 2,0% (EZB/Fed Risk-Free Rate)
        </div>
      </div>

    </div>
  );
};

