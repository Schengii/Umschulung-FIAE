import React, { useState, useMemo } from 'react';
import { Flame, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { simulateFireWithdrawalExtended } from '../utils/fireSimulatorUtils';
import type { FireWithdrawalSimulationParams } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FireWithdrawalSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPortfolioValue: number;
  baseCurrency?: string;
}

export const FireWithdrawalSimulatorModal: React.FC<FireWithdrawalSimulatorModalProps> = ({
  isOpen,
  onClose,
  totalPortfolioValue,
  baseCurrency = 'EUR'
}) => {
  const [currentAge, setCurrentAge] = useState<number>(35);
  const [retirementAge, setRetirementAge] = useState<number>(50);
  const [targetAge, setTargetAge] = useState<number>(85);
  const [initialCapital, setInitialCapital] = useState<number>(Math.round(totalPortfolioValue || 250000));
  const [annualReturn, setAnnualReturn] = useState<number>(6.5);
  const [annualInflation, setAnnualInflation] = useState<number>(2.0);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(2500);
  const [monthlyHealthInsurance, setMonthlyHealthInsurance] = useState<number>(350);
  const [monthlyStatePension, setMonthlyStatePension] = useState<number>(1200);
  const [statePensionAge, setStatePensionAge] = useState<number>(67);
  const [monthlyCompanyPension, setMonthlyCompanyPension] = useState<number>(250);
  const [companyPensionAge, setCompanyPensionAge] = useState<number>(65);
  const [strategy, setStrategy] = useState<FireWithdrawalSimulationParams['withdrawalStrategy']>('GUYTON_KLINGER');
  const [initialWithdrawalRate, setInitialWithdrawalRate] = useState<number>(3.5);
  const [bequestGoal, setBequestGoal] = useState<number>(0);

  const simResult = useMemo(() => {
    return simulateFireWithdrawalExtended({
      currentAge,
      retirementAge,
      targetAge,
      currentPortfolioValue: initialCapital,
      annualReturnPercent: annualReturn,
      annualInflationPercent: annualInflation,
      monthlyBaseExpensesEur: monthlyExpenses,
      monthlyHealthInsuranceEur: monthlyHealthInsurance,
      monthlyStatePensionEur: monthlyStatePension,
      statePensionStartAge: statePensionAge,
      monthlyCompanyPensionEur: monthlyCompanyPension,
      companyPensionStartAge: companyPensionAge,
      withdrawalStrategy: strategy,
      initialWithdrawalRatePercent: initialWithdrawalRate,
      bequestGoalEur: bequestGoal
    });
  }, [
    currentAge,
    retirementAge,
    targetAge,
    initialCapital,
    annualReturn,
    annualInflation,
    monthlyExpenses,
    monthlyHealthInsurance,
    monthlyStatePension,
    statePensionAge,
    monthlyCompanyPension,
    companyPensionAge,
    strategy,
    initialWithdrawalRate,
    bequestGoal
  ]);

  const chartData = useMemo(() => {
    return simResult.yearlyDetails.map(d => ({
      age: `Alter ${d.age}`,
      Depotwert: d.endingValue,
      Entnahme: d.withdrawalAmount,
      Rente: d.statePensionReceived + d.companyPensionReceived
    }));
  }, [simResult]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '960px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', borderRadius: '8px' }}>
              <Flame size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>FIRE-Dynamik & Kapitalverzehr-Simulator</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Dynamische Entnahmeraten, Guyton-Klinger Leitplanken, Rente & Krankenversicherung bis ins hohe Alter
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status Result Card */}
          <div style={{
            padding: '1rem',
            background: simResult.isSuccess ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${simResult.isSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {simResult.isSuccess ? <ShieldCheck size={26} color="#10b981" /> : <AlertCircle size={26} color="#ef4444" />}
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: simResult.isSuccess ? '#10b981' : '#f87171' }}>
                  {simResult.isSuccess ? 'Kapitalerhalt gesichert!' : `Achtung: Kapital erschöpft mit Alter ${simResult.depletionAge}`}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {simResult.recommendation}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', textAlign: 'right' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Endvermögen (Alter {targetAge})</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: simResult.finalPortfolioValueEur > 0 ? '#10b981' : '#ef4444' }}>
                  {simResult.finalPortfolioValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gesamte Entnahmen</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {simResult.totalWithdrawnEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Startkapital bei Beginn:</label>
              <input
                type="number"
                step="10000"
                value={initialCapital}
                onChange={e => setInitialCapital(Number(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Aktuelles / Renten- / Endalter:</label>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <input
                  type="number"
                  value={currentAge}
                  title="Aktuelles Alter"
                  onChange={e => setCurrentAge(Number(e.target.value) || 0)}
                  style={{ width: '33%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                />
                <input
                  type="number"
                  value={retirementAge}
                  title="Rentenbeginn"
                  onChange={e => setRetirementAge(Number(e.target.value) || 0)}
                  style={{ width: '33%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                />
                <input
                  type="number"
                  value={targetAge}
                  title="Ziel-Lebensalter"
                  onChange={e => setTargetAge(Number(e.target.value) || 0)}
                  style={{ width: '33%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Monatl. Ausgaben + KV (€):</label>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <input
                  type="number"
                  value={monthlyExpenses}
                  title="Grundausgaben netto"
                  onChange={e => setMonthlyExpenses(Number(e.target.value) || 0)}
                  style={{ width: '60%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
                <input
                  type="number"
                  value={monthlyHealthInsurance}
                  title="Krankenversicherung KV"
                  onChange={e => setMonthlyHealthInsurance(Number(e.target.value) || 0)}
                  style={{ width: '40%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Gesetzl. Rente ab Alter 67 (€):</label>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <input
                  type="number"
                  value={monthlyStatePension}
                  onChange={e => setMonthlyStatePension(Number(e.target.value) || 0)}
                  style={{ width: '65%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
                <input
                  type="number"
                  value={statePensionAge}
                  title="Beginn Alter"
                  onChange={e => setStatePensionAge(Number(e.target.value) || 0)}
                  style={{ width: '35%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Betriebsrente ab Alter 65 (€):</label>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <input
                  type="number"
                  value={monthlyCompanyPension}
                  onChange={e => setMonthlyCompanyPension(Number(e.target.value) || 0)}
                  style={{ width: '65%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
                <input
                  type="number"
                  value={companyPensionAge}
                  title="Beginn bAV Alter"
                  onChange={e => setCompanyPensionAge(Number(e.target.value) || 0)}
                  style={{ width: '35%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Start-Quote (%) / Erbe-Ziel (€):</label>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <input
                  type="number"
                  step="0.1"
                  value={initialWithdrawalRate}
                  title="Basis-Entnahmerate %"
                  onChange={e => setInitialWithdrawalRate(Number(e.target.value) || 0)}
                  style={{ width: '50%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
                <input
                  type="number"
                  step="10000"
                  value={bequestGoal}
                  title="Mindest-Erbe Restkapital (€)"
                  onChange={e => setBequestGoal(Number(e.target.value) || 0)}
                  style={{ width: '50%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Entnahme-Strategie:</label>
              <select
                value={strategy}
                onChange={e => setStrategy(e.target.value as any)}
                style={{ width: '100%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
              >
                <option value="GUYTON_KLINGER">Guyton-Klinger Leitplanken (Flexibel)</option>
                <option value="CONSTANT_INFLATION_ADJUSTED">Bengen 4% Regel (Inflationsindexiert)</option>
                <option value="VPW">Variable Percentage Withdrawal (VPW)</option>
                <option value="FIXED_PERCENTAGE">Feste %-Quote des Depots</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Rendite / Inflation p.a.:</label>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <input
                  type="number"
                  step="0.5"
                  value={annualReturn}
                  title="Rendite % p.a."
                  onChange={e => setAnnualReturn(Number(e.target.value) || 0)}
                  style={{ width: '50%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
                <input
                  type="number"
                  step="0.5"
                  value={annualInflation}
                  title="Inflation % p.a."
                  onChange={e => setAnnualInflation(Number(e.target.value) || 0)}
                  style={{ width: '50%', padding: '0.35rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Chart */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Vermögenspfad & Rentenverrechnung über {targetAge - currentAge} Jahre</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dynamischer Verlauf</span>
            </div>
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <XAxis dataKey="age" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k €`} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '0.75rem' }}
                    formatter={(val: any, name: any) => [
                      Number(val).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency }),
                      name
                    ]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Depotwert" stroke="#10b981" fill="rgba(16, 185, 129, 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Entnahme" stroke="#f97316" fill="rgba(249, 115, 22, 0.15)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="Rente" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.15)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
