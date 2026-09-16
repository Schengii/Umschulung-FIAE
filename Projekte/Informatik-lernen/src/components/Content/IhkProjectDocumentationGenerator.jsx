import React, { useState } from 'react';

import { FileText, Download, CheckCircle2, Calculator, Clock } from 'lucide-react';
import { IHK_PROJECT_TEMPLATES } from '../../data/nextGenLabsData';
import { useStore } from '../../store/useStore';

export default function IhkProjectDocumentationGenerator() {
  const { awardXP } = useStore();
  const [selectedRole, setSelectedRole] = useState('fiae'); // 'fiae' | 'fisi'
  const [projectTitle, setProjectTitle] = useState('Entwicklung eines DSGVO-konformen REST API Microservices für Kunden-Audits');
  const [hourlyRate, setHourlyRate] = useState(85);
  const [savedCostPerYear, setSavedCostPerYear] = useState(18000);
  const [isExported, setIsExported] = useState(false);

  const template = IHK_PROJECT_TEMPLATES[selectedRole];
  const [phaseHours, setPhaseHours] = useState(
    template.phases.reduce((acc, phase) => ({ ...acc, [phase.name]: phase.defaultHours }), {})
  );

  const totalCalculatedHours = Object.values(phaseHours).reduce((a, b) => Number(a) + Number(b), 0);
  const isBudgetValid = totalCalculatedHours === template.budgetHours;

  // Amortisationsrechnung (Wirtschaftlichkeitsanalyse)
  const totalProjectCost = totalCalculatedHours * hourlyRate;
  const amortizationYears = savedCostPerYear > 0 ? (totalProjectCost / savedCostPerYear).toFixed(2) : 0;

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    const newTemplate = IHK_PROJECT_TEMPLATES[role];
    setPhaseHours(newTemplate.phases.reduce((acc, phase) => ({ ...acc, [phase.name]: phase.defaultHours }), {}));
    if (role === 'fiae') {
      setProjectTitle('Entwicklung eines DSGVO-konformen REST API Microservices für Kunden-Audits');
    } else {
      setProjectTitle('Aufbau und Migration einer hochverfügbaren Proxmox VE Virtualisierungs-Cluster-Infrastruktur mit OPNsense Firewall');
    }
  };

  const handleExportMarkdown = () => {
    const mdContent = `# IHK Projektdokumentation & Projektantrag
**Projektbezeichnung:** ${projectTitle}
**Ausbildungsberuf:** ${template.title}
**Zeitbudget:** ${template.budgetHours} Stunden (Geplant: ${totalCalculatedHours}h)

---

## 1. Phasen- und Zeitplanung (Gantt-Kalkulation)
${template.phases.map(p => `### ${p.name} (${phaseHours[p.name] || p.defaultHours} Stunden)
${p.tasks.map(t => `- [x] ${t}`).join('\n')}`).join('\n\n')}

---

## 2. Wirtschaftlichkeitsanalyse & Amortisationsrechnung
- **Stundensatz Entwickler/Systemintegrator:** ${hourlyRate} € / h
- **Gesamte Projektkosten:** ${totalProjectCost.toLocaleString('de-DE')} € (${totalCalculatedHours}h × ${hourlyRate}€)
- **Jährliche Kosteneinsparung / Nutzen:** ${savedCostPerYear.toLocaleString('de-DE')} € / Jahr
- **Amortisationsdauer (Break-Even):** **${amortizationYears} Jahre** (${(amortizationYears * 12).toFixed(1)} Monate)

---

## 3. Datenschutz- & Qualitäts-Checkliste (DSGVO & ISO 9241)
- [x] Privacy by Design & Privacy by Default eingehalten
- [x] Keine Speicherung von ungesalzenen Klartext-Passwörtern (Argon2id / Bcrypt)
- [x] Vollständiges Testprotokoll und Lasttest-Nachweis im Anhang
- [x] Kundengerechte Übergabe und Betriebsdokumentation erstellt

*Generiert mit IT-DevGame IHK-Assistant*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IHK_Projektantrag_${selectedRole.toUpperCase()}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);

    if (!isExported) {
      setIsExported(true);
      awardXP(75, 'IHK Master: Projektantrag generiert');
    }
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '20px', color: '#4ade80', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
          <FileText size={16} /> IHK Abschlussprüfung Teil 2 (AP2) Assistent (LF 12a / LF 12b)
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
          IHK Projektantrags- & Dokumentations-Generator
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Erstelle regelkonforme 80h- (FIAE) oder 40h- (FISI) Zeitpläne, berechne Wirtschaftlichkeit & ROI und exportiere den fertigen Antrag als Markdown.
        </p>
      </div>

      {/* Role Switcher */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => handleRoleChange('fiae')}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '10px',
            border: selectedRole === 'fiae' ? '2px solid #6366f1' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
            background: selectedRole === 'fiae' ? 'rgba(99, 102, 241, 0.15)' : 'var(--card-bg, #1e293b)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          💻 Fachinformatiker Anwendungsentwicklung (80 Stunden)
        </button>
        <button
          onClick={() => handleRoleChange('fisi')}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '10px',
            border: selectedRole === 'fisi' ? '2px solid #22c55e' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
            background: selectedRole === 'fisi' ? 'rgba(34, 197, 94, 0.15)' : 'var(--card-bg, #1e293b)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          🌐 Fachinformatiker Systemintegration (40 Stunden)
        </button>
      </div>

      {/* Project Title Input */}
      <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '20px', marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Projektbezeichnung (Thema der Projektarbeit):
        </label>
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Left: Phase Planning (Gantt Budget) */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>
              <Clock size={18} color="#38bdf8" /> Phasen & Stundenkalkulation
            </div>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 'bold',
              padding: '4px 10px',
              borderRadius: '20px',
              background: isBudgetValid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isBudgetValid ? '#4ade80' : '#f87171',
              border: `1px solid ${isBudgetValid ? '#22c55e' : '#ef4444'}`
            }}>
              Summe: {totalCalculatedHours}h / {template.budgetHours}h {isBudgetValid ? '✓ Exakt' : '⚠️ Abweichung'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {template.phases.map(phase => (
              <div key={phase.name} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#e2e8f0' }}>{phase.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={phaseHours[phase.name] || phase.defaultHours}
                      onChange={(e) => setPhaseHours({ ...phaseHours, [phase.name]: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '50px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: '#0f172a',
                        border: '1px solid #475569',
                        color: '#38bdf8',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    />
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Std.</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {phase.tasks.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Wirtschaftlichkeitsrechnung (Amortisation & ROI) */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#fff', fontSize: '1rem', marginBottom: '16px' }}>
              <Calculator size={18} color="#fbbf24" /> Wirtschaftlichkeits- & Amortisationsanalyse
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Stundensatz (€/h):</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Jährl. Einsparung (€/a):</label>
                <input
                  type="number"
                  value={savedCostPerYear}
                  onChange={(e) => setSavedCostPerYear(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: '#fff' }}
                />
              </div>
            </div>

            {/* Calculated Result Card */}
            <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#fde68a', marginBottom: '4px' }}>Gesamte Projektkosten (Investition):</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fbbf24', marginBottom: '10px' }}>
                {totalProjectCost.toLocaleString('de-DE')} €
              </div>
              <div style={{ fontSize: '0.85rem', color: '#fde68a', marginBottom: '4px' }}>Amortisationsdauer (Break-Even-Point):</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#4ade80' }}>
                {amortizationYears} Jahre <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>({(amortizationYears * 12).toFixed(1)} Monate)</span>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.4' }}>
              💡 <strong>IHK Prüfer-Tipp:</strong> Eine Amortisationszeit unter 1,5 Jahren gilt bei IHK-Prüfungsausschüssen als hochgradig wirtschaftlich und begründet die Investition perfekt.
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportMarkdown}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          >
            {isExported ? <CheckCircle2 size={18} /> : <Download size={18} />}
            {isExported ? 'Projektantrag erfolgreich heruntergeladen (+75 XP)' : 'Projektantrag als Markdown (.md) exportieren'}
          </button>
        </div>

      </div>
    </div>
  );
}
