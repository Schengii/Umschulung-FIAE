import React, { useState, useMemo } from 'react';
import { ShieldCheck, Lock, FileText, Download, Award, Sparkles } from 'lucide-react';
import { DEFAULT_TOM_MEASURES, evaluateTomAudit, generateTomMarkdownDoc } from '../../utils/ihkTomCatalogEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function IhkTomCatalogLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [measures, setMeasures] = useState(DEFAULT_TOM_MEASURES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [solved, setSolved] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const audit = useMemo(() => evaluateTomAudit(measures), [measures]);

  const toggleMeasure = (id) => {
    setMeasures(prev => prev.map(m => m.id === id ? { ...m, isImplemented: !m.isImplemented } : m));
  };

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(55);
      } else {
        awardXP(55, 'ihk_dsgvo_tom_master');
      }
    }
  };

  const handleDownloadMarkdown = () => {
    const md = generateTomMarkdownDoc(measures);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'IHK_Anhang_TOM_Art32_DSGVO.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMeasures = measures.filter(m => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> DSGVO &amp; IT-Sicherheit
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} /> Art. 32 DSGVO TOM-Katalog
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🛡️ IHK Datenschutz &amp; TOM-Katalog Studio (Art. 32 DSGVO)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '780px' }}>
            Konfiguriere technische und organisatorische Maßnahmen für dein IHK-Abschlussprojekt (Vertraulichkeit, Integrität, Verfügbarkeit &amp; Evaluierung). Berechne den DSGVO-Compliance-Score und exportiere das fertige Dokument für deine Projektdokumentation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontWeight: 'bold' }}
          >
            <FileText size={16} /> IHK-Doku Vorschau
          </button>
          <button
            onClick={handleClaim}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
          >
            <Award size={16} /> TOM-Audit Zertifizieren (+55 XP)
          </button>
        </div>
      </div>

      {/* Audit KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Compliance-Score</span>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: audit.scorePercent >= 75 ? 'var(--accent-emerald, #10b981)' : 'var(--accent-amber, #f59e0b)', margin: '4px 0' }}>
            {audit.scorePercent}%
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{audit.gradeLabel}</span>
        </div>

        <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Umsetzungsgrad</span>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-primary)', margin: '4px 0' }}>
            {audit.implementedCount} / {audit.totalCount}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maßnahmen im Projekt implementiert</span>
        </div>

        <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Vertraulichkeit</span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', margin: '4px 0' }}>
            {audit.categoryStats.confidentiality.percent}%
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zutritt, Zugang, Zugriff, Krypto</span>
        </div>

        <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Verfügbarkeit</span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', margin: '4px 0' }}>
            {audit.categoryStats.availability.percent}%
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>USV, RAID, 3-2-1 Backup</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'Alle TOMs' },
          { id: 'confidentiality', label: '1. Vertraulichkeit' },
          { id: 'integrity', label: '2. Integrität' },
          { id: 'availability', label: '3. Verfügbarkeit' },
          { id: 'evaluation', label: '4. Evaluierung' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: selectedCategory === cat.id ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: selectedCategory === cat.id ? '#fff' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* TOM Measures List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredMeasures.map(measure => (
          <div
            key={measure.id}
            onClick={() => toggleMeasure(measure.id)}
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background: measure.isImplemented ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-secondary)',
              border: measure.isImplemented ? '1px solid #10b981' : '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              gap: '16px'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className={`badge ${measure.isImplemented ? 'badge-emerald' : 'badge-slate'}`} style={{ fontSize: '0.72rem' }}>
                  {measure.isImplemented ? '✓ Implementiert' : 'Offen / Nicht gewählt'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{measure.categoryLabel}</span>
              </div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'block' }}>
                {measure.title}
              </strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {measure.description}
              </p>
              <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                <strong>Praxis-Umsetzung:</strong> {measure.example}
              </div>
            </div>

            <div>
              <input
                type="checkbox"
                checked={measure.isImplemented}
                onChange={() => {}}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '28px',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid var(--accent-primary)',
              boxShadow: 'var(--shadow-card)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-main)' }}>
                  IHK-Projektdokumentation Anhang: TOMs
                </h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowExportModal(false)}
              >
                Schließen
              </button>
            </div>

            <textarea
              readOnly
              value={generateTomMarkdownDoc(measures)}
              rows={16}
              style={{
                width: '100%',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                background: '#090d16',
                color: '#38bdf8',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #1e293b',
                resize: 'none',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={handleDownloadMarkdown}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={16} /> Als Markdown (.md) herunterladen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
