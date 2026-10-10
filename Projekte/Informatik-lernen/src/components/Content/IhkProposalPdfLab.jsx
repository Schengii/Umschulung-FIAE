import React, { useState } from 'react';
import {
  FileText,
  Download,
  Sparkles,
  Building,
  Clock,
  ShieldCheck,
  CheckCircle,
  Copy
} from 'lucide-react';
import {
  IHK_PROJECT_OCCUPATIONS
} from '../../utils/ihkProjectProposalEngine';
import {
  generateProposalMarkdown,
  exportProposalPdf
} from '../../utils/ihkProposalExporterEngine';

export default function IhkProposalPdfLab({ onRewardXP }) {
  const [candidateName, setCandidateName] = useState('Alex Schmidt');
  const [companyName, setCompanyName] = useState('TechCloud Infrastructure GmbH');
  const [selectedOccupation, setSelectedOccupation] = useState('fiae');
  const [projectTitle, setProjectTitle] = useState('Konzeption und Realisierung einer hochverfügbaren Zero-Trust API-Gateway-Architektur');
  const [projectGoal, setProjectGoal] = useState('Modernisierung des internen API-Ökosystems durch Einführung von OAuth 2.1, DPoP-Tokenbindung und automatisierter CI/CD-Testing-Pipelines nach IHK-Standard.');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const occ = IHK_PROJECT_OCCUPATIONS[selectedOccupation] || IHK_PROJECT_OCCUPATIONS.fiae;

  const samplePhases = [
    { id: '1', name: '1. Analysephase & Nutzwertanalyse', hours: Math.round(occ.maxHours * 0.15), category: 'analyse' },
    { id: '2', name: '2. Entwurf & Architektur-Konzeption', hours: Math.round(occ.maxHours * 0.20), category: 'entwurf' },
    { id: '3', name: '3. Realisierung & Anbindung', hours: Math.round(occ.maxHours * 0.45), category: 'umsetzung' },
    { id: '4', name: '4. Qualitätssicherung & Testautomatisierung', hours: Math.round(occ.maxHours * 0.10), category: 'qs' },
    { id: '5', name: '5. Dokumentation & Kundeneinweisung', hours: Math.round(occ.maxHours * 0.10), category: 'doku' }
  ];

  const securityMeasures = [
    { name: 'Zugriffskontrolle', detail: 'mTLS & OAuth 2.1 Sender-Constrained DPoP Tokens' },
    { name: 'Verschlüsselung', detail: 'TLS 1.3 Transportverschlüsselung & AES-256 Data-at-Rest' },
    { name: 'Verfügbarkeit', detail: 'Multi-AZ Cloud Deployment & Automatisches Failover' }
  ];

  const proposalData = {
    candidateName,
    companyName,
    occupationName: occ.name,
    projectTitle,
    projectGoal,
    totalHours: occ.maxHours,
    phases: samplePhases,
    securityMeasures,
    economicFeasibility: 'Gegenüberstellung von Make-or-Buy: Kosteneinsparung von 34.000 € über 3 Jahre durch interne Automatisierung.'
  };

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      const doc = exportProposalPdf(proposalData);
      doc.save(`IHK_Projektantrag_${selectedOccupation.toUpperCase()}_${candidateName.replace(/\s+/g, '_')}.pdf`);
      if (!isCompleted && onRewardXP) {
        onRewardXP(60);
        setIsCompleted(true);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyMarkdown = () => {
    const md = generateProposalMarkdown(proposalData);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (!isCompleted && onRewardXP) {
      onRewardXP(60);
      setIsCompleted(true);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                IHK Projektantrag PDF- & Dokumentations-Generator
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-400">
                  AP2 Teil A
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Offizieller IHK-Antrag auf Zulassung zur Projektarbeit nach AO 2020 mit 1-Klick A4-PDF- und Markdown-Export.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              {copied ? 'Kopiert!' : 'Markdown'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold shadow-lg hover:from-amber-400 hover:to-amber-500 transition"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generiere...' : 'Druckfertiges PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-400" />
              Antrags-Stammdaten & Ausbildungsberuf
            </h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Ausbildungsberuf (AO 2020):</label>
              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
              >
                {Object.entries(IHK_PROJECT_OCCUPATIONS).map(([id, o]) => (
                  <option key={id} value={id}>
                    {o.name} ({o.maxHours}h)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Prüfling Name:</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Ausbildungsbetrieb:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Projektbezeichnung (Thema):</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Kurzbeschreibung & Problemstellung:</label>
              <textarea
                rows={3}
                value={projectGoal}
                onChange={(e) => setProjectGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live PDF Document Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Vorschau Zeitbudget & Phasenverteilung
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/30 text-amber-400">
                Gesamt: {occ.maxHours} Stunden
              </span>
            </div>

            {/* Table of phases */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Projektphase</th>
                    <th className="py-2.5 px-3">Kategorie</th>
                    <th className="py-2.5 px-3 text-right">Dauer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {samplePhases.map((phase) => (
                    <tr key={phase.id} className="hover:bg-slate-950/40">
                      <td className="py-2 px-3 font-medium text-slate-300">{phase.name}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {phase.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-400">{phase.hours} h</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-950/90 font-bold border-t border-slate-700">
                    <td className="py-2 px-3 text-white">Gesamtbudget</td>
                    <td className="py-2 px-3 text-slate-400">100% Soll</td>
                    <td className="py-2 px-3 text-right text-amber-300 font-mono">{occ.maxHours} h</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-5 p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                DSGVO Art. 32 TOMs (Im PDF integriert):
              </div>
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                {securityMeasures.map((sec, i) => (
                  <li key={i}>
                    <strong className="text-slate-300">{sec.name}:</strong> {sec.detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          IHK-Prüfungstipp: Genehmigungsfähigkeit von Projektanträgen
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ein IHK-Projektantrag wird vom Prüfungsausschuss abgelehnt, wenn keine eigenen fachlichen Entscheidungen (z. B. Nutzwertanalyse, Make-or-Buy) getroffen werden oder reine Installationsanleitungen beschrieben sind. Achte stets darauf, dass Analyse, Entwurf und Qualitätssicherung mindestens 40–50% des Zeitbudgets ausmachen!
        </p>
      </div>
    </div>
  );
}
