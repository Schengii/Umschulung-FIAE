import React, { useState } from 'react';

import { FileText, Download, CheckCircle2, Database, Globe, Calculator } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useStore } from '../../store/useStore';

export default function IhkCheatSheetPdfGenerator() {
  const { awardXP } = useStore();
  const [selectedTopic, setSelectedTopic] = useState('ihk_wiso');
  const [isGenerating, setIsGenerating] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const cheatSheets = {
    ihk_wiso: {
      title: 'IHK WISO & Kalkulations-Spickzettel',
      category: 'Wirtschafts- & Sozialkunde (AP1 & AP2)',
      sections: [
        {
          heading: '1. Handelskalkulation (Vorwärts)',
          content: 'LEP - Lieferantenrabatt = ZEP\nZEP - Lieferskonto = BEP\nBEP + Bezugskosten = Bezugspreis (Einstandspreis)\nBezugspreis + Handlungskostenzuschlag = Selbstkosten\nSelbstkosten + Gewinnzuschlag = Barverkaufspreis (BVP)\nBVP / (1 - Skonto%) = Zielverkaufspreis (ZVP)\nZVP / (1 - Rabatt%) = Nettoverkaufspreis (NVP)\nNVP + 19% USt = Bruttoverkaufspreis (BKP)'
        },
        {
          heading: '2. Deckungsbeitrag & Gewinnschwelle (Break-Even)',
          content: 'Stückdeckungsbeitrag (db) = Verkaufspreis (p) - variable Stückkosten (kv)\nGesamtdeckungsbeitrag (DB) = db * Absatzmenge (x)\nBreak-Even-Point (BEP) = Fixkosten (Kf) / db\nBetriebsergebnis (Gewinn/Verlust) = DB - Kf'
        },
        {
          heading: '3. Kündigungsfristen (§ 622 BGB)',
          content: 'Grundkündigungsfrist: 4 Wochen zum 15. oder Monatsende.\nProbezeit (max. 6 Monate): 2 Wochen zu jedem Tag.\n2 Jahre Betrieb: 1 Monat zum Monatsende.\n5 Jahre: 2 Monate | 8 Jahre: 3 Monate | 10 Jahre: 4 Monate'
        }
      ]
    },
    sql_db: {
      title: 'SQL & Datenbankarchitektur Cheat Sheet',
      category: 'Softwareentwicklung & Datenbanken',
      sections: [
        {
          heading: '1. JOIN Typen',
          content: 'INNER JOIN: Schnittmenge beider Tabellen (nur passende Datensätze).\nLEFT JOIN: Alle Datensätze der linken Tabelle + passende rechte Tabelle.\nRIGHT JOIN: Alle Datensätze der rechten Tabelle + passende linke Tabelle.\nFULL OUTER JOIN: Alle Datensätze beider Tabellen.'
        },
        {
          heading: '2. ACID Prinzip & Transaktionen',
          content: 'A - Atomicity (Atomarität): Alles oder nichts (COMMIT / ROLLBACK).\nC - Consistency (Konsistenz): Zustand vor und nach Transaktion valide.\nI - Isolation: Parallele Transaktionen beeinflussen sich nicht.\nD - Durability (Dauerhaftigkeit): Persistente Speicherung auf Disk/WAL.'
        },
        {
          heading: '3. Normalformen',
          content: '1. NF: Jede Spalte ist atomar (keine Mehrfachwerte/Listen).\n2. NF: 1. NF + jedes Nicht-Schlüsselattribut voll funktional abhängig vom Primärschlüssel.\n3. NF: 2. NF + keine transitiven Abhängigkeiten unter Nicht-Schlüsselattributen.'
        }
      ]
    },
    networking: {
      title: 'Netzwerktechnik & Subnetting Spickzettel',
      category: 'Systemintegration & Netzwerkgrundlagen',
      sections: [
        {
          heading: '1. CIDR & IPv4 Subnetzmasken',
          content: '/24 = 255.255.255.0 (256 IPs, 254 Hosts)\n/25 = 255.255.255.128 (128 IPs, 126 Hosts)\n/26 = 255.255.255.192 (64 IPs, 62 Hosts)\n/27 = 255.255.255.224 (32 IPs, 30 Hosts)\n/28 = 255.255.255.240 (16 IPs, 14 Hosts)\n/30 = 255.255.255.252 (4 IPs, 2 Point-to-Point Hosts)'
        },
        {
          heading: '2. OSI 7-Schichten Modell',
          content: '7. Anwendung (Application): HTTP, DNS, SSH, SMTP\n6. Darstellung (Presentation): TLS/SSL, JSON, UTF-8\n5. Sitzung (Session): RPC, NetBIOS\n4. Transport: TCP (verlässlich), UDP (verbindungslos)\n3. Vermittlung (Network): IP, ICMP, Routing (Router)\n2. Sicherung (Data Link): Ethernet, MAC, Framing (Switch)\n1. Bitübertragung (Physical): Kabel, WLAN, Repeater'
        }
      ]
    }
  };

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const current = cheatSheets[selectedTopic];

      // Header Banner
      doc.setFillColor(30, 41, 59); // Slate 800
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(current.title, 14, 15);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text(`IT-DevGame IHK Prüfungsvorbereitung • ${current.category}`, 14, 24);

      let yPos = 44;

      current.sections.forEach((sec) => {
        // Section Title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.text(sec.heading, 14, yPos);
        yPos += 7;

        // Content Box
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        
        const lines = doc.splitTextToSize(sec.content, 180);
        const boxHeight = lines.length * 6 + 6;

        doc.roundedRect(14, yPos - 3, 182, boxHeight, 2, 2, 'FD');

        doc.setFontSize(9);
        doc.setFont('courier', 'normal');
        doc.setTextColor(51, 65, 85); // Slate 700
        doc.text(lines, 18, yPos + 3);

        yPos += boxHeight + 10;
      });

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text('Generiert mit IT-DevGame | 100% DSGVO & Open Educational Resource (OER)', 14, 285);

      doc.save(`IHK-CheatSheet-${selectedTopic}-${new Date().toISOString().slice(0, 10)}.pdf`);
      if (!xpClaimed) {
        setXpClaimed(true);
        awardXP(25, 'exam_passed');
      }
    } catch (e) {
      console.error('PDF generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSheet = cheatSheets[selectedTopic];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                PDF Export & Print-Ready Cheat Sheets
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +25 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-400" />
              IHK Spickzettel & Formelsammlungs-Generator
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Erstelle und lade dir druckfertige DIN A4 PDF-Zusammenfassungen für deine IHK-Abschlussprüfung (AP1/AP2) und Klausuren herunter.
            </p>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-lg shrink-0"
          >
            <Download className="w-5 h-5" />
            {isGenerating ? 'Wird erstellt...' : 'PDF Herunterladen (A4)'}
          </button>
        </div>
      </div>

      {/* Theme Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setSelectedTopic('ihk_wiso')}
          className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
            selectedTopic === 'ihk_wiso'
              ? 'bg-blue-950/70 border-blue-500 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">WISO & Kalkulation</h3>
            <p className="text-xs text-slate-400 mt-1">Handelskalkulation, Break-Even, Kündigung</p>
          </div>
        </button>

        <button
          onClick={() => setSelectedTopic('sql_db')}
          className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
            selectedTopic === 'sql_db'
              ? 'bg-blue-950/70 border-blue-500 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Database className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">SQL & Datenbanken</h3>
            <p className="text-xs text-slate-400 mt-1">JOINs, ACID, Normalformen</p>
          </div>
        </button>

        <button
          onClick={() => setSelectedTopic('networking')}
          className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
            selectedTopic === 'networking'
              ? 'bg-blue-950/70 border-blue-500 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Globe className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Netzwerk & Subnetting</h3>
            <p className="text-xs text-slate-400 mt-1">CIDR-Tabelle, OSI 7-Schichten</p>
          </div>
        </button>
      </div>

      {/* Live Preview des ausgewählten Cheat Sheets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider block">Live-Vorschau</span>
            <h2 className="text-xl font-bold text-white mt-1">{currentSheet.title}</h2>
          </div>
          <span className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
            DIN A4 Format
          </span>
        </div>

        <div className="space-y-6">
          {currentSheet.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {sec.heading}
              </h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs md:text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {sec.content}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
