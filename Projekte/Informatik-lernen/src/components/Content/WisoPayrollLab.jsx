import React, { useState, useMemo } from 'react';
import { 
  Calculator, Users, Building, Award, Check 
} from 'lucide-react';
import { calculatePayroll } from '../../utils/wisoPayrollEngine';
import { useStore } from '../../store/useStore';

export default function WisoPayrollLab() {
  const { awardXP } = useStore();
  const [grossSalary, setGrossSalary] = useState(3800);
  const [taxClass, setTaxClass] = useState(1);
  const [hasChildren, setHasChildren] = useState(false);
  const [churchTax, setChurchTax] = useState(false);
  const [benefitsInKind, setBenefitsInKind] = useState(0);
  const [xpClaimed, setXpClaimed] = useState(false);

  const payroll = useMemo(() => {
    return calculatePayroll({
      grossSalary: Number(grossSalary) || 0,
      taxClass: Number(taxClass),
      hasChildren,
      churchTax,
      benefitsInKind: Number(benefitsInKind) || 0
    });
  }, [grossSalary, taxClass, hasChildren, churchTax, benefitsInKind]);

  const handleClaimXP = () => {
    if (!xpClaimed && awardXP) {
      awardXP(60, 'WISO Brutto-Netto & Lohnabrechnungs-Rechner gemeistert!');
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
                WISO Brutto-Netto & Lohnabrechnungs-Studio
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
                Sozialabgaben (KV, PV, RV, AV), Steuerklassen I–VI & Arbeitgeber-Gesamtkostenbelastung nach IHK-Standard
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

      {/* Input Parameters */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px' }}>
          Gehaltsparameter & Steuerdaten
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '6px' }}>
              Bruttomonatsgehalt (€):
            </label>
            <input
              type="number"
              value={grossSalary}
              onChange={(e) => setGrossSalary(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'inherit',
                fontSize: '1rem',
                fontWeight: 700
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '6px' }}>
              Lohnsteuerklasse:
            </label>
            <select
              value={taxClass}
              onChange={(e) => setTaxClass(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'inherit',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              <option value={1}>Klasse I (Ledig, geschieden, getrennt)</option>
              <option value={2}>Klasse II (Alleinerziehend mit Entlastungsbetrag)</option>
              <option value={3}>Klasse III (Verheiratet, Hauptverdiener)</option>
              <option value={4}>Klasse IV (Verheiratet, beide ähnlich viel)</option>
              <option value={5}>Klasse V (Verheiratet, geringer Verdienender)</option>
              <option value={6}>Klasse VI (Zweites Dienstverhältnis / Nebenjob)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '6px' }}>
              Geldwerter Vorteil (€ z. B. Firmenwagen):
            </label>
            <input
              type="number"
              value={benefitsInKind}
              onChange={(e) => setBenefitsInKind(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'inherit',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={hasChildren}
                onChange={(e) => setHasChildren(e.target.checked)}
              />
              <span>Hat Kinder (kein PV-Kinderlosenzuschlag)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={churchTax}
                onChange={(e) => setChurchTax(e.target.checked)}
              />
              <span>Kirchensteuerpflichtig (9%)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Netto */}
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', borderTop: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Netto-Auszahlung (Arbeitnehmer)</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', marginTop: '6px' }}>
            {payroll.employee.netSalary.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Quote: {Math.round((payroll.employee.netSalary / payroll.totalGross) * 100)}% des Bruttogehalts
          </div>
        </div>

        {/* AG Gesamtbelastung */}
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', borderTop: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Arbeitgeber-Gesamtaufwand</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#6366f1', marginTop: '6px' }}>
            {payroll.employer.totalCost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Brutto + {payroll.employer.totalSocial.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} AG-Lohnnebenkosten
          </div>
        </div>
      </div>

      {/* Detail Breakdown Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Employee Breakdown */}
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#10b981" /> Abzüge des Arbeitnehmers
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>Lohnsteuer:</span>
              <strong>{payroll.employee.wageTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
            </div>
            {payroll.employee.soli > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span>Solidaritätszuschlag:</span>
                <strong>{payroll.employee.soli.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
              </div>
            )}
            {payroll.employee.churchTax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span>Kirchensteuer:</span>
                <strong>{payroll.employee.churchTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>Krankenversicherung (KV 7,3% + Zusatz 0,85%):</span>
              <strong>{payroll.employee.health.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>Pflegeversicherung (PV):</span>
              <strong>{payroll.employee.care.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>Rentenversicherung (RV 9,3%):</span>
              <strong>{payroll.employee.pension.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>Arbeitslosenversicherung (AV 1,3%):</span>
              <strong>{payroll.employee.unemployment.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #e2e8f0', fontWeight: 800 }}>
              <span>Gesamtabzüge:</span>
              <span style={{ color: '#ef4444' }}>
                -{(payroll.employee.totalSocial + payroll.employee.totalTaxes).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </div>
        </div>

        {/* Employer Breakdown */}
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="#6366f1" /> Lohnnebenkosten des Arbeitgebers
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>AG-Anteil Krankenversicherung:</span>
              <strong>{payroll.employer.health.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>AG-Anteil Pflegeversicherung (2,2%):</span>
              <strong>{payroll.employer.care.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>AG-Anteil Rentenversicherung (9,3%):</span>
              <strong>{payroll.employer.pension.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>AG-Anteil Arbeitslosenvers. (1,3%):</span>
              <strong>{payroll.employer.unemployment.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>Umlagen (U1 Krankheit, U2 Mutterschutz, U3 Insolvenz):</span>
              <strong>{payroll.employer.levies.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #e2e8f0', fontWeight: 800 }}>
              <span>Zusätzliche AG-Belastung:</span>
              <span style={{ color: '#6366f1' }}>
                +{payroll.employer.totalSocial.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* IHK Wissen */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px', color: '#10b981' }}>
          💡 IHK WISO-Wissen: Paritätsprinzip & Beitragsbemessungsgrenzen
        </h3>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary, #475569)', margin: 0 }}>
          In der deutschen Sozialversicherung gilt das <strong>Paritätsprinzip</strong>: Arbeitnehmer und Arbeitgeber teilen sich die Beiträge zur Kranken-, Pflege-, Renten- und Arbeitslosenversicherung grundsätzlich zu gleichen Teilen (50/50). Eine Ausnahme bildet der <strong>Zuschlag für Kinderlose</strong> in der Pflegeversicherung (+0,6%), den der Arbeitnehmer alleine trägt. Bei Überschreiten der monatlichen <strong>Beitragsbemessungsgrenzen</strong> (KV/PV: 5.175 €, RV/AV: 7.550 €) steigen die Sozialabgaben nicht weiter an.
        </p>
      </div>
    </div>
  );
}
