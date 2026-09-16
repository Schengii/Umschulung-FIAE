import React, { useState, useMemo } from 'react';

import { Award, Calculator, CheckCircle2, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  IHK_OCCUPATIONS, calculateIhkFinalScore, calculateMepPossibilities
} from '../../utils/ihkGradeCalculations';

export default function IhkGradeCalculatorLab() {
  const [selectedOccupation, setSelectedOccupation] = useState('fiae');

  // Scores State (0 - 100 points)
  const [scores, setScores] = useState({
    ap1: 75,
    ap2_b1: 72,
    ap2_b2: 80,
    ap2_wiso: 68,
    doku: 85,
    fachgespraech: 88
  });

  const occInfo = IHK_OCCUPATIONS[selectedOccupation] || IHK_OCCUPATIONS.fiae;

  // Calculation Result
  const examResult = useMemo(() => {
    return calculateIhkFinalScore(scores);
  }, [scores]);

  // MEP Possibilities
  const mepList = useMemo(() => {
    return calculateMepPossibilities(scores);
  }, [scores]);

  const handleScoreChange = (field, val) => {
    const clamped = Math.min(100, Math.max(0, parseInt(val) || 0));
    setScores(prev => ({ ...prev, [field]: clamped }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Award size={14} /> IHK Abschlussprüfung &amp; AO 2020</span>
              <span className="badge badge-teal"><Sparkles size={14} /> Offizieller Noten- &amp; MEP-Rechner</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              IHK Notenrechner &amp; Mündliche Ergänzungsprüfung (MEP)
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Berechne deine IHK-Gesamtnote nach der neuen Prüfungsordnung (AO 2020) mit AP1 (20%), AP2 (30%), Projektarbeit &amp; Fachgespräch (50%) sowie automatischem MEP-Rettungsplan.
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Ausbildungsberuf wählen:
            </label>
            <select
              value={selectedOccupation}
              onChange={(e) => setSelectedOccupation(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              {Object.entries(IHK_OCCUPATIONS).map(([key, occ]) => (
                <option key={key} value={key}>{occ.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result Status Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: `2px solid ${examResult.isPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
          background: examResult.isPassed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className={`badge ${examResult.isPassed ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.92rem', padding: '6px 14px', marginBottom: '8px' }}>
              {examResult.isPassed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {examResult.isPassed ? 'BESTANDEN' : 'NICHT BESTANDEN'}
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '6px 0', color: 'var(--text-main)' }}>
              Gesamtergebnis: <span style={{ color: examResult.isPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{examResult.totalPoints} Punkte</span>
              <span style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                Note {examResult.overallGrade.text}
              </span>
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              AP2 Gesamtergebnis: <strong>{examResult.ap2TotalPoints} Punkte</strong> | Betriebliche Projektarbeit: <strong>{examResult.projectTotal} Punkte</strong>
            </div>
          </div>

          {!examResult.isPassed && examResult.fails.length > 0 && (
            <div style={{ maxWidth: '480px', background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-rose)' }}>
              <div style={{ fontWeight: '700', color: 'var(--accent-rose)', fontSize: '0.9rem', marginBottom: '4px' }}>
                Ausschlusskriterien nicht erfüllt:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {examResult.fails.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Input Form & Weighting Table */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={18} color="var(--accent-teal)" /> Prüfungsbereiche &amp; Punkteingabe (0 - 100)
        </h2>

        <div className="space-y-4">
          {/* AP1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="badge badge-indigo" style={{ marginRight: '8px' }}>20% Gewichtung</span>
              <span style={{ fontWeight: '700' }}>Teil 1 der gestreckten Abschlussprüfung (AP1)</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Einrichten eines IT-gestützten Arbeitsplatzes</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: '800', color: 'var(--accent-teal)' }}>{examResult.breakdown.ap1.grade.text}</span>
              <input
                type="number"
                min="0"
                max="100"
                value={scores.ap1}
                onChange={(e) => handleScoreChange('ap1', e.target.value)}
                style={{ width: '70px', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '700', textAlign: 'center' }}
              />
            </div>
          </div>

          {/* AP2 B1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="badge badge-indigo" style={{ marginRight: '8px' }}>10% Gewichtung</span>
              <span style={{ fontWeight: '700' }}>AP2 Schriftlich: {occInfo.ap2_b1_name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: '800', color: 'var(--accent-teal)' }}>{examResult.breakdown.ap2_b1.grade.text}</span>
              <input
                type="number"
                min="0"
                max="100"
                value={scores.ap2_b1}
                onChange={(e) => handleScoreChange('ap2_b1', e.target.value)}
                style={{ width: '70px', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '700', textAlign: 'center' }}
              />
            </div>
          </div>

          {/* AP2 B2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="badge badge-indigo" style={{ marginRight: '8px' }}>10% Gewichtung</span>
              <span style={{ fontWeight: '700' }}>AP2 Schriftlich: {occInfo.ap2_b2_name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: '800', color: 'var(--accent-teal)' }}>{examResult.breakdown.ap2_b2.grade.text}</span>
              <input
                type="number"
                min="0"
                max="100"
                value={scores.ap2_b2}
                onChange={(e) => handleScoreChange('ap2_b2', e.target.value)}
                style={{ width: '70px', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '700', textAlign: 'center' }}
              />
            </div>
          </div>

          {/* AP2 WiSo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="badge badge-indigo" style={{ marginRight: '8px' }}>10% Gewichtung</span>
              <span style={{ fontWeight: '700' }}>AP2 Schriftlich: Wirtschafts- und Sozialkunde (WiSo)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: '800', color: 'var(--accent-teal)' }}>{examResult.breakdown.ap2_wiso.grade.text}</span>
              <input
                type="number"
                min="0"
                max="100"
                value={scores.ap2_wiso}
                onChange={(e) => handleScoreChange('ap2_wiso', e.target.value)}
                style={{ width: '70px', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '700', textAlign: 'center' }}
              />
            </div>
          </div>

          {/* Project & Oral (50%) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-primary)', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginRight: '8px' }}>50% Gewichtung</span>
              <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>Betriebliche Projektarbeit (Doku + Fachgespräch)</span>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Dokumentation (50%) &amp; Präsentation / Fachgespräch (50%)</div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Dokumentation</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.doku}
                  onChange={(e) => handleScoreChange('doku', e.target.value)}
                  style={{ width: '65px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '700', textAlign: 'center' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Präsentation / Fachgespräch</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.fachgespraech}
                  onChange={(e) => handleScoreChange('fachgespraech', e.target.value)}
                  style={{ width: '65px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '700', textAlign: 'center' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MEP (Mündliche Ergänzungsprüfung) Analysis */}
      {mepList.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--accent-amber)" /> Mündliche Ergänzungsprüfung (MEP) Optionen
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            In folgenden schriftlichen Prüfungsbereichen (Note 5 mangelhaft) kann eine 15-minütige mündliche Ergänzungsprüfung beantragt werden:
          </p>

          <div className="space-y-3">
            {mepList.map(mep => (
              <div key={mep.areaKey} style={{ background: 'var(--bg-secondary)', padding: '14px 18px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-amber)' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{mep.areaName}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Schriftliches Ergebnis: <strong>{mep.writtenPoints} Punkte</strong> | {mep.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
