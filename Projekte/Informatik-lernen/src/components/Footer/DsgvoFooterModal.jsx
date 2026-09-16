import React, { useState } from 'react';
import { Shield, FileText, ExternalLink, X, Heart, Code2, HelpCircle, GitBranch } from 'lucide-react';

export default function DsgvoFooterModal() {
  const [activeModal, setActiveModal] = useState(null); // 'datenschutz' | 'impressum' | 'dsgvo' | 'faq' | null

  return (
    <footer
      style={{
        marginTop: '80px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-muted)',
        fontSize: '0.88rem',
        padding: '50px 20px 30px'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Main Footer Grid */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '36px',
            marginBottom: '40px'
          }}
        >
          {/* Column 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'var(--gradient-cyber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Code2 size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                IT-DEVGAME
              </span>
            </div>
            <p style={{ lineHeight: '1.6', fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Die interaktive Open-Source-Lernplattform für Informatik-Grundlagen, IHK-Abschlussprüfungen (AP1/AP2) und moderne Software-Entwicklung.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent-teal)', fontSize: '0.78rem', fontWeight: 700 }}>
              <Shield size={14} /> 100% DSGVO-konform • Client-Side Only
            </div>
          </div>

          {/* Column 2: Schnelleinstieg & Kurse */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Lernbereiche &amp; Kurse
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li>
                <a href="#dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  🌱 Anfängerkurs ohne Vorwissen
                </a>
              </li>
              <li>
                <a href="#campaign" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  🗺️ Story-Kampagne: Der IT-Aufstieg
                </a>
              </li>
              <li>
                <a href="#exam" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  🎓 IHK AP1 &amp; AP2 Prüfungssimulator
                </a>
              </li>
              <li>
                <a href="#languages" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  🐍 Programmiersprachen Academy
                </a>
              </li>
              <li>
                <a href="#ai_business" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  🤖 AI &amp; Deep Learning Masterclass
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Interaktive Simulatoren */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Interaktive Labs &amp; Tools
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li>
                <a href="#cpu_architecture_lab" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  🔬 Von-Neumann CPU &amp; RAM Simulator
                </a>
              </li>
              <li>
                <a href="#sql_optimizer_lab" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  ⚡ SQL EXPLAIN Query Optimizer
                </a>
              </li>
              <li>
                <a href="#git_graph_lab" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  🌿 Git Branching &amp; Rebase Graph
                </a>
              </li>
              <li>
                <a href="#docker" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  🐳 Docker &amp; Container Orchestrierung
                </a>
              </li>
              <li>
                <a href="#oral_exam" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  🎙️ IHK Mündliches Fachgespräch (Voice)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Externe Quellen & Community */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Wissen &amp; Open Source
            </h4>
            <p style={{ fontSize: '0.82rem', lineHeight: '1.6', marginBottom: '14px' }}>
              Lehrplanbasiert nach IHK-Rahmenlehrplan, didaktischen Beispielen von W3Schools &amp; Web-Standards (MDN, W3C).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <a
                href="https://github.com/Schengii/Informatik-lernen"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontWeight: 700 }}
              >
                <GitBranch size={16} /> GitHub Repository <ExternalLink size={13} />
              </a>
              <button
                onClick={() => setActiveModal('faq')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '0.84rem' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                ❓ Häufig gestellte Fragen (FAQ)
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Rechtliches */}
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.82rem'
          }}
        >
          <div>
            © {new Date().getFullYear()} <strong>IT-DevGame</strong> • Entwickelt mit <Heart size={13} style={{ color: 'var(--accent-rose)', display: 'inline', verticalAlign: 'middle' }} /> für IT-Begeisterte &amp; Prüflinge.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveModal('dsgvo')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}
            >
              DSGVO &amp; Datenschutz
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveModal('impressum')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}
            >
              Impressum &amp; Disclaimer
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveModal('faq')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}
            >
              FAQ
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialogs */}
      {activeModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '30px',
              position: 'relative',
              boxShadow: 'var(--shadow-card)',
              border: '2px solid var(--accent-primary)',
              borderRadius: 'var(--radius-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              aria-label="Schließen"
            >
              <X size={22} />
            </button>

            {activeModal === 'dsgvo' && (
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.4rem' }}>
                  <Shield style={{ color: 'var(--accent-teal)' }} /> DSGVO &amp; Datenschutzerklärung
                </h2>
                <div style={{ lineHeight: '1.7', fontSize: '0.9rem' }}>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>1. 100% Lokale Datenspeicherung:</strong> Diese Anwendung speichert und verarbeitet keinerlei personenbezogene Daten auf Remote-Servern. Alle Lernfortschritte, Karteikarten-Wiederholungsintervalle (SM-2 Algorithmus), Erfahrungspunkte (XP) und Badges verbleiben ausschließlich im <code>localStorage</code> deines Endgeräts.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>2. Verzicht auf Tracking &amp; Cookies:</strong> Wir setzen weder Google Analytics, Werbe-Pixel noch sonstige Drittanbieter-Tracker ein.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>3. Datensouveränität &amp; Backup:</strong> Über das Menü <em>Tools ➔ Backup &amp; Wiederherstellen</em> kannst du jederzeit deinen gesamten Spielstand als JSON-Datei exportieren oder löschen.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>4. Barrierefreiheit (WCAG 2.1 AAA):</strong> Wir unterstützen uneingeschränkt Inklusion mit zertifizierten Modi für Legasthenie/Dyslexie (*Atkinson Hyperlegible*), Deuteranopie/Rot-Grün-Schwäche sowie High-Contrast.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'impressum' && (
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.4rem' }}>
                  <FileText style={{ color: 'var(--accent-primary)' }} /> Impressum &amp; Rechtliche Hinweise
                </h2>
                <div style={{ lineHeight: '1.7', fontSize: '0.9rem' }}>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>Angaben gemäß § 5 TMG / Open-Source-Projekt:</strong>
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>Projekt:</strong> IT-DevGame | Interaktive Informatik-Lernplattform<br />
                    <strong>Betreiber:</strong> Schengii<br />
                    <strong>Repository:</strong> <a href="https://github.com/Schengii/Informatik-lernen" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>https://github.com/Schengii/Informatik-lernen</a>
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>Haftung für Inhalte &amp; Links:</strong> Die Inhalte dieser Webseite wurden mit größter Sorgfalt erstellt. Für externe Links zu Drittanbietern (z. B. GitHub, W3Schools, YouTube) übernehmen wir keine Gewähr.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'faq' && (
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.4rem' }}>
                  <HelpCircle style={{ color: 'var(--accent-amber)' }} /> Häufig gestellte Fragen (FAQ)
                </h2>
                <div style={{ lineHeight: '1.7', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <strong>Ist IT-DevGame für die IHK-Abschlussprüfung geeignet?</strong>
                    <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      Ja! Die Inhalte richten sich exakt nach dem Rahmenlehrplan für Fachinformatiker (FIAE/FISI) für die Prüfungen AP1 und AP2 inklusive mündlicher Fachgesprächs-Simulation.
                    </p>
                  </div>
                  <div>
                    <strong>Funktioniert die Plattform auch offline?</strong>
                    <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      Ja, als Progressive Web App (PWA) werden alle Ressourcen gecacht, sodass du auch ohne aktive Internetverbindung lernen kannst.
                    </p>
                  </div>
                  <div>
                    <strong>Wie funktioniert der SM-2 Karteikarten-Algorithmus?</strong>
                    <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      SuperMemo-2 berechnet basierend auf deiner Antwortqualität (Wiederholen, Schwer, Perfekt) den optimalen Zeitpunkt für die nächste Wiederholung, um das Wissen langfristig im Langzeitgedächtnis zu verankern.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setActiveModal(null)}>
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
