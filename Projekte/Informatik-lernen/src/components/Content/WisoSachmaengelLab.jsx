import React, { useState, useId } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Award,
  FileText
} from 'lucide-react';
import {
  evaluateSachmangelRights,
  MANGEL_TYPES
} from '../../utils/wisoSachmaengelEngine';

const IHK_DRILL_QUESTIONS = [
  {
    id: 1,
    question: 'Welches Recht steht einem Käufer bei einem Sachmangel nach BGB § 437 vorrangig zu?',
    options: [
      'Sofortiger Rücktritt vom Kaufvertrag und Geld zurück',
      'Nacherfüllung (Wahlrecht zwischen Nachbesserung und Neulieferung)',
      'Sofortige Kaufpreisminderung um mindestens 30%',
      'Strafanzeige wegen arglistiger Täuschung bei der Polizei'
    ],
    correctIndex: 1,
    explanation: 'Nach BGB § 437 Nr. 1 i.V.m. § 439 hat die Nacherfüllung absoluten Vorrang. Der Käufer hat hierbei das gesetzliche Wahlrecht zwischen Nachbesserung (Reparatur) oder Nachlieferung einer mangelfreien Sache.'
  },
  {
    id: 2,
    question: 'Was passiert beim beiderseitigen Handelskauf (B2B nach HGB § 377), wenn ein offener Mangel erst 3 Wochen nach Lieferung gerügt wird?',
    options: [
      'Der Käufer kann weiterhin uneingeschränkt Nacherfüllung verlangen',
      'Die Ware gilt als genehmigt; sämtliche Gewährleistungsansprüche erlöschen',
      'Der Verkäufer muss automatisch 50% Schadensersatz leisten',
      'Die Verjährungsfrist verlängert sich auf 5 Jahre'
    ],
    correctIndex: 1,
    explanation: 'Nach HGB § 377 Abs. 2 gilt die Ware bei unterlassener unverzüglicher Rüge als genehmigt (Genehmigungsfiktion). Der kaufmännische Käufer verliert damit alle Rechte auf Nacherfüllung, Rücktritt, Minderung und Schadensersatz.'
  },
  {
    id: 3,
    question: 'Wie lange gilt beim Verbrauchsgüterkauf (B2C seit 2022) die gesetzliche Beweislastumkehr nach BGB § 477?',
    options: [
      '6 Monate ab Übergabe',
      '1 Jahr (12 Monate) ab Übergabe der Ware',
      '2 Jahre (volle Gewährleistungszeit)',
      '14 Tage im Rahmen des Widerrufsrechts'
    ],
    correctIndex: 1,
    explanation: 'Mit der BGB-Reform 2022 wurde die Frist der Beweislastumkehr beim Verbrauchsgüterkauf von 6 Monaten auf volle 12 Monate (1 Jahr) verdoppelt. Zeigt sich der Mangel in diesem Zeitraum, wird gesetzlich vermutet, dass er bereits bei Gefahrübergang vorlag.'
  }
];

