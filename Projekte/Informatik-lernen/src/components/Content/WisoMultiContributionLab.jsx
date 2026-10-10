import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Award, Check, BarChart3 
} from 'lucide-react';
import { 
  DEFAULT_PRODUCT_LINES, 
  calculateMultiContributionMargin 
} from '../../utils/wisoMultiContributionEngine';
import { useStore } from '../../store/useStore';

export default function WisoMultiContributionLab() {
  const { awardXP } = useStore();
  const [products, setProducts] = useState(DEFAULT_PRODUCT_LINES);
  const [groupFix, setGroupFix] = useState(5000);
  const [divisionFix, setDivisionFix] = useState(7000);
  const [companyFix, setCompanyFix] = useState(6000);
  const [xpClaimed, setXpClaimed] = useState(false);

  const result = useMemo(() => {
    return calculateMultiContributionMargin({
      products,
      groupFixCosts: Number(groupFix) || 0,
      divisionFixCosts: Number(divisionFix) || 0,
      companyFixCosts: Number(companyFix) || 0
    });
  }, [products, groupFix, divisionFix, companyFix]);

  const handleUpdateProduct = (id, field, value) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: Number(value) || 0 } : p));
  };

  const handleClaimXP = () => {
    if (!xpClaimed && awardXP) {
      awardXP(60, 'Mehrstufige Deckungsbeitragsrechnung gemeistert!');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color, #1e293b)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Calculator size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                IHK Mehrstufige Deckungsbeitragsrechnung & Break-Even
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
                Fixkostenspaltung (Erzeugnis-, Gruppen-, Bereichs- & Unternehmensfix) & Sicherheitskoeffizient (WISO AP2)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleClaimXP}
          disabled={xpClaimed}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            background: xpClaimed ? '#10b981' : 'linear-gradient(135deg, #10b981, #047857)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: xpClaimed ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {xpClaimed ? <Check size={16} /> : <Award size={16} />}
          {xpClaimed ? 'XP gutgeschrieben' : '+60 XP beanspruchen'}
        </button>
      </div>

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', borderTop: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Betriebsergebnis (Gewinn/Verlust)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: result.isProfitable ? '#10b981' : '#ef4444', marginTop: '4px' }}>
            {result.operatingProfit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Nach Abzug aller 4 Fixkostenstufen</div>
        </div>

        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Break-Even-Umsatz</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#3b82f6', marginTop: '4px' }}>
            {result.breakEvenRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Ist-Umsatz: {result.totalRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
        </div>

        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', borderTop: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Sicherheitskoeffizient</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>
            {result.safetyMarginPercent}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Umsatz-Puffer vor Verlustzone</div>
        </div>
      </div>

      {/* Multi-Step Contribution Matrix */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={20} color="#10b981" /> Mehrstufige Deckungsbeitrags-Kaskade
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
          {/* Step 1: Umsatzerlöse */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontWeight: 700 }}>
            <span>Umsatzerlöse (Gesamt):</span>
            <span>+{result.totalRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>

          {/* Variable Kosten */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: '#ef4444' }}>
            <span>- Variable Kosten (Gesamt):</span>
            <span>-{result.totalVariableCosts.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>

          {/* DB I */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#e0f2fe', borderRadius: '8px', fontWeight: 800, color: '#0369a1' }}>
            <span>= Deckungsbeitrag I (DB I):</span>
            <span>{result.totalDb1.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>

          {/* Stufe 2: Erzeugnisfixkosten */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: '#ef4444' }}>
            <span>- Erzeugnisfixkosten (Produktfixkosten):</span>
            <span>-{result.totalProductFixCosts.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>

          {/* DB II */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#e0f2fe', borderRadius: '8px', fontWeight: 800, color: '#0369a1' }}>
            <span>= Deckungsbeitrag II (DB II):</span>
            <span>{result.totalDb2.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>

          {/* Stufe 3: Erzeugnisgruppenfixkosten */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', color: '#ef4444' }}>
            <span>- Erzeugnisgruppenfixkosten:</span>
            <input
              type="number"
              value={groupFix}
              onChange={(e) => setGroupFix(Number(e.target.value))}
              style={{ width: '120px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}
            />
          </div>

          {/* DB III */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#fef3c7', borderRadius: '8px', fontWeight: 800, color: '#b45309' }}>
            <span>= Deckungsbeitrag III (DB III):</span>
            <span>{result.db3.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>

          {/* Stufe 4: Bereichsfixkosten */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', color: '#ef4444' }}>
            <span>- Bereichsfixkosten (Abteilungsfixkosten):</span>
            <input
              type="number"
              value={divisionFix}
              onChange={(e) => setDivisionFix(Number(e.target.value))}
              style={{ width: '120px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}
            />
          </div>

          {/* DB IV */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#fef3c7', borderRadius: '8px', fontWeight: 800, color: '#b45309' }}>
            <span>= Deckungsbeitrag IV (DB IV):</span>
            <span>{result.db4.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>

          {/* Stufe 5: Unternehmensfixkosten */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', color: '#ef4444' }}>
            <span>- Unternehmensfixkosten (Zentrale Verwaltung):</span>
            <input
              type="number"
              value={companyFix}
              onChange={(e) => setCompanyFix(Number(e.target.value))}
              style={{ width: '120px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}
            />
          </div>

          {/* Betriebsergebnis */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: result.isProfitable ? '#dcfce7' : '#fee2e2', borderRadius: '10px', fontWeight: 900, fontSize: '1.1rem', color: result.isProfitable ? '#15803d' : '#b91c1c' }}>
            <span>= Betriebsergebnis (Netto-Betriebsgewinn):</span>
            <span>{result.operatingProfit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>
        </div>
      </div>

      {/* Product Lines Editor */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px' }}>
          Produkte & Erzeugniskosten anpassen
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <strong style={{ fontSize: '1rem' }}>{p.name}</strong>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Preis pro Stück (€):</label>
                  <input
                    type="number"
                    value={p.pricePerUnit}
                    onChange={(e) => handleUpdateProduct(p.id, 'pricePerUnit', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Var. Kosten/Stück (€):</label>
                  <input
                    type="number"
                    value={p.variableCostPerUnit}
                    onChange={(e) => handleUpdateProduct(p.id, 'variableCostPerUnit', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Absatzmenge (Stück):</label>
                  <input
                    type="number"
                    value={p.unitsSold}
                    onChange={(e) => handleUpdateProduct(p.id, 'unitsSold', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Erzeugnisfix (€):</label>
                  <input
                    type="number"
                    value={p.productFixCosts}
                    onChange={(e) => handleUpdateProduct(p.id, 'productFixCosts', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
