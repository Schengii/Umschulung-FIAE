import React, { useState, useId } from 'react';
import {
  HardDrive,
  ShieldCheck,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';
import {
  calculateBackupStorage,
  calculateGfsRotation,
  calculateRtoRpoLoss,
  audit321Rule
} from '../../utils/backupStrategyEngine';

const IHK_DRILL_QUESTIONS = [
  {
    id: 1,
    question: 'Welche Sicherungen werden bei der Wiederherstellung einer differentiellen Sicherung vom Donnerstag benötigt (letzte Vollsicherung war Sonntag)?',
    options: [
      'Nur die differentielle Sicherung von Donnerstag',
      'Die Vollsicherung von Sonntag + die differentielle Sicherung von Donnerstag',
      'Die Vollsicherung von Sonntag + die inkrementellen Sicherungen von Montag bis Donnerstag',
      'Alle differentiellen Sicherungen von Montag, Dienstag, Mittwoch und Donnerstag'
    ],
    correctIndex: 1,
    explanation: 'Eine differentielle Sicherung sichert stets alle Änderungen seit der letzten Vollsicherung kumulativ. Zur Wiederherstellung genügen daher die letzte Vollsicherung und genau die letzte differentielle Sicherung.'
  },
  {
    id: 2,
    question: 'Wie viele physische Sicherungsbänder werden im klassischen Großvater-Vater-Sohn-Prinzip (Jahressicherung) typischerweise mindestens vorgehalten?',
    options: [
      '7 Bänder (für jeden Wochentag eines)',
      '14 Bänder (für zwei Wochen)',
      '20 Bänder (4 Sohn-Tagesbänder, 4 Vater-Wochenbänder, 12 Großvater-Monatsbänder)',
      '365 Bänder (für jeden Tag des Jahres)'
    ],
    correctIndex: 2,
    explanation: 'Standard nach BSI IT-Grundschutz und IHK: 4 Sohn-Bänder (Mo-Do rotierend), 4 Vater-Bänder (Fr 1-4 rotierend im Monat) und 12 Großvater-Bänder (Monatsende archiviert für 1 Jahr) = genau 20 Bänder.'
  },
  {
    id: 3,
    question: 'Was bezeichnet die Metrik RPO (Recovery Point Objective)?',
    options: [
      'Die maximale Zeitspanne, die ein System nach einem Ausfall offline sein darf',
      'Der maximal tolerierbare Datenverlustzeitraum (gemessen in Stunden oder Minuten)',
      'Die physische Entfernung zum sekundären Rechenzentrumsstandort in Kilometern',
      'Die Übertragungsgeschwindigkeit der Glasfaserleitung zum Cloud-Backup'
    ],
    correctIndex: 1,
    explanation: 'RPO (Recovery Point Objective) definiert den maximal akzeptablen Zeitraum, für den Daten durch einen Vorfall verloren gehen dürfen (z. B. RPO = 1 Stunde bedeutet max. Datenverlust von 60 Minuten).'
  }
];

export default function BackupStrategyLab({ onRewardXP = () => {} }) {
  const [baseDataGb, setBaseDataGb] = useState(2000);
  const [dailyDeltaPercent, setDailyDeltaPercent] = useState(5);
  const [useCompression, setUseCompression] = useState(true);
  const [activeTab, setActiveTab] = useState('methods');

  // RTO / RPO State
  const [rtoHours, setRtoHours] = useState(4);
  const [rpoHours, setRpoHours] = useState(2);
  const [hourlyLossEur, setHourlyLossEur] = useState(5000);

  // 3-2-1 Audit State
  const [auditAnswers, setAuditAnswers] = useState({
    copiesCount: 3,
    differentMedia: true,
    offsiteLocation: true,
    airGappedImmutable: true,
    automatedVerificationTests: true
  });

  // Drill State
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillSubmitted, setDrillSubmitted] = useState(false);
  const [claimedXP, setClaimedXP] = useState(false);

  const baseDataInputId = useId();
  const deltaInputId = useId();
  const rtoInputId = useId();
  const rpoInputId = useId();
  const hourlyLossInputId = useId();

  // Engine Calculations
  const compressionFactor = useCompression ? 0.65 : 1.0;
  const storageComparison = calculateBackupStorage(baseDataGb, dailyDeltaPercent / 100, compressionFactor);
  const gfsRotation = calculateGfsRotation(baseDataGb);
  const rtoRpoLoss = calculateRtoRpoLoss(rtoHours, rpoHours, hourlyLossEur, hourlyLossEur * 0.5);
  const auditResult = audit321Rule(auditAnswers);

  const handleDrillSubmit = () => {
    setDrillSubmitted(true);
    let correct = 0;
    IHK_DRILL_QUESTIONS.forEach((q) => {
      if (drillAnswers[q.id] === q.correctIndex) correct++;
    });

    if (correct === IHK_DRILL_QUESTIONS.length && !claimedXP) {
      onRewardXP(55, 'backup_disaster_recovery_master');
      setClaimedXP(true);
    }
  };

  return (
    <div className="backup-lab-container" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(67, 56, 202, 0.15) 0%, rgba(180, 83, 9, 0.15) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <HardDrive size={28} style={{ color: 'var(--accent-primary)' }} />
              <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
                Backup-Strategien & Disaster Recovery Studio
              </h1>
            </div>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
              IHK Prüfungsmodul (AP1 & AP2 FISI/IT-SE): Voll vs. Diff vs. Inkr., Großvater-Vater-Sohn, RTO/RPO & 3-2-1-1-0 Ransomware-Schutz
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          {[
            { id: 'methods', label: 'Sicherungsmethoden im Vergleich', icon: Layers },
            { id: 'gfs', label: 'Großvater-Vater-Sohn (GFS)', icon: Calendar },
            { id: 'rtorpo', label: 'RTO / RPO Ausfallkostenrechner', icon: Clock },
            { id: 'audit', label: `3-2-1-1-0 Audit (${auditResult.scorePercent}%)`, icon: ShieldCheck },
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
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-dim)',
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

      {/* Methods Comparison Tab */}
      {activeTab === 'methods' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div>
              <label htmlFor={baseDataInputId} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Basis-Datenbestand: <strong>{baseDataGb} GB</strong> ({(baseDataGb / 1000).toFixed(1)} TB)
              </label>
              <input
                id={baseDataInputId}
                type="range"
                min="100"
                max="10000"
                step="100"
                value={baseDataGb}
                onChange={(e) => setBaseDataGb(Number(e.target.value))}
                style={{ width: '100%' }}
                aria-label="Basis-Datenbestand in GB anpassen"
              />
            </div>

            <div>
              <label htmlFor={deltaInputId} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Tägliche Änderungsrate: <strong>{dailyDeltaPercent} %</strong> ({(baseDataGb * (dailyDeltaPercent / 100)).toFixed(0)} GB/Tag)
              </label>
              <input
                id={deltaInputId}
                type="range"
                min="1"
                max="25"
                step="1"
                value={dailyDeltaPercent}
                onChange={(e) => setDailyDeltaPercent(Number(e.target.value))}
                style={{ width: '100%' }}
                aria-label="Tägliche Änderungsrate in Prozent anpassen"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="compression-checkbox"
                type="checkbox"
                checked={useCompression}
                onChange={(e) => setUseCompression(e.target.checked)}
                style={{ width: '1.1rem', height: '1.1rem' }}
              />
              <label htmlFor="compression-checkbox" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                Hardware-Kompression aktivieren (~35% Ersparnis)
              </label>
            </div>
          </div>

          {/* Cards for Full vs Diff vs Incremental */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Full Backup */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Vollsicherung (Täglich)</h2>
                <span
                  style={{
                    background: 'rgba(190, 18, 60, 0.15)',
                    color: 'var(--accent-rose)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  Höchster Speicherbedarf
                </span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.75rem 0 0.25rem', color: 'var(--accent-rose)' }}>
                {storageComparison.full.totalStorageGb} GB
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0 0 1rem' }}>Speicherbedarf für 7 Tage</p>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <strong>Wiederherstellungsaufwand:</strong> {storageComparison.full.restoreStepsCount} Schritt (Einfach)
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                  {storageComparison.full.restoreDescription}
                </div>
              </div>
            </div>

            {/* Differential Backup */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '2px solid var(--accent-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Differentielle Sicherung</h2>
                <span
                  style={{
                    background: 'rgba(67, 56, 202, 0.15)',
                    color: 'var(--accent-primary)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  IHK-Prüfungsfavorit
                </span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.75rem 0 0.25rem', color: 'var(--accent-primary)' }}>
                {storageComparison.differential.totalStorageGb} GB
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0 0 1rem' }}>
                Ersparnis: {(100 - (storageComparison.differential.totalStorageGb / storageComparison.full.totalStorageGb) * 100).toFixed(0)}% vs. Voll
              </p>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <strong>Wiederherstellungsaufwand:</strong> Genau 2 Schritte (Voll + letztes Diff)
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                  {storageComparison.differential.restoreDescription}
                </div>
              </div>
            </div>

            {/* Incremental Backup */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Inkrementelle Sicherung</h2>
                <span
                  style={{
                    background: 'rgba(4, 120, 87, 0.15)',
                    color: 'var(--accent-emerald)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  Geringster Speicher
                </span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.75rem 0 0.25rem', color: 'var(--accent-emerald)' }}>
                {storageComparison.incremental.totalStorageGb} GB
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0 0 1rem' }}>
                Ersparnis: {(100 - (storageComparison.incremental.totalStorageGb / storageComparison.full.totalStorageGb) * 100).toFixed(0)}% vs. Voll
              </p>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <strong>Wiederherstellungsaufwand:</strong> 7 Schritte (Ketten-Risiko)
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                  {storageComparison.incremental.restoreDescription}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GFS Rotation Tab */}
      {activeTab === 'gfs' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} style={{ color: 'var(--accent-amber)' }} />
            Großvater-Vater-Sohn-Prinzip (Generationen-Rotationsschema)
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Das vom BSI empfohlene Standard-Rotationsverfahren schützt vor schleichendem Datenverlust bei minimalem Medienaufwand (genau 20 Medien für 1 volles Jahr Historie).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-teal)' }}>SOHN (TAGESSICHERUNG)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0' }}>4 Medien</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Montag, Dienstag, Mittwoch, Donnerstag (überschreibt sich jede Woche neu).
              </p>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>VATER (WOCHENSICHERUNG)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0' }}>4 Medien</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Freitag Woche 1, 2, 3, 4 (Vollsicherungen, überschreiben sich jeden Monat).
              </p>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)' }}>GROSSVATER (MONATSSICHERUNG)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0' }}>12 Medien</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Januar bis Dezember (Vollsicherungen am Monatsletzten, revisionssicher für 1 Jahr aufbewahrt).
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(67, 56, 202, 0.08)',
              border: '1px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Gesamter Medienpool: {gfsRotation.totalMediaCount} Speichermedien (z. B. LTO-8 Tapes)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                Geschätzte Medien-Investitionskosten: ca. <strong>{gfsRotation.annualMediaCostEur.toLocaleString('de-DE')} €</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RTO / RPO Loss Calculator */}
      {activeTab === 'rtorpo' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={22} style={{ color: 'var(--accent-primary)' }} />
            RTO & RPO Business Impact & Ausfallkosten-Rechner
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Quantifiziere die betriebswirtschaftlichen Schäden eines Rechenzentrumsausfalls nach BSI 200-4 Business Continuity Management (BCM).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label htmlFor={rtoInputId} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                RTO (Recovery Time): <strong>{rtoHours} Stunden</strong>
              </label>
              <input
                id={rtoInputId}
                type="range"
                min="0.5"
                max="24"
                step="0.5"
                value={rtoHours}
                onChange={(e) => setRtoHours(Number(e.target.value))}
                style={{ width: '100%' }}
                aria-label="RTO in Stunden anpassen"
              />
            </div>

            <div>
              <label htmlFor={rpoInputId} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                RPO (Datenverlust): <strong>{rpoHours} Stunden</strong>
              </label>
              <input
                id={rpoInputId}
                type="range"
                min="0.5"
                max="24"
                step="0.5"
                value={rpoHours}
                onChange={(e) => setRpoHours(Number(e.target.value))}
                style={{ width: '100%' }}
                aria-label="RPO in Stunden anpassen"
              />
            </div>

            <div>
              <label htmlFor={hourlyLossInputId} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Umsatzverlust / Stunde: <strong>{hourlyLossEur.toLocaleString('de-DE')} €</strong>
              </label>
              <input
                id={hourlyLossInputId}
                type="range"
                min="1000"
                max="25000"
                step="1000"
                value={hourlyLossEur}
                onChange={(e) => setHourlyLossEur(Number(e.target.value))}
                style={{ width: '100%' }}
                aria-label="Umsatzverlust pro Stunde anpassen"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Stillstandskosten (Downtime)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-rose)', margin: '0.2rem 0' }}>
                {rtoRpoLoss.downtimeCostEur.toLocaleString('de-DE')} €
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{rtoHours}h Systemstillstand</div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Datenrekonstruktionskosten</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '0.2rem 0' }}>
                {rtoRpoLoss.dataLossCostEur.toLocaleString('de-DE')} €
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{rpoHours}h verlorene Transaktionen</div>
            </div>

            <div style={{ background: 'rgba(190, 18, 60, 0.08)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-rose)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', fontWeight: 700 }}>GESAMTSCHADEN DES INCIDENTS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-rose)', margin: '0.2rem 0' }}>
                {rtoRpoLoss.totalIncidentCostEur.toLocaleString('de-DE')} €
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Einstufung: <strong>{rtoRpoLoss.rtoRating}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-2-1-1-0 Audit Tab */}
      {activeTab === 'audit' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={22} style={{ color: 'var(--accent-emerald)' }} />
              3-2-1-1-0 Ransomware-Resilienz Audit
            </h2>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: auditResult.isCompliant ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                background: auditResult.isCompliant ? 'rgba(4, 120, 87, 0.1)' : 'rgba(190, 18, 60, 0.1)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                border: `1px solid ${auditResult.isCompliant ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
              }}
            >
              Compliance-Score: {auditResult.scorePercent}%
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {auditResult.checklist.map((item, idx) => (
              <div
                key={item.rule}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${item.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                  background: item.passed ? 'rgba(4, 120, 87, 0.05)' : 'rgba(190, 18, 60, 0.05)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  {item.passed ? (
                    <CheckCircle2 size={20} style={{ color: 'var(--accent-emerald)', marginTop: '0.1rem', flexShrink: 0 }} />
                  ) : (
                    <XCircle size={20} style={{ color: 'var(--accent-rose)', marginTop: '0.1rem', flexShrink: 0 }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.rule}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{item.tip}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const keys = ['copiesCount', 'differentMedia', 'offsiteLocation', 'airGappedImmutable', 'automatedVerificationTests'];
                    const targetKey = keys[idx];
                    if (targetKey === 'copiesCount') {
                      setAuditAnswers((prev) => ({ ...prev, copiesCount: prev.copiesCount >= 3 ? 1 : 3 }));
                    } else {
                      setAuditAnswers((prev) => ({ ...prev, [targetKey]: !prev[targetKey] }));
                    }
                  }}
                  aria-label={`Umschalten: ${item.rule}`}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {item.passed ? 'Erfüllt' : 'Nicht erfüllt'}
                </button>
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
                IHK-Prüfungsdrill: Backup & Disaster Recovery
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Beantworte alle 3 Prüfungsfragen korrekt, um +55 XP zu verdienen.
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
                      borderCol = 'var(--accent-primary)';
                      bgCol = 'rgba(67, 56, 202, 0.08)';
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
                    <ShieldCheck size={14} style={{ display: 'inline', marginRight: '0.3rem', color: 'var(--accent-primary)' }} />
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
                  background: 'var(--accent-primary)',
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
