import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function DashboardQuickAccessGrid({ setActiveTab }) {
  const quickCards = [
    {
      id: 'nwa_scoring',
      icon: '📊',
      title: 'IHK Nutzwertanalyse Studio (NWA)',
      desc: 'Offizielle Entscheidungsmatrix mit Gewichtung & K.O.-Kriterien für die Projektdokumentation.',
      actionText: 'NWA Berechnen',
      color: 'var(--accent-primary)',
      badge: 'IHK Neu'
    },
    {
      id: 'raid_calculator',
      icon: '💾',
      title: 'RAID Storage & Paritäts-Rechner',
      desc: 'RAID 0, 1, 5, 6, 10 & 50 Kapazitäten, Rebuild-Dauer, URE-Risiko & Block-Matrix.',
      actionText: 'RAID Konfigurieren',
      color: 'var(--accent-teal)',
      badge: 'FISI Neu'
    },
    {
      id: 'vlsm_subnet',
      icon: '🌐',
      title: 'VLSM Subnet Splitter & IP-Planer',
      desc: 'Hierarchische IPv4-Subnetzaufteilung nach Host-Bedarf ohne Adressraum-Verschwendung.',
      actionText: 'VLSM Berechnen',
      color: 'var(--accent-amber)',
      badge: 'IHK Neu'
    },
    {
      id: 'ihk_project_proposal',
      icon: '📋',
      title: 'IHK Projektantrags-Prüfer',
      desc: 'AO 2020 Stundenprüfung (FIAE 80h / FISI 40h), Phasenverteilung & Genehmigungs-Checkliste.',
      actionText: 'Antrag Prüfen',
      color: 'var(--accent-emerald)',
      badge: 'IHK Neu'
    },
    {
      id: 'cpm_network',
      icon: '🔀',
      title: 'IHK Netzplan Studio (CPM / DIN 69900)',
      desc: 'Vorwärts- & Rückwärtsrechnung, FAZ/FEZ/SAZ/SEZ, Pufferzeiten GP/FP & Kritischer Pfad.',
      actionText: 'Netzplan Starten',
      color: 'var(--accent-purple)',
      badge: 'IHK Neu'
    },
    {
      id: 'uml_diagram',
      icon: '📐',
      title: 'UML Studio (Sequenz & Aktivität)',
      desc: 'Synchrone/asynchrone Aufrufe modellieren, IHK-Linter prüfen und Mermaid.js exportieren.',
      actionText: 'Diagramm Öffnen',
      color: 'var(--accent-rose)',
      badge: 'Neu'
    },
    {
      id: 'terraform',
      icon: '☁️',
      title: 'Terraform & OpenTofu IaC Studio',
      desc: 'Deklaratives State-Management, Execution Plans (Diff) & Directed Acyclic Graph (DAG).',
      actionText: 'IaC Simulieren',
      color: 'var(--accent-indigo)',
      badge: 'Neu'
    },
    {
      id: 'oral_defense_studio',
      icon: '🎙️',
      title: 'IHK Fachgespräch & Audio-Simulator',
      desc: '15-minütiges mündliches Fachgespräch mit Sprachausgabe, Persona-Prüfern & Bewertungsmatrix.',
      actionText: 'Fachgespräch Starten',
      color: 'var(--accent-rose)',
      badge: 'IHK Neu'
    },
    {
      id: 'ansible_playbook',
      icon: '🤖',
      title: 'Ansible Playbook & Idempotenz',
      desc: 'Automatisierte Server-Provisionierung, Host-Inventories & Idempotenz-Beweis.',
      actionText: 'Playbook Ausführen',
      color: 'var(--accent-teal)',
      badge: 'FISI Neu'
    },
    {
      id: 'computation_worker',
      icon: '⚡',
      title: 'Web Worker & Concurrency Studio',
      desc: 'Main Thread vs. Background Worker CPU-Benchmarks ohne UI-Freezing (60fps).',
      actionText: 'Worker Benchmark',
      color: 'var(--accent-amber)',
      badge: 'Neu'
    },
    {
      id: 'os_scheduler',
      icon: '⏱️',
      title: 'OS Process Scheduler & Deadlock',
      desc: 'CPU-Scheduling (FCFS, SJF, Round Robin), animiertes Gantt-Diagramm & Bankier-Algorithmus.',
      actionText: 'Scheduling Testen',
      color: 'var(--accent-primary)',
      badge: 'Flagship'
    },
    {
      id: 'packet_sniffer',
      icon: '📡',
      title: 'Web-Wireshark Packet Sniffer',
      desc: 'Schichten 2–7 Paket-Dissektion, synchroner Hex-Dump und Wireshark-Style Display-Filter.',
      actionText: 'Pakete Analysieren',
      color: 'var(--accent-teal)',
      badge: 'Flagship'
    },
    {
      id: 'erd_designer',
      icon: '🗄️',
      title: 'Relational ERD & 3NF Normalform-Linter',
      desc: 'Interaktiver Datenbankmodell-Designer mit 1NF-3NF Audit & SQL DDL Export.',
      actionText: 'ERD Erstellen',
      color: 'var(--accent-purple)',
      badge: 'Flagship'
    },
    {
      id: 'transformer_attention',
      icon: '🧠',
      title: 'Transformer Attention & LLM Studio',
      desc: 'Self-Attention Heatmap, Temperature / Top-P Sampling und autonomer AI-Agent ReAct-Loop.',
      actionText: 'LLM Verstehen',
      color: 'var(--accent-rose)',
      badge: 'Flagship'
    },
    {
      id: 'cloud_canvas',
      icon: '☁️',
      title: 'Cloud Architecture SLA & SPOF Canvas',
      desc: 'Multi-Tier Topologie-Planung, Compound Availability (99.99%) & SPOF Linter.',
      actionText: 'Architektur Planen',
      color: 'var(--accent-cyan)',
      badge: 'Flagship'
    },
    {
      id: 'ihk_grade_calculator',
      icon: '🎓',
      title: 'IHK Noten- & MEP-Rechner (AO 2020)',
      desc: 'Offizielle Prüfungsordnung, Gewichtung AP1/AP2 und Mündliche Ergänzungsprüfung.',
      actionText: 'Noten Berechnen',
      color: 'var(--accent-amber)',
      badge: 'IHK'
    },
    {
      id: 'rack_configurator',
      icon: '🗄️',
      title: '19"-Server-Rack Konfigurator',
      desc: '42HE Serverschrank, USV-Akkulaufzeit, Wirkleistung & RZ-Klimatisierung (BTU/h).',
      actionText: 'Rack Bestücken',
      color: 'var(--accent-primary)',
      badge: 'Hardware'
    },
    {
      id: 'itsm_simulator',
      icon: '🎧',
      title: 'ITIL 4 ITSM & Service Desk Studio',
      desc: 'Incident Queue, SLA-Timer, Impact x Urgency Matrix & CAB Change Advisory Board.',
      actionText: 'Tickets Managen',
      color: 'var(--accent-teal)',
      badge: 'ITIL 4'
    },
    {
      id: 'sm2_spaced_repetition',
      icon: '💡',
      title: 'SuperMemo SM-2 Spaced Repetition',
      desc: 'Wissenschaftliches Karteikarten-Lernen mit dynamischen Ease-Faktoren & Ebbinghaus-Kurven.',
      actionText: 'Wissen Festigen',
      color: 'var(--accent-emerald)',
      badge: 'Didaktik'
    },
    {
      id: 'personal_notebook',
      icon: '📓',
      title: 'Developer Notizbuch & Vault',
      desc: 'In-App Markdown Notizen mit Tag-Suche, LocalStorage Auto-Save und .md-Export.',
      actionText: 'Notizbuch Öffnen',
      color: 'var(--accent-purple)',
      badge: 'Tools'
    },
    {
      id: 'wiso_kalkulation',
      icon: '📊',
      title: 'WISO- & Handelskalkulations-Studio',
      desc: 'Handelskalkulation, Break-Even-Point & Netzplantechnik (Kritischer Pfad).',
      actionText: 'Kalkulation Starten',
      color: 'var(--accent-amber)',
      badge: 'IHK WISO'
    },
    {
      id: 'p2p_duell',
      icon: '⚔️',
      title: 'IHK Quiz-Duell Arena (1v1)',
      desc: 'Echtzeit-Multiplayer Duell über IHK-Fragen gegen Azubis oder smarte Bots.',
      actionText: 'Duell Starten',
      color: 'var(--accent-rose)',
      badge: 'Multiplayer'
    }
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Empfohlene Lernbereiche &amp; Flagship Studios
        </h2>
        <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} /> Neu aktualisiert v3.18
        </span>
      </div>

      <div className="grid-responsive" style={{ marginBottom: '40px' }}>
        {quickCards.map((card) => (
          <div
            key={card.id}
            className="glass-panel glass-panel-hover"
            onClick={() => setActiveTab(card.id)}
            style={{
              padding: '24px',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '2.5rem' }}>{card.icon}</span>
                <span className="badge badge-indigo" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  {card.badge}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                {card.desc}
              </p>
            </div>

            <span
              style={{
                fontSize: '0.9rem',
                color: card.color,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {card.actionText} <ArrowRight size={16} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
