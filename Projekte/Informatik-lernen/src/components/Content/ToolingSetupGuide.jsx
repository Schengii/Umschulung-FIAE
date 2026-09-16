import React, { useState } from 'react';
import { Wrench } from 'lucide-react';

export default function ToolingSetupGuide() {
  const tools = [
    {
      id: 'vscode',
      title: 'VS Code Setup & Essential Extensions',
      icon: '💻',
      steps: [
        '1. Lade Visual Studio Code von code.visualstudio.com herunter.',
        '2. Installiere wichtige Extensions: ESLint, Prettier, GitLens, Live Server.',
        '3. Aktiviere Format on Save in den Einstellungen (Ctrl + , -> Format On Save).'
      ],
      configSnippet: `// settings.json empfohlene Konfiguration
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.autoSave": "afterDelay"
}`
    },
    {
      id: 'git',
      title: 'Git & SSH Key Einrichtung',
      icon: '🐙',
      steps: [
        '1. Git installieren (git-scm.com).',
        '2. Benutzername & E-Mail konfigurieren.',
        '3. SSH-Schlüssel generieren für Passwort-loses Pushen auf GitHub.'
      ],
      configSnippet: `# Git Initial-Konfiguration
git config --global user.name "Dein Name"
git config --global user.email "deine@email.de"

# SSH-Key generieren
ssh-keygen -t ed25519 -C "deine@email.de"`
    },
    {
      id: 'docker',
      title: 'Docker & Container Grundlagen',
      icon: '🐳',
      steps: [
        '1. Docker Desktop herunterladen & installieren.',
        '2. Dockerfile für die Anwendung erstellen.',
        '3. Container bauen & ausführen.'
      ],
      configSnippet: `# Dockerfile Beispiel für Node.js App
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`
    }
  ];

  const [activeToolId, setActiveToolId] = useState(tools[0].id);
  const activeTool = tools.find(t => t.id === activeToolId) || tools[0];

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wrench size={30} style={{ color: 'var(--accent-primary)' }} /> IDEs, Tools & Setup Anleitungen
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Schritt-für-Schritt Anleitungen zum Einrichten deiner Entwickler-Umgebung (VS Code, Git, Docker).
        </p>
      </div>

      {/* Tool Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveToolId(t.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: activeToolId === t.id ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeToolId === t.id ? '#ffffff' : 'var(--text-main)',
              border: activeToolId === t.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t.icon} {t.title}
          </button>
        ))}
      </div>

      {/* Active Tool Content */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
          {activeTool.icon} {activeTool.title}
        </h2>

        <div style={{ marginBottom: '24px' }}>
          <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>
            Setup Schritte:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeTool.steps.map((step, idx) => (
              <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="code-window">
          <div className="code-header">
            <span>Konfigurations-Code</span>
            <span>Setup Snippet</span>
          </div>
          <pre className="code-body">
            <code>{activeTool.configSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
