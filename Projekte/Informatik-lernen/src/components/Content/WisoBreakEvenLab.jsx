import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  BarChart2,
  Award,
  Layers
} from 'lucide-react';
import { calculateTier2ContributionMargin } from '../../utils/wisoBreakEvenEngine';
import { useStore } from '../../store/useStore';

export default function WisoBreakEvenLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [completed, setCompleted] = useState(false);

  const [products, setProducts] = useState([
    {
      id: 'prod-1',
      name: 'Dedicated Cloud Server M',
      price: 180,
      variableCost: 70,
      quantity: 450,
      productFixedCost: 18000,
      bottleneckTimeMinutes: 20
    },
    {
      id: 'prod-2',
      name: 'Kubernetes Cluster Managed',
      price: 320,
      variableCost: 140,
      quantity: 250,
      productFixedCost: 22000,
      bottleneckTimeMinutes: 45
    },
    {
      id: 'prod-3',
      name: 'Security Vulnerability Scan Pack',
      price: 90,
      variableCost: 20,
      quantity: 800,
      productFixedCost: 12000,
      bottleneckTimeMinutes: 10
    }
  ]);

  const [companyFixedCosts, setCompanyFixedCosts] = useState(25000);

  const result = calculateTier2ContributionMargin(products, companyFixedCosts);

  const handleClaim = () => {
    if (!completed) {
      setCompleted(true);
      if (onRewardXP) onRewardXP(65);
      else awardXP(65, 'wiso_break_even_master');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-emerald)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calculator size={14} /> IHK Kosten- &amp; Leistungsrechnung
              </span>
              <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <BarChart2 size={14} /> Deckungsbeitrag Stufe 2 &amp; BEP
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={28} style={{ color: 'var(--accent-emerald)' }} />
              IHK Deckungsbeitragsrechnung Stufe 2 &amp; Break-Even-Point Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '820px' }}>
              Kaufmännische Analyse nach IHK-Standard: Deckungsbeitrag I &amp; II (Erzeugnisfixkosten), Unternehmensfixkosten, 
              <strong>relativer Deckungsbeitrag (db_rel)</strong> zur optimalen Ausnutzung von Engpass-Ressourcen und Gewinnschwellen-Berechnung.
            </p>
          </div>

          <div>
            <button
              onClick={handleClaim}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
            >
              <Award size={18} /> {completed ? 'XP bereits verbucht' : 'Kalkulation Bestätigen (+65 XP)'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Financial Summary & Bottleneck Priority */}
      <div className="grid-responsive" style={{ gap: '20px', marginBottom: '24px' }}>
        {/* Left: Summary KPIs */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} style={{ color: 'var(--accent-emerald)' }} /> Betriebsergebnis &amp; Deckungsbeitrags-Stufen
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gesamt-Umsatz:</span>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {result.totalRevenue.toLocaleString()} €
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deckungsbeitrag I (DB I):</span>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-teal)' }}>
                {result.totalContributionMargin1.toLocaleString()} €
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deckungsbeitrag II (DB II):</span>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>
                {result.totalContributionMargin2.toLocaleString()} €
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Betriebsergebnis (Gewinn):</span>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: result.operatingResult >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {result.operatingResult.toLocaleString()} €
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="kf2-input" style={{ fontWeight: '600' }}>Unternehmensfixkosten (Kf2):</label>
            <input
              id="kf2-input"
              type="number"
              value={companyFixedCosts}
              onChange={(e) => setCompanyFixedCosts(Math.max(0, Number(e.target.value) || 0))}
              style={{ width: '110px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontWeight: '700' }}
            />
            <span>€ (abgezogen von DB II)</span>
          </div>
        </div>

        {/* Right: Bottleneck Optimization (Relativer Deckungsbeitrag) */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--accent-amber)' }} /> Engpass-Programm (Relativer DB / Minute)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Bei limitierter Maschinen- oder Entwicklerzeit entscheidet der <strong>relative Deckungsbeitrag (db_rel = db / t)</strong> über die Produktionsreihenfolge:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.bottleneckRanking.map((item) => (
              <div key={item.productId} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-emerald)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    Rang #{item.rank}: {item.name}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                    {item.dbRel} € / Min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Table: db, Kf1, DB II and BEP */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={18} style={{ color: 'var(--accent-emerald)' }} /> Produktspezifische Kalkulation &amp; Gewinnschwellen (Break-Even)
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Produkt</th>
                <th style={{ padding: '10px' }}>Preis (p)</th>
                <th style={{ padding: '10px' }}>Var. Kosten (kv)</th>
                <th style={{ padding: '10px' }}>Stück-db</th>
                <th style={{ padding: '10px' }}>Menge (x)</th>
                <th style={{ padding: '10px' }}>DB I</th>
                <th style={{ padding: '10px' }}>Erzeugnisfix (Kf1)</th>
                <th style={{ padding: '10px' }}>DB II</th>
                <th style={{ padding: '10px' }}>Break-Even (BEP)</th>
              </tr>
            </thead>
            <tbody>
              {result.products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px', fontWeight: '700' }}>{p.name}</td>
                  <td style={{ padding: '10px' }}>
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        setProducts(prev => prev.map(item => item.id === p.id ? { ...item, price: val } : item));
                      }}
                      style={{ width: '70px', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    /> €
                  </td>
                  <td style={{ padding: '10px' }}>{p.variableCost} €</td>
                  <td style={{ padding: '10px', fontWeight: '700', color: 'var(--accent-teal)' }}>{p.unitContributionMargin} €</td>
                  <td style={{ padding: '10px' }}>
                    <input
                      type="number"
                      value={p.quantity}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        setProducts(prev => prev.map(item => item.id === p.id ? { ...item, quantity: val } : item));
                      }}
                      style={{ width: '70px', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    /> Stk.
                  </td>
                  <td style={{ padding: '10px' }}>{p.contributionMargin1.toLocaleString()} €</td>
                  <td style={{ padding: '10px' }}>{p.productFixedCost.toLocaleString()} €</td>
                  <td style={{ padding: '10px', fontWeight: '700', color: p.contributionMargin2 >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {p.contributionMargin2.toLocaleString()} €
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                      {p.breakEvenUnits} Stk. ({p.breakEvenRevenue.toLocaleString()} €)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
