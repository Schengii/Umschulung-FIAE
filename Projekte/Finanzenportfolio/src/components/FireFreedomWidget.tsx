import React, { useState, useMemo } from 'react';
import { Flame, CheckCircle, Sparkles, ShieldAlert } from 'lucide-react';
import { simulateFireWithdrawal, runFireMonteCarloSimulation } from './performanceUtils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FireFreedomWidgetProps {
  totalValue: number;
  monthlyDividends?: number;
  baseCurrency?: string;
}

export const FireFreedomWidget: React.FC<FireFreedomWidgetProps> = ({
  totalValue,
  baseCurrency = 'EUR'
}) => {
  const [monthlyExpenses, setMonthlyExpenses] = useState(2500);
  const [healthInsurance, setHealthInsurance] = useState(350);
  const [inflation] = useState(2.0);
  const [expectedReturn] = useState(7.0);
  const [volatility, setVolatility] = useState(15.0);
  const [years, setYears] = useState(30);
  const [strategy, setStrategy] = useState<'CONSTANT_INFLATION_ADJUSTED' | 'VARIABLE_GUARDRAILS' | 'VPW' | 'FIXED_4_PERCENT'>('VARIABLE_GUARDRAILS');
  const [includeTax] = useState(true);
  const [viewMode, setViewMode] = useState<'DETERMINISTIC' | 'MONTE_CARLO'>('MONTE_CARLO');

  // Target FIRE Capital based on 4% Rule (25x annual expenses)
  const targetCapital = useMemo(() => {
    return (monthlyExpenses + healthInsurance) * 12 * 25;
  }, [monthlyExpenses, healthInsurance]);

  const fireProgress = useMemo(() => {
    return targetCapital > 0 ? Math.min(100, (totalValue / targetCapital) * 100) : 0;
  }, [totalValue, targetCapital]);

  // Deterministic Simulation run
  const simResult = useMemo(() => {
    return simulateFireWithdrawal({
      initialPortfolioValue: totalValue,
      monthlyExpensesEur: monthlyExpenses,
      annualInflationPercent: inflation,
      expectedAnnualReturnPercent: expectedReturn,
      expectedAnnualYieldPercent: 3.5,
      retirementYears: years,
      withdrawalStrategy: strategy,
      includeCapitalGainsTax: includeTax,
      effectiveTaxRatePercent: 18.5, // Teilfreistellungs-bereinigt
      monthlyHealthInsuranceEur: healthInsurance
    });
  }, [totalValue, monthlyExpenses, inflation, expectedReturn, years, strategy, includeTax, healthInsurance]);

  // Monte Carlo Simulation run (500 trials)
  const mcSummary = useMemo(() => {
    return runFireMonteCarloSimulation(
      {
        initialPortfolioValue: totalValue,
        monthlyExpensesEur: monthlyExpenses,
        annualInflationPercent: inflation,
        expectedAnnualReturnPercent: expectedReturn,
        expectedAnnualYieldPercent: 3.5,
        retirementYears: years,
        withdrawalStrategy: strategy,
        includeCapitalGainsTax: includeTax,
        effectiveTaxRatePercent: 18.5,
        monthlyHealthInsuranceEur: healthInsurance
      },
      volatility,
      500
    );
  }, [totalValue, monthlyExpenses, inflation, expectedReturn, years, strategy, includeTax, healthInsurance, volatility]);

  const deterministicChartData = useMemo(() => {
    return simResult.yearlyBreakdown.map(y => ({
      name: `J${y.year}`,
      Depotwert: Math.round(y.endingValue),
      Entnahme: Math.round(y.annualWithdrawal)
    }));
  }, [simResult]);

  const mcChartData = useMemo(() => {
    return mcSummary.paths.map(p => ({
      name: `J${p.year}`,
      Optimistisch_P90: p.p90,
      Median_P50: p.p50,
      Konservativ_P10: p.p10
    }));
  }, [mcSummary]);

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame className="text-orange-500" size={20} /> FIRE Studio & Monte-Carlo Safe Withdrawal
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Simulation von 500 probabilistischen Pfaden (Volatilität {volatility}%), Guardrails & Steuern
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setViewMode('MONTE_CARLO')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'MONTE_CARLO' ? '#3b82f6' : 'transparent',
                color: viewMode === 'MONTE_CARLO' ? '#fff' : '#94a3b8'
              }}
            >
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Monte-Carlo (500 Pfade)
            </button>
            <button
              onClick={() => setViewMode('DETERMINISTIC')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'DETERMINISTIC' ? '#3b82f6' : 'transparent',
                color: viewMode === 'DETERMINISTIC' ? '#fff' : '#94a3b8'
              }}
            >
              Deterministisch
            </button>
          </div>

          <span style={{
            padding: '0.3rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            background: mcSummary.ruinProbabilityPercent <= 5 ? 'rgba(16,185,129,0.15)' : mcSummary.ruinProbabilityPercent <= 15 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
            color: mcSummary.ruinProbabilityPercent <= 5 ? '#10b981' : mcSummary.ruinProbabilityPercent <= 15 ? '#f59e0b' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            {mcSummary.ruinProbabilityPercent <= 5 ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
            Ruin-Risiko: {mcSummary.ruinProbabilityPercent}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>FIRE Zielkapital ({fireProgress.toFixed(1)}% erreicht):</span>
          <span style={{ fontWeight: '600' }}>
            {totalValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} / {targetCapital.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${fireProgress}%`, height: '100%', background: 'linear-gradient(90deg, #f97316, #10b981)', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Settings Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monatl. Lebenskosten (€)</label>
          <input
            type="number"
            value={monthlyExpenses}
            onChange={e => setMonthlyExpenses(Number(e.target.value))}
            style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', marginTop: '0.2rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Krankenversicherung / Mo. (€)</label>
          <input
            type="number"
            value={healthInsurance}
            onChange={e => setHealthInsurance(Number(e.target.value))}
            style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', marginTop: '0.2rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entnahmestrategie</label>
          <select
            value={strategy}
            onChange={e => setStrategy(e.target.value as any)}
            style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', marginTop: '0.2rem' }}
          >
            <option value="VARIABLE_GUARDRAILS">Guyton-Klinger Guardrails (Dynamisch)</option>
            <option value="CONSTANT_INFLATION_ADJUSTED">4% Trinity (Inflationsbereinigt)</option>
            <option value="VPW">VPW (Variable Percentage Withdrawal)</option>
            <option value="FIXED_4_PERCENT">Fix 4% des Jahresdepotwerts</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Volatilität (Streuung): {volatility}%</label>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={volatility}
            onChange={e => setVolatility(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entnahme-Dauer: {years} Jahre</label>
          <input
            type="range"
            min="10"
            max="50"
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '240px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'MONTE_CARLO' ? (
            <LineChart data={mcChartData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  Number(value).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency }),
                  name === 'Optimistisch_P90' ? '90. Perzentil (Starkes Wachstum)' : name === 'Median_P50' ? '50. Perzentil (Erwartungswert)' : '10. Perzentil (Konservativ)'
                ]}
                contentStyle={{ background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
              <Legend formatter={(val) => val === 'Optimistisch_P90' ? '90% Perzentil' : val === 'Median_P50' ? 'Median (50%)' : '10% Perzentil (Bärenmarkt)'} />
              <Line type="monotone" dataKey="Optimistisch_P90" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Median_P50" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Konservativ_P10" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          ) : (
            <LineChart data={deterministicChartData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: any) => [Number(value).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })]}
                contentStyle={{ background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="Depotwert" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