export default function WisoSachmaengelLab({ onRewardXP = () => {} }) {
  const [activeTab, setActiveTab] = useState('simulator');
  const [selectedMangelKey, setSelectedMangelKey] = useState('BESCHAFFENHEIT');

  // Simulator Scenario State
  const [contractType, setContractType] = useState('B2B_HANDELSKAUF');
  const [isOpenDefect, setIsOpenDefect] = useState(true);
  const [noticeDays, setNoticeDays] = useState(1);
  const [attempts, setAttempts] = useState(0);
  const [sellerRefused, setSellerRefused] = useState(false);
  const [flawIsMinor, setFlawIsMinor] = useState(false);
  const [monthsSincePurchase, setMonthsSincePurchase] = useState(2);

  // Drill State
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillSubmitted, setDrillSubmitted] = useState(false);
  const [claimedXP, setClaimedXP] = useState(false);

  const noticeDaysInputId = useId();
  const attemptsInputId = useId();
  const monthsInputId = useId();

  // Engine evaluation
  const evaluation = evaluateSachmangelRights({
    mangelType: selectedMangelKey,
    contractType,
    isOpenDefect,
    inspectionNoticeWithinDays: noticeDays,
    nacherfuellungAttempts: attempts,
    sellerRefused,
    flawIsMinor,
    monthsSincePurchase
  });

  const handleDrillSubmit = () => {
    setDrillSubmitted(true);
    let correct = 0;
    IHK_DRILL_QUESTIONS.forEach((q) => {
      if (drillAnswers[q.id] === q.correctIndex) correct++;
    });

    if (correct === IHK_DRILL_QUESTIONS.length && !claimedXP) {
      onRewardXP(55, 'wiso_sachmaengel_master');
      setClaimedXP(true);
    }
  };

  return (
    <div className="sachmaengel-lab-container" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(180, 83, 9, 0.15) 0%, rgba(67, 56, 202, 0.15) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Scale size={28} style={{ color: 'var(--accent-amber)' }} />
              <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
                IHK WISO Sachmängelhaftung & Gewährleistung Studio
              </h1>
            </div>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
              Kaufvertragsstörungen nach BGB § 434 ff. vs. HGB § 377: Nacherfüllung, Rücktritt, Minderung, Rügepflicht & Beweislast
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          {[
            { id: 'simulator', label: 'Interaktiver Rechtsprüfungs-Simulator', icon: Scale },
            { id: 'katalog', label: 'Mangelarten-Katalog (§ 434 BGB)', icon: FileText },
            { id: 'drill', label: 'IHK-Prüfungsdrill (+55 XP)', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isActive ? '1px solid var(--accent-amber)' : '1px solid transparent',
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? 'var(--accent-amber)' : 'var(--text-dim)',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator Tab */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Controls Column */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Vertrags- & Sachverhaltsparameter</h2>

            {/* Contract Type */}
            <div>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Vertragsart (Käufer vs. Verkäufer)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setContractType('B2B_HANDELSKAUF')}
                  aria-label="Vertrag: B2B Handelskauf"
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    fontSize: '0.8rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-color)',
                    background: contractType === 'B2B_HANDELSKAUF' ? 'var(--accent-primary)' : 'var(--bg-primary)',
                    color: contractType === 'B2B_HANDELSKAUF' ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  B2B (Handelskauf HGB § 377)
                </button>
                <button
                  type="button"
                  onClick={() => setContractType('B2C_VERBRAUCHER')}
                  aria-label="Vertrag: B2C Verbrauchsgüterkauf"
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    fontSize: '0.8rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-color)',
                    background: contractType === 'B2C_VERBRAUCHER' ? 'var(--accent-teal)' : 'var(--bg-primary)',
                    color: contractType === 'B2C_VERBRAUCHER' ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  B2C (Verbraucher BGB § 474)
                </button>
              </div>
            </div>

            {/* Mangelart */}
            <div>
              <label htmlFor="mangel-select" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Vorliegende Mangelart
              </label>
              <select
                id="mangel-select"
                aria-label="Mangelart auswählen"
                value={selectedMangelKey}
                onChange={(e) => setSelectedMangelKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              >
                {Object.entries(MANGEL_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.title} ({v.paragraph})
                  </option>
                ))}
              </select>
            </div>

            {/* Defect Open vs Hidden */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Art des Mangels bei Lieferung:</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setIsOpenDefect(true)}
                  aria-label="Mangelart: Offener Mangel"
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-color)',
                    background: isOpenDefect ? 'var(--accent-amber)' : 'var(--bg-primary)',
                    color: isOpenDefect ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Offener Mangel
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpenDefect(false)}
                  aria-label="Mangelart: Versteckter Mangel"
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-color)',
                    background: !isOpenDefect ? 'var(--accent-purple)' : 'var(--bg-primary)',
                    color: !isOpenDefect ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Versteckter Mangel
                </button>
              </div>
            </div>

            {/* Notice Days */}
            {contractType === 'B2B_HANDELSKAUF' && (
              <div>
                <label htmlFor={noticeDaysInputId} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Rügeerteilung nach Wareneingang: <strong>{noticeDays} Tage</strong>
                  {noticeDays > 3 && isOpenDefect && (
                    <span style={{ color: 'var(--accent-rose)', marginLeft: '0.5rem' }}>&bull; Zu spät gerügt!</span>
                  )}
                </label>
                <input
                  id={noticeDaysInputId}
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={noticeDays}
                  onChange={(e) => setNoticeDays(Number(e.target.value))}
                  style={{ width: '100%' }}
                  aria-label="Rügeerteilung in Tagen anpassen"
                />
              </div>
            )}

            {/* Nacherfüllungsversuche */}
            <div>
              <label htmlFor={attemptsInputId} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Bisherige erfolglose Nachbesserungsversuche des Verkäufers: <strong>{attempts}</strong>
              </label>
              <input
                id={attemptsInputId}
                type="range"
                min="0"
                max="3"
                step="1"
                value={attempts}
                onChange={(e) => setAttempts(Number(e.target.value))}
                style={{ width: '100%' }}
                aria-label="Nachbesserungsversuche anpassen"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                (Nach BGB § 440 Satz 2 gilt Nachbesserung in der Regel nach dem 2. Versuch als fehlgeschlagen)
              </span>
            </div>

            {/* Months Since Purchase */}
            <div>
              <label htmlFor={monthsInputId} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Zeitpunkt seit Kauf / Übergabe: <strong>{monthsSincePurchase} Monate</strong>
                {contractType === 'B2C_VERBRAUCHER' && (
                  <span style={{ color: monthsSincePurchase <= 12 ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                    {monthsSincePurchase <= 12 ? '• Beweislastumkehr aktiv (§ 477)' : '• Beweislast beim Käufer (> 12 Mon.)'}
                  </span>
                )}
              </label>
              <input
                id={monthsInputId}
                type="range"
                min="1"
                max="24"
                step="1"
                value={monthsSincePurchase}
                onChange={(e) => setMonthsSincePurchase(Number(e.target.value))}
                style={{ width: '100%' }}
                aria-label="Monate seit Kauf anpassen"
              />
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  id="refused-checkbox"
                  type="checkbox"
                  checked={sellerRefused}
                  onChange={(e) => setSellerRefused(e.target.checked)}
                  style={{ width: '1.1rem', height: '1.1rem' }}
                />
                <label htmlFor="refused-checkbox" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Verkäufer verweigert Nacherfüllung ernsthaft & endgültig
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  id="minor-checkbox"
                  type="checkbox"
                  checked={flawIsMinor}
                  onChange={(e) => setFlawIsMinor(e.target.checked)}
                  style={{ width: '1.1rem', height: '1.1rem' }}
                />
                <label htmlFor="minor-checkbox" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Mangel ist geringfügig / Bagatellmangel (§ 323 Abs. 5)
                </label>
              </div>
            </div>
          </div>

          {/* Legal Rights Evaluation Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Juristisches Prüfungsergebnis</h2>

            {/* Genehmigungsfiktion Banner */}
            {evaluation.goodsDeemedAccepted ? (
              <div
                style={{
                  background: 'rgba(190, 18, 60, 0.1)',
                  border: '1px solid var(--accent-rose)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <AlertTriangle size={24} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>Genehmigungsfiktion nach HGB § 377 Abs. 2!</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    Die Ware gilt unwiderruflich als genehmigt, da die kaufmännische Rügefrist versäumt wurde. Keine Ansprüche möglich!
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(4, 120, 87, 0.1)',
                  border: '1px solid var(--accent-emerald)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <CheckCircle2 size={24} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>Gewährleistungsrechte aktiv</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    Beweislast liegt bei: <strong>{evaluation.burdenOfProof === 'SELLER' ? 'VERKÄUFER (Beweislastumkehr 1 Jahr § 477)' : 'KÄUFER'}</strong> &bull; Verjährung: 2 Jahre (§ 438)
                  </div>
                </div>
              </div>
            )}

            {/* Rights List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {evaluation.availableRights.map((right) => (
                <div
                  key={right.name}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${right.allowed ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {right.name} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 400 }}>({right.paragraph})</span>
                    </div>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: right.allowed ? 'rgba(4, 120, 87, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                        color: right.allowed ? 'var(--accent-emerald)' : 'var(--text-dim)'
                      }}
                    >
                      {right.allowed ? 'ZULÄSSIG' : 'GESPERRT'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>{right.reason}</div>
                </div>
              ))}
            </div>

            {/* Recommended Action */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-amber)' }}>IHK-HANDLUNGSEMPFEHLUNG:</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {evaluation.recommendation}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Tab */}
      {activeTab === 'katalog' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} style={{ color: 'var(--accent-amber)' }} />
            Mangelarten-Katalog nach BGB § 434 & § 435
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {Object.values(MANGEL_TYPES).map((m) => (
              <div
                key={m.type}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.title}</span>
                  <span
                    style={{
                      background: 'rgba(180, 83, 9, 0.1)',
                      color: 'var(--accent-amber)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {m.paragraph}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{m.description}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem', fontStyle: 'italic' }}>
                  Beispiel: {m.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drill Tab */}
      {activeTab === 'drill' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={22} style={{ color: 'var(--accent-amber)' }} />
                IHK-Prüfungsdrill: Sachmängelhaftung & Gewährleistung
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Beantworte alle 3 Rechtsfragen korrekt, um +55 XP zu verdienen.
              </p>
            </div>
            {claimedXP && (
              <span
                style={{
                  background: 'rgba(4, 120, 87, 0.15)',
                  color: 'var(--accent-emerald)',
                  border: '1px solid var(--accent-emerald)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                +55 XP Freigeschaltet!
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {IHK_DRILL_QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  {idx + 1}. {q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = drillAnswers[q.id] === optIdx;
                    const isCorrect = q.correctIndex === optIdx;
                    let borderCol = 'var(--border-color)';
                    let bgCol = 'var(--bg-card)';

                    if (drillSubmitted) {
                      if (isCorrect) {
                        borderCol = 'var(--accent-emerald)';
                        bgCol = 'rgba(4, 120, 87, 0.1)';
                      } else if (isSelected) {
                        borderCol = 'var(--accent-rose)';
                        bgCol = 'rgba(190, 18, 60, 0.1)';
                      }
                    } else if (isSelected) {
                      borderCol = 'var(--accent-amber)';
                      bgCol = 'rgba(180, 83, 9, 0.08)';
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => !drillSubmitted && setDrillAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        aria-label={`Antwort ${optIdx + 1}: ${opt}`}
                        style={{
                          textAlign: 'left',
                          padding: '0.6rem 0.8rem',
                          borderRadius: 'var(--radius-xs)',
                          border: `1px solid ${borderCol}`,
                          background: bgCol,
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          cursor: drillSubmitted ? 'default' : 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {drillSubmitted && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <ShieldCheck size={14} style={{ display: 'inline', marginRight: '0.3rem', color: 'var(--accent-amber)' }} />
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            {drillSubmitted ? (
              <button
                type="button"
                onClick={() => {
                  setDrillSubmitted(false);
                  setDrillAnswers({});
                }}
                aria-label="Prüfungsdrill wiederholen"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Nochmals versuchen
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDrillSubmit}
                aria-label="Antworten prüfen und XP sichern"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'var(--accent-amber)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Antworten auswerten
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
