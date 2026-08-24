import React, { useState } from 'react';
import { BookOpen, Cpu, Globe, Binary, Code, CheckCircle2, Sparkles } from 'lucide-react';

export const ANFAENGER_GUIDES = [
  {
    id: 'eva_prinzip',
    title: '1. Das EVA-Prinzip: Wie funktioniert ein Computer?',
    icon: '💻',
    category: 'Grundlagen',
    content: `Jeder Computer auf der Welt – egal ob Smartphone, Laptop oder Supercomputer – arbeitet nach demselben Grundprinzip: dem **EVA-Prinzip**:

1. **E**ingabe: Informationen werden in den PC eingegeben (z.B. Tastatur, Maus, Touchscreen, Mikrofon).
2. **V**erarbeitung: Die **CPU (Prozessor)** verarbeitet die Daten im Arbeitsspeicher (RAM) anhand von Befehlen.
3. **A**usgabe: Das Ergebnis wird ausgegeben (z.B. Bildschirm, Lautsprecher, Drucker).`,
    example: 'Beispiel: Du tippst den Buchstaben "A" auf der Tastatur (Eingabe), die CPU wandelt die Taste in den Binärcode 01000001 um (Verarbeitung) und zeigt den Buchstaben "A" auf deinem Monitor an (Ausgabe).'
  },
  {
    id: 'cpu_brain',
    title: '2. Das Gehirn des PCs: Wie denkt die CPU?',
    icon: '🧠',
    category: 'Hardware',
    content: `Die **CPU (Central Processing Unit)** ist das Rechenzentrum des Computers. Sie führt Milliarden von Befehlen pro Sekunde aus!

Sie besteht im Wesentlichen aus:
- **ALU (Arithmetic Logic Unit)**: Das Rechenwerk für mathematische Plus/Minus-Rechnungen und Vergleiche.
- **Steuerwerk (Control Unit)**: Holt Befehle aus dem Arbeitsspeicher und verteilt Aufgaben.
- **Register**: Ultra-schnelle Mikrospeicher direkt in der CPU.
- **Taktfrequenz (GHz)**: Gibt an, wie viele Milliarden Arbeitsschritte pro Sekunde ausgeführt werden (z.B. 3,5 GHz = 3,5 Milliarden Schritte/Sekunde).`,
    example: 'Stell dir die CPU wie den Chefkoch in einer Küche vor: Das Steuerwerk ist der Koch, die Register sind das Schneidebrett und der RAM ist der Kühlschrank!'
  },
  {
    id: 'binary_system',
    title: '3. Die Sprache der Computer: Bits, Bytes & Binärsystem',
    icon: '🔢',
    category: 'Daten & Logik',
    content: `Computer kennen im Grunde nur zwei Zustände: **Strom an (1)** oder **Strom aus (0)**.

- **Bit**: Die kleinste Informationseinheit (entweder 0 oder 1).
- **Byte**: 8 Bits zusammen ergeben 1 Byte (z.B. 01000001). Ein Byte kann 256 verschiedene Werte darstellen (2^8 = 256).
- **Kilobyte (KB)**: ca. 1.000 Bytes (ein kurzer Text).
- **Megabyte (MB)**: ca. 1.000 KB (ein Foto oder MP3-Song).
- **Gigabyte (GB)**: ca. 1.000 MB (ein Spielfilm).
- **Terabyte (TB)**: ca. 1.000 GB (eine große Festplatte).`,
    example: 'Der Buchstabe "A" ist im Computer die Zahl 65, und als Binärcode geschrieben 01000001!'
  },
  {
    id: 'internet_dns',
    title: '4. Wie funktioniert das Internet & DNS?',
    icon: '🌐',
    category: 'Netzwerke',
    content: `Das Internet ist ein riesiges weltweites Netzwerk von zusammenhängenden Computern.

- **IP-Adresse**: Jeder Computer im Internet hat eine eindeutige Hausnummer (z.B. 142.250.185.206).
- **DNS (Domain Name System)**: Weil sich Menschen Zahlen schwer merken können, übersetzt das DNS Namen wie "google.de" in die richtige IP-Adresse.
- **Router**: Das digitale Postamt, das Datenpakete durch das Netzwerk an ihr Ziel leitet.`,
    example: 'DNS ist das Telefonbuch des Internets: Du suchst nach "Peter", und das Telefonbuch gibt dir seine Telefonnummer!'
  }
];

export default function AnfaengerGuideHub() {
  const [selectedId, setSelectedId] = useState(ANFAENGER_GUIDES[0].id);

  const activeGuide = ANFAENGER_GUIDES.find(g => g.id === selectedId) || ANFAENGER_GUIDES[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-emerald)' }}>
        <span className="badge badge-emerald" style={{ marginBottom: '10px' }}>
          🌱 Für absolute Einsteiger & jedes Alter
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={32} style={{ color: 'var(--accent-emerald)' }} /> Informatik-Grundlagen anschaulich erklärt
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Keine Vorkenntnisse erforderlich! Lerne Schritt für Schritt, wie Computer, Netzwerke & Code funktionieren.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {ANFAENGER_GUIDES.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedId(g.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedId === g.id ? 'var(--accent-emerald)' : 'var(--bg-card)',
              color: selectedId === g.id ? '#ffffff' : 'var(--text-main)',
              border: selectedId === g.id ? '2px solid var(--accent-emerald)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {g.icon} {g.title}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <span className="badge badge-indigo" style={{ marginBottom: '12px' }}>{activeGuide.category}</span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
          {activeGuide.icon} {activeGuide.title}
        </h2>

        <div style={{ whiteSpace: 'pre-line', fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-main)', marginBottom: '24px' }}>
          {activeGuide.content}
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-teal)' }}>
          <strong style={{ color: 'var(--accent-teal)', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>💡 Anschauliches Praxis-Beispiel:</strong>
          <p style={{ margin: 0, fontSize: '0.98rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
            {activeGuide.example}
          </p>
        </div>
      </div>
    </div>
  );
}
