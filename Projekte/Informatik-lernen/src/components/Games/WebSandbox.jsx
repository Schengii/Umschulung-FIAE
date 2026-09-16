import React, { useState } from 'react';
import { Globe, CheckCircle2 } from 'lucide-react';

export default function WebSandbox({ onCompleteGame }) {
  const initialHtml = `<div class="card">
  <h1>Hallo Informatiker! 🚀</h1>
  <p>Verändere den Code links um das Design live zu sehen.</p>
  <button id="btn">Klick mich!</button>
</div>`;

  const initialCss = `body {
  background-color: #0d1117;
  color: #ffffff;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

button {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}`;

  const [htmlCode, setHtmlCode] = useState(initialHtml);
  const [cssCode, setCssCode] = useState(initialCss);
  const [activeTab, setActiveTab] = useState('html');
  const [isSaved, setIsSaved] = useState(false);

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
      </body>
    </html>
  `;

  const handleSave = () => {
    if (isSaved) return;
    setIsSaved(true);
    onCompleteGame('web_sandbox_first', 75);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={28} color="var(--accent-cyan)" /> Live Web Playground & Sandbox
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Schreibe HTML & CSS mit direkter Live-Vorschau in Echtzeit.
          </p>
        </div>

        <button className="btn btn-success" onClick={handleSave} disabled={isSaved}>
          <CheckCircle2 size={16} /> {isSaved ? 'Gespeichert!' : 'Web-App Speichern (+75 XP)'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Code Editor */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => setActiveTab('html')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: activeTab === 'html' ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                color: '#fff',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              HTML5
            </button>
            <button
              onClick={() => setActiveTab('css')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: activeTab === 'css' ? 'var(--accent-purple)' : 'var(--bg-tertiary)',
                color: '#fff',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              CSS3
            </button>
          </div>

          <div className="code-window">
            <div className="code-header">
              <span>{activeTab === 'html' ? 'index.html' : 'style.css'}</span>
              <span>Echtzeit Sync</span>
            </div>
            <textarea
              value={activeTab === 'html' ? htmlCode : cssCode}
              onChange={(e) => activeTab === 'html' ? setHtmlCode(e.target.value) : setCssCode(e.target.value)}
              rows={16}
              style={{
                width: '100%',
                background: '#090d16',
                color: '#e2e8f0',
                border: 'none',
                outline: 'none',
                padding: '14px',
                fontFamily: 'var(--font-code)',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
          </div>

        </div>

        {/* Right Column: Live Iframe Preview */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px' }}>
            🖥️ Live Browser Vorschau:
          </h4>
          <iframe
            srcDoc={srcDoc}
            title="Live Preview"
            sandbox="allow-scripts"
            style={{
              width: '100%',
              height: '380px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff'
            }}
          />
        </div>

      </div>

    </div>
  );
}
