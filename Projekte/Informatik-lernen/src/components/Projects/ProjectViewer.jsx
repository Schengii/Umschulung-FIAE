import React, { useState } from 'react';
import { MICRO_PROJECTS } from '../../data/projectsData';
import { FolderGit2, CheckCircle2, Code, ArrowRight } from 'lucide-react';

export default function ProjectViewer({ onCompleteProject }) {
  const [activeProjId, setActiveProjId] = useState(MICRO_PROJECTS[0].id);
  const activeProj = MICRO_PROJECTS.find(p => p.id === activeProjId) || MICRO_PROJECTS[0];
  const [completedProjects, setCompletedProjects] = useState([]);

  const handleFinishProject = (id) => {
    if (!completedProjects.includes(id)) {
      setCompletedProjects(prev => [...prev, id]);
      onCompleteProject(id, activeProj.xpReward);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FolderGit2 size={28} color="var(--accent-amber)" /> Praxis-Mikroprojekte
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Geführte Schritt-für-Schritt Projekte um echte praktische Erfahrung als Entwickler zu sammeln.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Project Selector Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MICRO_PROJECTS.map(proj => {
            const isSelected = activeProjId === proj.id;
            const isDone = completedProjects.includes(proj.id);

            return (
              <div
                key={proj.id}
                onClick={() => setActiveProjId(proj.id)}
                className="glass-panel-hover"
                style={{
                  background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-amber">{proj.difficulty}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: '700' }}>+{proj.xpReward} XP</span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '6px' }}>
                  {proj.icon} {proj.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{proj.category} • {proj.estimatedTime}</p>
              </div>
            );
          })}
        </div>

        {/* Project Step-by-Step Detail View */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="badge badge-amber">{activeProj.category}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Geschätzte Zeit: {activeProj.estimatedTime}</span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '12px' }}>
              {activeProj.icon} {activeProj.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', marginBottom: '24px' }}>
              {activeProj.description}
            </p>

            {/* Steps List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
              {activeProj.steps.map((step, idx) => (
                <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px', color: 'var(--accent-cyan)' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    {step.detail}
                  </p>

                  <div className="code-window">
                    <div className="code-header">
                      <span>Code-Vorlage Schritt {idx + 1}</span>
                      <Code size={14} />
                    </div>
                    <pre className="code-body">
                      <code>{step.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-success"
              onClick={() => handleFinishProject(activeProj.id)}
              disabled={completedProjects.includes(activeProj.id)}
              style={{ opacity: completedProjects.includes(activeProj.id) ? 0.7 : 1 }}
            >
              <CheckCircle2 size={18} /> {completedProjects.includes(activeProj.id) ? 'Projekt Erfolgreich Absolviert!' : `Projekt Abschließen (+${activeProj.xpReward} XP)`}
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
