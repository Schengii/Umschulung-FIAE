import React, { useState } from 'react';
import { Award, Download, FileCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useStore } from '../../store/useStore';

export default function IhkCertificatePdfLab() {
  const { userState, awardXP } = useStore();
  const [candidateName, setCandidateName] = useState(userState?.name || 'Max Mustermann');
  const [companyName, setCompanyName] = useState('IT-Systemhaus & Cloud Solutions GmbH');
  const [discipline, setDiscipline] = useState('Fachinformatiker Anwendungsentwicklung (FIAE)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const completedLabsCount = userState?.completedLabs?.length || 42;
  const currentXP = userState?.xp || 2850;
  const currentLevel = userState?.level || 8;

  const handleGeneratePdf = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Background Border
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(1.5);
      doc.rect(10, 10, 190, 277);

      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.5);
      doc.rect(12, 12, 186, 273);

      // Header Badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text('IHK LERNPASS & ZERTIFIKAT', 105, 35, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Nachweis über absolvierte IT-Kompetenzmodule & Prüfungsvorbereitung', 105, 43, { align: 'center' });

      // Line
      doc.setDrawColor(226, 232, 240);
      doc.line(30, 50, 180, 50);

      // Candidate Section
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('Hiermit wird bescheinigt, dass', 105, 65, { align: 'center' });

      doc.setFontSize(20);
      doc.setTextColor(2, 132, 199);
      doc.text(candidateName, 105, 78, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'italic');
      doc.text(`Ausbildungsberuf: ${discipline}`, 105, 86, { align: 'center' });
      doc.text(`Ausbildungsbetrieb: ${companyName}`, 105, 93, { align: 'center' });

      // Box: Stats
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(30, 105, 150, 35, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(30, 105, 150, 35, 3, 3, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('ABSOLVIERTE LEISTUNGEN & LERNFORTSCHRITT', 105, 114, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Erreichte Gesamt-XP: ${currentXP} XP`, 40, 124);
      doc.text(`Entwickler-Level: Level ${currentLevel}`, 40, 131);
      doc.text(`Abgeschlossene Labore: ${completedLabsCount} Module`, 115, 124);
      doc.text(`Status: Prüfungsbereit (AP1 / AP2)`, 115, 131);

      // Section Modules Overview
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('Geprüfte IHK-Kernkompetenzen (Auszug):', 30, 155);

      const competencies = [
        '1. BSI IT-Grundschutz (200-2/200-3), NIS-2 & DSGVO TOM-Katalog',
        '2. IPv6 Routing, NDP, SLAAC (RFC 4862) & Stateful/Stateless DHCPv6',
        '3. FMEA Risikoanalyse & Risikomatrix (DIN EN 31010) für Projektdokumentation',
        '4. Agiles Projektmanagement, Sprint-Burndown-Controlling & CPM-Netzplan',
        '5. WISO: Brutto-Netto-Gehaltsabrechnung, Kündigungsschutz & Handelskalkulation',
        '6. Relationale DB-Optimierung, PostgreSQL Index-Typen (B-Tree/GIN/BRIN) & ACID'
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      let yPos = 165;
      competencies.forEach(comp => {
        doc.text(`[X] ${comp}`, 35, yPos);
        yPos += 9;
      });

      // Signatures
      const dateStr = new Date().toLocaleDateString('de-DE');
      doc.line(30, 245, 85, 245);
      doc.text(`Datum: ${dateStr}`, 30, 252);
      doc.text('Unterschrift Ausbilder / Betrieb', 30, 257);

      doc.line(125, 245, 180, 245);
      doc.text('IT-DevGame Academy', 125, 252);
      doc.text('Verifizierter Ausbildungsnachweis', 125, 257);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Dieses Dokument dient als formeller Nachweis für das IHK-Berichtsheft (Ausbildungsnachweis).', 105, 275, { align: 'center' });

      doc.save(`IHK_Lernpass_${candidateName.replace(/\s+/g, '_')}.pdf`);

      if (!xpClaimed && awardXP) {
        awardXP(50, 'IHK Lernpass-Zertifikat exportiert!');
        setXpClaimed(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color, #1e293b)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Award size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                IHK Lernpass & Zertifikats-Generator
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
                Druckfertiges PDF-Zertifikat für den Ausbildungsnachweis / das Berichtsheft (AP1 & AP2)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px' }}>
          Zertifikatsdaten anpassen
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '6px' }}>
              Vor- und Nachname des Auszubildenden:
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'inherit',
                fontSize: '0.95rem',
                fontWeight: 600
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '6px' }}>
              Ausbildungsbetrieb:
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'inherit',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '6px' }}>
              IHK-Ausbildungsberuf:
            </label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'inherit',
                fontSize: '0.95rem'
              }}
            >
              <option value="Fachinformatiker Anwendungsentwicklung (FIAE)">Fachinformatiker Anwendungsentwicklung (FIAE)</option>
              <option value="Fachinformatiker Systemintegration (FISI)">Fachinformatiker Systemintegration (FISI)</option>
              <option value="Fachinformatiker Daten- und Prozessanalyse (FIDP)">Fachinformatiker Daten- und Prozessanalyse (FIDP)</option>
              <option value="IT-Systemelektroniker (IT-SE)">IT-Systemelektroniker (IT-SE)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGeneratePdf}
          disabled={isGenerating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: isGenerating ? 'wait' : 'pointer'
          }}
        >
          <Download size={20} />
          {isGenerating ? 'Erstelle Zertifikat...' : 'Offiziellen IHK Lernpass als PDF herunterladen'}
        </button>
      </div>

      {/* Live Preview Box */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '24px', borderRadius: '16px', border: '2px dashed var(--border-color, #cbd5e1)', textAlign: 'center' }}>
        <FileCheck size={48} color="#0284c7" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px' }}>
          Vorschau: IHK-Lernpass für {candidateName}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', maxWidth: '600px', margin: '0 auto' }}>
          Das PDF beinhaltet alle geprüften Schwerpunkte (BSI IT-Grundschutz, IPv6 SLAAC, WISO Lohnabrechnung, SQL & Agiles Projektmanagement) inklusive digitaler Unterschriftsfelder.
        </p>
      </div>
    </div>
  );
}
