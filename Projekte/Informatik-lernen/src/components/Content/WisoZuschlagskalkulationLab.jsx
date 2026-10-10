import React, { useState, useMemo } from 'react';
import { 
  Calculator, Check, Award, 
  BarChart3, FileText
} from 'lucide-react';
import { calculateZuschlagskalkulation } from '../../utils/wisoZuschlagskalkulationEngine';
import { useStore } from '../../store/useStore';

export default function WisoZuschlagskalkulationLab() {
  const { awardXP } = useStore();
  const [params, setParams] = useState({
    fertigungsmaterial: 6000,
    materialgemeinkostensatzProzent: 10,
    fertigungslohn: 4000,
    fertigungsgemeinkostensatzProzent: 125,
    sondereinzelkostenFertigung: 300,
    verwaltungsgemeinkostensatzProzent: 8,
    vertriebsgemeinkostensatzProzent: 6,
    sondereinzelkostenVertrieb: 200,
    gewinnzuschlagProzent: 15,
    kundenskontoProzent: 2,
    kundenrabattProzent: 5,
    umsatzsteuerProzent: 19
  });

  const [xpAwarded, setXpAwarded] = useState(false);

  const calc = useMemo(() => {
    return calculateZuschlagskalkulation(params);
  }, [params]);

  const handleChange = (field, val) => {
    setParams((prev) => ({
      ...prev,
      [field]: parseFloat(val) || 0
    }));

    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(60, 'zuschlagskalkulation_master');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ec4899, #db2777)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(236, 72, 153, 0.25)'
          }}>
            <Calculator size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              IHK Fertigungs- & Zuschlagskalkulation Studio
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Material- & Fertigungsgemeinkosten, Herstellkosten, Verwaltung/Vertrieb und Preisfindung
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {xpAwarded ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(16, 185, 129, 0.2)', 
              color: '#10b981', 
              padding: '6px 14px', 
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Check size={16} /> 60 XP erhalten!
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(236, 72, 153, 0.15)', 
              color: '#ec4899', 
              padding: '6px 14px', 
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Award size={16} /> 60 XP verfügbar
            </div>
          )}
        </div>
      </div>

      {/* Grid: Inputs & Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Input Parameters */}
        <div style={{
          background: 'var(--surface-card, #1e293b)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#ec4899" /> Kostenarten & Zuschlagssätze
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Fertigungsmaterial (€ FM):
              </label>
              <input 
                type="number" 
                value={params.fertigungsmaterial} 
                onChange={(e) => handleChange('fertigungsmaterial', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#ffffff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Materialgemeinkostensatz (MGKZ %):
              </label>
              <input 
                type="number" 
                value={params.materialgemeinkostensatzProzent} 
                onChange={(e) => handleChange('materialgemeinkostensatzProzent', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#ffffff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Fertigungslohn (€ FL):
              </label>
              <input 
                type="number" 
                value={params.fertigungslohn} 
                onChange={(e) => handleChange('fertigungslohn', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#ffffff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Fertigungsgemeinkostensatz (FGKZ %):
              </label>
              <input 
                type="number" 
                value={params.fertigungsgemeinkostensatzProzent} 
                onChange={(e) => handleChange('fertigungsgemeinkostensatzProzent', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#ffffff' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  VwGKZ (% auf HK):
                </label>
                <input 
                  type="number" 
                  value={params.verwaltungsgemeinkostensatzProzent} 
                  onChange={(e) => handleChange('verwaltungsgemeinkostensatzProzent', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#ffffff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  VtGKZ (% auf HK):
                </label>
                <input 
                  type="number" 
                  value={params.vertriebsgemeinkostensatzProzent} 
                  onChange={(e) => handleChange('vertriebsgemeinkostensatzProzent', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#ffffff' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Gewinnzuschlag (%):
                </label>
                <input 
                  type="number" 
                  value={params.gewinnzuschlagProzent} 
                  onChange={(e) => handleChange('gewinnzuschlagProzent', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#ffffff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Kundenskonto (%):
                </label>
                <input 
                  type="number" 
                  value={params.kundenskontoProzent} 
                  onChange={(e) => handleChange('kundenskontoProzent', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#ffffff' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Table Result */}
        <div style={{
          background: 'var(--surface-card, #1e293b)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#10b981" /> IHK Kalkulationsschema (Staffelrechnung)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>Fertigungsmaterial (FM):</span>
              <strong>{calc.fertigungsmaterial.toFixed(2)} €</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--text-muted)' }}>
              <span>+ Materialgemeinkosten ({params.materialgemeinkostensatzProzent}%):</span>
              <span>{calc.materialgemeinkosten.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
              <span>= Materialkosten (MK):</span>
              <span>{calc.materialkosten.toFixed(2)} €</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', marginTop: '8px' }}>
              <span>Fertigungslohn (FL):</span>
              <span>{calc.fertigungslohn.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--text-muted)' }}>
              <span>+ Fertigungsgemeinkosten ({params.fertigungsgemeinkostensatzProzent}%):</span>
              <span>{calc.fertigungsgemeinkosten.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--text-muted)' }}>
              <span>+ Sondereinzelkosten d. Fertigung (SEKF):</span>
              <span>{calc.sondereinzelkostenFertigung.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
              <span>= Fertigungskosten (FK):</span>
              <span>{calc.fertigungskosten.toFixed(2)} €</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', margin: '8px 0', fontWeight: 700, color: '#3b82f6' }}>
              <span>= Herstellkosten (HK = MK + FK):</span>
              <span>{calc.herstellkosten.toFixed(2)} €</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--text-muted)' }}>
              <span>+ Verwaltungsgemeinkosten ({params.verwaltungsgemeinkostensatzProzent}% v. HK):</span>
              <span>{calc.verwaltungsgemeinkosten.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--text-muted)' }}>
              <span>+ Vertriebsgemeinkosten ({params.vertriebsgemeinkostensatzProzent}% v. HK):</span>
              <span>{calc.vertriebsgemeinkosten.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--text-muted)' }}>
              <span>+ Sondereinzelkosten d. Vertriebs (SEKV):</span>
              <span>{calc.sondereinzelkostenVertrieb.toFixed(2)} €</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
              <span>= Selbstkosten (SK):</span>
              <span>{calc.selbstkosten.toFixed(2)} €</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#10b981' }}>
              <span>+ Gewinn ({params.gewinnzuschlagProzent}%):</span>
              <span>{calc.gewinn.toFixed(2)} €</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid rgba(236, 72, 153, 0.4)', borderRadius: '10px', marginTop: '10px', fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
              <span>Barverkaufspreis (BVP):</span>
              <span style={{ color: '#ec4899' }}>{calc.barverkaufspreis.toFixed(2)} €</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
