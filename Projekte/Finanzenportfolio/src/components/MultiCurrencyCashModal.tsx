import React, { useState, useMemo } from 'react';
import { Landmark, ArrowRightLeft, DollarSign, Euro, History, X } from 'lucide-react';
import type { Transaction } from '../types';

interface MultiCurrencyCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  baseCurrency?: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

const DEFAULT_FX_RATES: Record<string, number> = {
  'EUR_USD': 1.085,
  'USD_EUR': 0.921,
  'EUR_CHF': 0.965,
  'CHF_EUR': 1.036,
  'EUR_GBP': 0.855,
  'GBP_EUR': 1.169,
  'USD_CHF': 0.889,
  'CHF_USD': 1.125,
  'USD_GBP': 0.788,
  'GBP_USD': 1.269,
  'CHF_GBP': 0.886,
  'GBP_CHF': 1.129
};

export const MultiCurrencyCashModal: React.FC<MultiCurrencyCashModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onAddTransaction,
  baseCurrency = 'EUR'
}) => {
  const [fromCurrency, setFromCurrency] = useState<'EUR' | 'USD' | 'CHF' | 'GBP'>('EUR');
  const [toCurrency, setToCurrency] = useState<'EUR' | 'USD' | 'CHF' | 'GBP'>('USD');
  const [fromAmount, setFromAmount] = useState<string>('1000');
  const [fee, setFee] = useState<string>('1.50');
  const [customRate, setCustomRate] = useState<string>('');
  const [swapSuccess, setSwapSuccess] = useState<boolean>(false);

  // Calculate Currency Balances
  const balances = useMemo(() => {
    const acc = { EUR: 0, USD: 0, CHF: 0, GBP: 0 };

    transactions.forEach(t => {
      const cur = (t.currency || 'EUR') as keyof typeof acc;
      const totalNative = t.amount * t.price;

      if (t.type === 'DEPOSIT') {
        acc[cur] += t.amount;
      } else if (t.type === 'WITHDRAWAL') {
        acc[cur] -= t.amount;
      } else if (t.type === 'BUY') {
        acc[cur] -= totalNative + (t.fee || 0);
      } else if (t.type === 'SELL') {
        acc[cur] += totalNative - (t.fee || 0) - (t.tax || 0);
      } else if (t.type === 'DIVIDEND' || t.type === 'INTEREST') {
        acc[cur] += totalNative - (t.tax || 0);
      } else if (t.type === 'FEE') {
        acc[cur] -= t.amount || totalNative;
      } else if (t.type === 'FX_SWAP') {
        if (t.fromCurrency && t.fromAmount) {
          acc[t.fromCurrency] -= (t.fromAmount + (t.fee || 0));
        }
        if (t.toCurrency && t.toAmount) {
          acc[t.toCurrency] += t.toAmount;
        }
      }
    });

    return acc;
  }, [transactions]);

  // Current FX rate between selected currencies
  const defaultRate = useMemo(() => {
    if (fromCurrency === toCurrency) return 1.0;
    const key = `${fromCurrency}_${toCurrency}`;
    return DEFAULT_FX_RATES[key] || 1.0;
  }, [fromCurrency, toCurrency]);

  const activeRate = customRate ? parseFloat(customRate) || defaultRate : defaultRate;
  const parsedFromAmount = parseFloat(fromAmount) || 0;
  const parsedFee = parseFloat(fee) || 0;
  const calculatedToAmount = Math.max(0, parsedFromAmount * activeRate);

  // Total in base currency equivalent
  const totalInBaseEquivalent = useMemo(() => {
    let total = balances.EUR;
    total += balances.USD * (DEFAULT_FX_RATES['USD_EUR'] || 0.92);
    total += balances.CHF * (DEFAULT_FX_RATES['CHF_EUR'] || 1.03);
    total += balances.GBP * (DEFAULT_FX_RATES['GBP_EUR'] || 1.16);
    return total;
  }, [balances]);

  // Recent FX Swaps
  const recentSwaps = useMemo(() => {
    return transactions
      .filter(t => t.type === 'FX_SWAP')
      .slice(-5)
      .reverse();
  }, [transactions]);

  if (!isOpen) return null;

  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedFromAmount <= 0) {
      alert('Bitte gib einen gültigen Betrag ein.');
      return;
    }

    if (fromCurrency === toCurrency) {
      alert('Ausgangs- und Zielwährung müssen unterschiedlich sein.');
      return;
    }

    // Add swap transaction
    onAddTransaction({
      type: 'FX_SWAP',
      date: new Date().toLocaleDateString('de-DE'),
      ticker: `FX-${fromCurrency}/${toCurrency}`,
      name: `Währungsumtausch ${fromCurrency} ➔ ${toCurrency}`,
      amount: parsedFromAmount,
      price: activeRate,
      fee: parsedFee,
      tax: 0,
      category: 'Cash',
      currency: fromCurrency,
      exchangeRate: 1.0,
      fromCurrency,
      toCurrency,
      fromAmount: parsedFromAmount,
      toAmount: Math.round(calculatedToAmount * 100) / 100,
      notes: `Kurs: 1 ${fromCurrency} = ${activeRate} ${toCurrency} | Gebühr: ${parsedFee} ${fromCurrency}`
    });

    setSwapSuccess(true);
    setTimeout(() => setSwapSuccess(false), 2500);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '820px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderRadius: '12px' }}>
              <Landmark size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Multi-Währungs Cash-Konten & FX Swap
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Getrennte Verrechnungskonten (EUR, USD, CHF, GBP) & Währungsumtausch ohne Konvertierungsverluste
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Account Balances Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
            {/* EUR */}
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Euro (EUR)</span>
                <Euro size={14} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.25rem', color: balances.EUR >= 0 ? '#3b82f6' : '#ef4444' }}>
                {balances.EUR.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Haupt-Verrechnungskonto</div>
            </div>

            {/* USD */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>US-Dollar (USD)</span>
                <DollarSign size={14} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.25rem', color: balances.USD >= 0 ? '#10b981' : '#ef4444' }}>
                {balances.USD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>US-Dividenden & Aktien</div>
            </div>

            {/* CHF */}
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Schweizer Franken (CHF)</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#f59e0b' }}>CHF</span>
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.25rem', color: balances.CHF >= 0 ? '#f59e0b' : '#ef4444' }}>
                {balances.CHF.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Fr.
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Eidg. Wertschriften</div>
            </div>

            {/* GBP */}
            <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Britisches Pfund (GBP)</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#a855f7' }}>£</span>
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.25rem', color: balances.GBP >= 0 ? '#a855f7' : '#ef4444' }}>
                {balances.GBP.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} £
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>LSE Dividenden</div>
            </div>
          </div>

          {/* Aggregated Total Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Gesamte Barliquidität (in {baseCurrency}-Äquivalent bewertet):
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
              {totalInBaseEquivalent.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
            </div>
          </div>

          {/* FX Swap Form */}
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.25rem',
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowRightLeft size={16} color="#3b82f6" /> Geldwechsel / Währungsumtausch (FX Swap)
            </div>

            <form onSubmit={handleExecuteSwap} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem' }}>
                
                {/* From */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Von Währungskonto</label>
                  <select
                    className="form-select"
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value as any)}
                  >
                    <option value="EUR">EUR (€) - Saldo: {balances.EUR.toFixed(2)} €</option>
                    <option value="USD">USD ($) - Saldo: {balances.USD.toFixed(2)} $</option>
                    <option value="CHF">CHF (Fr.) - Saldo: {balances.CHF.toFixed(2)} Fr.</option>
                    <option value="GBP">GBP (£) - Saldo: {balances.GBP.toFixed(2)} £</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Verkaufter Betrag ({fromCurrency})</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    required
                  />
                </div>

                {/* Fee */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Wechselgebühr ({fromCurrency})</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="0.00"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                  />
                </div>

                {/* To */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>In Zielwährung</label>
                  <select
                    className="form-select"
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value as any)}
                  >
                    <option value="USD">USD ($) - Saldo: {balances.USD.toFixed(2)} $</option>
                    <option value="EUR">EUR (€) - Saldo: {balances.EUR.toFixed(2)} €</option>
                    <option value="CHF">CHF (Fr.) - Saldo: {balances.CHF.toFixed(2)} Fr.</option>
                    <option value="GBP">GBP (£) - Saldo: {balances.GBP.toFixed(2)} £</option>
                  </select>
                </div>

                {/* Execution Rate */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>
                    Wechselkurs ({fromCurrency}/{toCurrency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder={`Standard: ${defaultRate}`}
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                  />
                </div>
              </div>

              {/* Result Preview Box */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '10px',
                padding: '0.85rem 1.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gutschrift Zielkonto:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>
                    +{calculatedToAmount.toFixed(2)} {toCurrency}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Effektiver Kurs: 1 {fromCurrency} = {activeRate.toFixed(4)} {toCurrency}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.2rem' }}
                >
                  <ArrowRightLeft size={15} /> Geldwechsel buchen
                </button>
              </div>

              {swapSuccess && (
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', textAlign: 'center', fontSize: '0.85rem' }}>
                  ✅ Währungsumtausch erfolgreich gebucht und Kontensalden aktualisiert!
                </div>
              )}
            </form>
          </div>

          {/* Recent Swaps List */}
          {recentSwaps.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <History size={14} /> Letzte Währungsumtäusche
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {recentSwaps.map(t => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.6rem 0.9rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 'bold' }}>{t.name}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>{t.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ color: '#ef4444' }}>-{t.fromAmount} {t.fromCurrency}</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{t.toAmount} {t.toCurrency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
