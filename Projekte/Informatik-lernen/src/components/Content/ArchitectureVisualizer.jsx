import React, { useState } from 'react';
import { Network, Server, Database, Cpu, Layers, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

export default function ArchitectureVisualizer() {
  const [selectedNode, setSelectedNode] = useState('gateway');

  const nodes = [
    {
      id: 'client',
      name: '🌐 Web & Mobile Clients',
      type: 'Frontend',
      desc: 'Browser, iOS & Android Apps senden HTTPS-Anfragen an das Backend.',
      details: 'Nutzt REST APIs & WebSockets für Echtzeit-Kommunikation.'
    },
    {
      id: 'gateway',
      name: '🛡️ API Gateway & Load Balancer',
      type: 'Routing & Security',
      desc: 'Zentraler Eingangspunkt für Anfragen, Rate Limiting, SSL-Terminierung & Lastverteilung.',
      details: 'Routet Anfragen an verfügbare Microservice-Instanzen weiter (NGINX / HAProxy).'
    },
    {
      id: 'user_service',
      name: '⚙️ User & Auth Microservice',
      type: 'Backend Service',
      desc: 'Verwaltet Benutzerkonten, JWT-Tokens & Rechteverwaltung.',
      details: 'Kommuniziert mit der User-Datenbank und prüft Authentifizierung.'
    },
    {
      id: 'payment_service',
      name: '💳 Payment Microservice',
      type: 'Backend Service',
      desc: 'Verarbeitet Zahlungen & Rechnungsstellung entkoppelt vom Hauptsystem.',
      details: 'Nutzt Message Queues zur asynchronen Benachrichtigung.'
    },
    {
      id: 'cache',
      name: '⚡ Redis In-Memory Cache',
      type: 'Caching',
      desc: 'Speichert häufig abgefragte Daten im Arbeitsspeicher für Antworten im Millisekundenbereich.',
      details: 'Entlastet die Hauptdatenbanken drastisch.'
    },
    {
      id: 'database',
      name: '🗄️ SQL & NoSQL Datenbank Cluster',
      type: 'Persistence',
      desc: 'Hauptspeicherort für strukturierte Anwendungsdaten (PostgreSQL / MongoDB).',
      details: 'Repliziert Daten auf Primary- und Read-Replica Knoten.'
    }
  ];

  const activeNode = nodes.find(n => n.id === selectedNode) || nodes[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={32} style={{ color: 'var(--accent-primary)' }} /> Systemarchitektur & Microservices Visualizer
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Verstehe wie skalierbare Cloud-Systeme, API Gateways, Microservices & Caches zusammenarbeiten.
        </p>
      </div>

      {/* Interactive Architecture Flow Diagram */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
          Klicke auf eine Komponente der Architektur:
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: selectedNode === node.id ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: selectedNode === node.id ? '#ffffff' : 'var(--text-main)',
                border: selectedNode === node.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              }}
            >
              {node.name}
            </button>
          ))}
        </div>

        {/* Selected Component Explanation */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="badge badge-teal">{activeNode.type}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 700 }}>Architektur Komponente</span>
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
            {activeNode.name}
          </h3>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '16px' }}>
            {activeNode.desc}
          </p>

          <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-primary)' }}>
            <strong style={{ fontSize: '0.88rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>⚙️ Technische Umsetzung:</strong>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)' }}>{activeNode.details}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
