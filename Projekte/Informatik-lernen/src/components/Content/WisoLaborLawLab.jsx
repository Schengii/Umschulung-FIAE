import React, { useState, useMemo } from 'react';
import { Scale, Calendar, AlertCircle, ShieldAlert, CheckCircle, Calculator, Info, Award, Clock } from 'lucide-react';
import { calculateNoticePeriod, evaluateProtection, calculateTerminationCalendarDate } from '../../utils/wisoLaborLawEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WisoLaborLawLab({ onRewardXP }) {
  const { awardXP } = useStore();

  // State für Fristenrechner
  const [yearsInCompany, setYearsInCompany] = useState(3);
  const [isInProbation, setIsInProbation] = useState(false);
  const [isInitiatedByEmployee, setIsInitiatedByEmployee] = useState(false);
  const [receiptDateStr, setReceiptDateStr] = useState(() => new Date().toISOString().slice(0, 10));

  // State für KSchG & Schutzprüfung
  const [employeeCount, setEmployeeCount] = useState(25);
  const [employmentMonths, setEmploymentMonths] = useState(18);
  const [isPregnant, setIsPregnant] = useState(false);
  const [hasDisability, setHasDisability] = useState(false);
  const [isWorksCouncilMember, setIsWorksCouncilMember] = useState(false);
  const [isApprenticeAfterProbation, setIsApprenticeAfterProbation] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState('notice'); // 'notice' | 'protection' | 'cases'
  const [solved, setSolved] = useState(false);

  const noticeResult = useMemo(() => {
    return calculateNoticePeriod(yearsInCompany, isInProbation, isInitiatedByEmployee);
  }, [yearsInCompany, isInProbation, isInitiatedByEmployee]);

  const calendarResult = useMemo(() => {
    return calculateTerminationCalendarDate(receiptDateStr, yearsInCompany, isInProbation, isInitiatedByEmployee);
  }, [receiptDateStr, yearsInCompany, isInProbation, isInitiatedByEmployee]);

  const protectionResult = useMemo(() => {
    return evaluateProtection({
      employeeCount,
      employmentMonths,
      isPregnant,
      hasDisability,
      isWorksCouncilMember,
      isApprenticeAfterProbation
    });
  }, [employeeCount, employmentMonths, isPregnant, hasDisability, isWorksCouncilMember, isApprenticeAfterProbation]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(50);
      } else {
        awardXP(50, 'wiso_labor_law_master');
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={14} /> WISO &amp; Wirtschaftsrecht
            </span>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} /> BGB § 622 &amp; KSchG
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '4px 0 8px 0', color: 'var(--text-main)' }}>
            IHK Arbeitsrecht &amp; Kündigungsschutz Studio
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '780px', margin: 0 }}>
            Interaktiver IHK-Prüfungsrechner für gesetzliche Kündigungsfristen (§ 622 BGB), allgemeine Wartezeiten nach Kündigungsschutzgesetz (KSchG) sowie Sondertatbestände (MuSchG, SGB IX, Betriebsrat &amp; BBiG).
          </p>
        </div>

        <button
          onClick={handleClaim}
          disabled={solved}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={16} />
          {solved ? 'Mastery Freigeschaltet (+50 XP)' : 'WISO Praxisprüfung abschließen'}
        </button>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveSubTab('notice')}
          className={`btn ${activeSubTab === 'notice' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          <Calculator size={15} style={{ marginRight: '6px' }} />
          1. Kündigungsfristen (§ 622 BGB)
        </button>
        <button
          onClick={() => setActiveSubTab('protection')}
          className={`btn ${activeSubTab === 'protection' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          <ShieldAlert size={15} style={{ marginRight: '6px' }} />
          2. KSchG &amp; Besonderer Kündigungsschutz
        </button>
        <button
          onClick={() => setActiveSubTab('cases')}
          className={`btn ${activeSubTab === 'cases' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          <Info size={15} style={{ marginRight: '6px' }} />
          3. IHK Prüfungs-Wissen &amp; Faustformeln
        </button>
      </div>

      {/* TAB 1: Kündigungsfristen Rechner */}
      {activeSubTab === 'notice' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Controls */}
          <div style={{ background: 'var(--bg-card-hover)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} className="text-primary" /> Parameter der Kündigung
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={isInProbation}
                  onChange={(e) => {
                    setIsInProbation(e.target.checked);
                    if (e.target.checked) setYearsInCompany(0);
                  }}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: 600 }}>Arbeitnehmer befindet sich in der Probezeit (max. 6 Monate)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isInitiatedByEmployee}
                  onChange={(e) => setIsInitiatedByEmployee(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: 600 }}>Kündigung erfolgt durch den Arbeitnehmer (Eigenkündigung)</span>
              </label>
            </div>

            {!isInProbation && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Betriebszugehörigkeit im Unternehmen:</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--accent-primary)' }}>{yearsInCompany} Jahre</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={yearsInCompany}
                  disabled={isInProbation}
                  onChange={(e) => setYearsInCompany(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>0 Jahre</span>
                  <span>2 J.</span>
                  <span>5 J.</span>
                  <span>10 J.</span>
                  <span>20+ J.</span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-main)' }}>
                <Calendar size={16} /> Datum des Kündigungszugangs (§ 130 BGB):
              </label>
              <input
                type="date"
                value={receiptDateStr}
                onChange={(e) => setReceiptDateStr(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontWeight: 600
                }}
              />
            </div>

            <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>Hinweis IHK WISO:</strong> Während der Probezeit beträgt die Frist immer 2 Wochen zu jedem Tag. Bei Kündigung durch den AN gilt stets die 4-Wochen-Frist zum 15. oder Monatsende, sofern vertraglich nicht die längeren AG-Fristen vereinbart wurden.
            </div>
          </div>

          {/* Result Card */}
          <div style={{ background: 'var(--bg-card-hover)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '2px solid var(--accent-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: '12px' }}>Gesetzliches Ergebnis</span>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0', color: 'var(--text-main)' }}>
                {noticeResult.summary}
              </h4>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fristlänge:</span>
                  <strong>{noticeResult.termWeeks > 0 ? `${noticeResult.termWeeks} Wochen` : `${noticeResult.termMonths} Monat(e)`}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Kündigungstermin:</span>
                  <strong style={{ textAlign: 'right', maxWidth: '240px', fontSize: '0.88rem' }}>{noticeResult.targetDateDescription}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Rechtsgrundlage:</span>
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '0.88rem' }}>{noticeResult.legalBasis}</strong>
                </div>
                {calendarResult.isValid && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid var(--accent-primary)', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem' }}>📅 Letzter Arbeitstag (Beendigung):</span>
                      <strong style={{ color: 'var(--accent-primary)', fontSize: '1.05rem' }}>{calendarResult.terminationDateFormatted}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', borderRadius: '8px' }}>
                      <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.88rem' }}>⚖️ 3-Wochen-Klagefrist (§ 4 KSchG):</span>
                      <strong style={{ color: '#ef4444', fontSize: '0.95rem' }}>bis {calendarResult.lawsuitDeadlineFormatted}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                Schriftformerfordernis nach § 623 BGB: Eine Kündigung per E-Mail, WhatsApp oder Fax ist <strong>nichtig</strong>!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KSchG & Schutzprüfung */}
      {activeSubTab === 'protection' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Controls */}
          <div style={{ background: 'var(--bg-card-hover)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Betriebs- &amp; Personaldaten</h3>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mitarbeiteranzahl im Betrieb:</span>
                <strong style={{ color: employeeCount > 10 ? '#10b981' : '#f59e0b' }}>{employeeCount} MA</strong>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Schwellenwert KSchG: Mehr als 10 Vollzeitäquivalente (§ 23 KSchG).
              </span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dauer des Arbeitsverhältnisses:</span>
                <strong style={{ color: employmentMonths > 6 ? '#10b981' : '#f59e0b' }}>{employmentMonths} Monate</strong>
              </div>
              <input
                type="range"
                min="1"
                max="36"
                value={employmentMonths}
                onChange={(e) => setEmploymentMonths(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Wartezeit KSchG: Länger als 6 Monate (§ 1 Abs. 1 KSchG).
              </span>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '20px', marginBottom: '12px' }}>
              Besondere Schutzmerkmale (Sonderkündigungsschutz):
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={isPregnant} onChange={(e) => setIsPregnant(e.target.checked)} />
                <span>Schwangerschaft / Mutterschutz (§ 17 MuSchG)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={hasDisability} onChange={(e) => setHasDisability(e.target.checked)} />
                <span>Schwerbehinderung ab GdB 50 (§ 168 SGB IX)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={isWorksCouncilMember} onChange={(e) => setIsWorksCouncilMember(e.target.checked)} />
                <span>Mitglied im Betriebsrat / JAV (§ 15 KSchG)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={isApprenticeAfterProbation} onChange={(e) => setIsApprenticeAfterProbation(e.target.checked)} />
                <span>Auszubildender nach Probezeit (§ 22 BBiG)</span>
              </label>
            </div>
          </div>

          {/* Protection Evaluation Result */}
          <div style={{ background: 'var(--bg-card-hover)', padding: '24px', borderRadius: 'var(--radius-lg)', border: protectionResult.hasSpecialProtection ? '2px solid #ef4444' : protectionResult.hasGeneralProtection ? '2px solid #10b981' : '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                {protectionResult.hasSpecialProtection ? (
                  <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={14} /> Besonderer Schutz aktiv
                  </span>
                ) : protectionResult.hasGeneralProtection ? (
                  <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Allgemeiner KSchG Schutz aktiv
                  </span>
                ) : (
                  <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={14} /> Kein KSchG Kündigungsschutz
                  </span>
                )}
              </div>

              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0 16px 0', color: 'var(--text-main)' }}>
                {protectionResult.summary}
              </h4>

              {protectionResult.hasSpecialProtection && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#ef4444', display: 'block', marginBottom: '6px' }}>
                    Gefundene Ausschlussgründe / Zustimmungsbedarfe:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    {protectionResult.specialProtectionReasons.map((r, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong>Voraussetzungen KSchG:</strong>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px' }}>
                  <li style={{ color: employeeCount > 10 ? '#10b981' : '#f59e0b' }}>
                    Betriebsgröße &gt; 10 Mitarbeiter: {employeeCount > 10 ? 'Erfüllt' : 'Nicht erfüllt (Kleinbetrieb)'}
                  </li>
                  <li style={{ color: employmentMonths > 6 ? '#10b981' : '#f59e0b' }}>
                    Wartezeit &gt; 6 Monate: {employmentMonths > 6 ? 'Erfüllt' : 'Nicht erfüllt'}
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>Kündigungsschutzklage (§ 4 KSchG):</strong> Muss innerhalb von genau <strong>3 Wochen</strong> nach Zugang der schriftlichen Kündigung beim Arbeitsgericht erhoben werden!
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Wissens-Box & IHK Prüfungstipps */}
      {activeSubTab === 'cases' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-card-hover)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>
              Personenbedingte Kündigung
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Kündigung wegen fehlender Eignung oder dauerhafter Krankheit (negative Zukunftsprognose, erhebliche Beeinträchtigung betrieblicher Interessen, Interessenabwägung). Keine vorherige Abmahnung erforderlich.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card-hover)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>
              Verhaltensbedingte Kündigung
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Schuldhaftes Fehlverhalten (z.B. wiederholtes Zuspätkommen, Arbeitsverweigerung, Beleidigung). Grundsätzlich ist eine <strong>einschlägige Abmahnung</strong> als milderes Mittel zwingend vorausgesetzt!
            </p>
          </div>

          <div style={{ background: 'var(--bg-card-hover)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>
              Betriebsbedingte Kündigung &amp; Sozialauswahl
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Wegfall des Arbeitsplatzes durch Auftragsmangel oder Umstrukturierung. Zwingende <strong>Sozialauswahl (§ 1 Abs. 3 KSchG)</strong> nach: 1. Dauer Betriebszugehörigkeit, 2. Lebensalter, 3. Unterhaltspflichten, 4. Schwerbehinderung.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card-hover)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#10b981', marginBottom: '8px' }}>
              Fristlose Kündigung (§ 626 BGB)
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Aus wichtigem Grund (z.B. Diebstahl, tätlicher Angriff). Unzumutbarkeit der Fortführung. Ausschlussfrist: Muss innerhalb von <strong>2 Wochen</strong> ab Kenntnis des Grundes ausgesprochen werden!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
