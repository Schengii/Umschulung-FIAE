import React from 'react';
import { Award, Sparkles, CheckCircle2, Lock } from 'lucide-react';

export const SKILL_TREE_DATA = [
  {
    category: 'Tier 1: IT-Grundlagen',
    nodes: [
      { id: 'eva', title: 'EVA-Prinzip & Hardware', desc: 'Eingabe, Verarbeitung, Ausgabe & CPU Aufbau', xp: 50, req: null },
      { id: 'binary', title: 'Binärsystem & Zahlensysteme', desc: 'Dezimal, Binär, Hexadezimal & Bitshift', xp: 50, req: null },
      { id: 'networks', title: 'Netzwerk Grundlagen', desc: 'OSI-Modell, TCP/IP, DNS & IP-Adressen', xp: 75, req: null }
    ]
  },
  {
    category: 'Tier 2: Programmierung & Datenbanken',
    nodes: [
      { id: 'js_es6', title: 'JavaScript ES6+ & Async', desc: 'Promises, Async/Await, Array Methods', xp: 100, req: 'eva' },
      { id: 'sql_master', title: 'SQL & Relationale DBs', desc: 'JOINs, Subqueries, Normalisierung (1NF-3NF)', xp: 120, req: 'binary' },
      { id: 'python_core', title: 'Python Programming', desc: 'OOP, Datenstrukturen & Data Cleaning', xp: 100, req: 'binary' }
    ]
  },
  {
    category: 'Tier 3: Systemintegration & Cloud Native',
    nodes: [
      { id: 'subnetting', title: 'CIDR Subnetting & Routing', desc: 'Subnetzmasken, Netz-ID & Broadcast', xp: 150, req: 'networks' },
      { id: 'git_branching', title: 'Git Workflows & Merging', desc: 'Commits, Rebase, Branching & Conflict Resolution', xp: 150, req: 'js_es6' },
      { id: 'docker_k8s', title: 'Docker & Kubernetes', desc: 'Container, Pods, Deployments & Services', xp: 200, req: 'sql_master' }
    ]
  },
  {
    category: 'Tier 4: Enterprise Architecture & AI',
    nodes: [
      { id: 'microservices', title: 'Microservices & Event-Driven', desc: 'Apache Kafka, Circuit Breakers & REST/gRPC', xp: 250, req: 'docker_k8s' },
      { id: 'rag_ai', title: 'RAG & Vector AI Pipelines', desc: 'Embeddings, Vector DBs (Pinecone/Chroma)', xp: 300, req: 'python_core' }
    ]
  }
];

export default function SkillTreeWidget({ userState }) {
  const unlockedTopics = userState.completedTopics || [];

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <Award size={14} /> RPG Skill Tree & Lernpfad
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🌳 Interaktiver Informatik Skill-Baum
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Schalte Stufe für Stufe neue Skills von den Grundlagen bis zu Cloud Native & AI frei.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {SKILL_TREE_DATA.map((tier, tIdx) => (
          <div key={tIdx}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-indigo)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {tier.category}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {tier.nodes.map((node) => {
                const isUnlocked = unlockedTopics.includes(node.id) || !node.req;
                const isCompleted = unlockedTopics.includes(node.id);

                return (
                  <div
                    key={node.id}
                    style={{
                      background: isCompleted ? 'rgba(16, 185, 129, 0.08)' : isUnlocked ? 'var(--bg-primary)' : 'rgba(15, 23, 42, 0.4)',
                      border: isCompleted ? '2px solid var(--accent-emerald)' : isUnlocked ? '1px solid var(--border-color)' : '1px dashed var(--border-color)',
                      padding: '20px',
                      borderRadius: 'var(--radius-lg)',
                      opacity: isUnlocked ? 1 : 0.6,
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>+{node.xp} XP</span>
                      {isCompleted ? (
                        <CheckCircle2 size={20} color="var(--accent-emerald)" />
                      ) : isUnlocked ? (
                        <Sparkles size={18} color="var(--accent-indigo)" />
                      ) : (
                        <Lock size={18} color="var(--text-muted)" />
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '4px 0', color: isUnlocked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {node.title}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                      {node.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
