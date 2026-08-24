import React, { useState } from 'react';
import { Flag, ShieldAlert, CheckCircle2, Lock, Sparkles, Terminal, HelpCircle, Eye, RefreshCw } from 'lucide-react';

const CTF_QUESTS = [
  {
    id: 'xss',
    title: 'Quest #1: Reflected Cross-Site Scripting (XSS)',
    category: 'Web Security',
    difficulty: 'Easy',
    points: 50,
    flag: 'CTF{XSS_INJECTION_MASTER_2026}',
    description: 'Eine Suchzeile rendert den Nutzereingabe-Parameter direkt als unescaped HTML in die Webseite. Injiziere ein Script-Tag mit einer Alert-Ausführung!',
    hint: 'Verwende: <script>alert(document.cookie)</script> um ein Script auszuführen.',
    sampleCode: '<div>Suchergebnis für: <span id="query">__INPUT__</span></div>'
  },
  {
    id: 'sqli',
    title: 'Quest #2: SQL Injection Authentication Bypass',
    category: 'Database Security',
    difficulty: 'Medium',
    points: 75,
    flag: 'CTF{SQL_INJECTION_ADMIN_BYPASS}',
    description: 'Ein Login-Formular verknüpft SQL-Queries ohne Prepared Statements. Umgehe das Passwortfeld durch eine True-Bedingung (`OR 1=1`)!',
    hint: 'Eingabe im Benutzernamen: admin\' OR \'1\'=\'1',
    sampleCode: 'SELECT * FROM users WHERE username = \'__INPUT__\' AND password = \'...\';'
  },
  {
    id: 'cmdi',
    title: 'Quest #3: OS Command Injection',
    category: 'Server Security',
    difficulty: 'Hard',
    points: 100,
    flag: 'CTF{COMMAND_INJECTION_PWNED}',
    description: 'Ein Ping-Werkzeug führt `ping -c 1 [ip]` im Server-Terminal aus. Hänge einen Semikolon-Befehl an, um Datei-Inhalte auszulesen (`cat /flag.txt`)!',
    hint: 'Versuche: 127.0.0.1; cat /etc/flag.txt',
    sampleCode: '$ system("ping -c 1 " + userInput);'
  },
  {
    id: 'base64',
    title: 'Quest #4: Crypto & Base64 Decoding',
    category: 'Cryptography',
    difficulty: 'Easy',
    points: 25,
    flag: 'CTF{BASE64_DECODE_SUCCESS}',
    description: 'Ein geheimer API Key wurde als Base64-String übertragen: `Q1RGe0JBU0U2NF9ERUNPREVfV0lOfQ==`. Dekodiere den String!',
    hint: 'In Javascript oder Linux Terminal: atob("...") oder `echo "..." | base64 -d`',
    sampleCode: 'Encoded: Q1RGe0JBU0U2NF9ERUNPREVfV0lOfQ=='
  }
];

export default function CtfChallengeLab({ onRewardXP }) {
  const [activeQuestId, setActiveQuestId] = useState('xss');
  const [flagInputs, setFlagInputs] = useState({});
  const [solvedQuests, setSolvedQuests] = useState([]);
  const [showHint, setShowHint] = useState({});
  const [testPayload, setTestPayload] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [feedback, setFeedback] = useState({});

  const currentQuest = CTF_QUESTS.find(q => q.id === activeQuestId);

  const handleRunPayload = () => {
    if (!testPayload) return;
    if (activeQuestId === 'xss') {
      if (testPayload.includes('<script>') || testPayload.includes('onload=') || testPayload.includes('onerror=')) {
        setTestOutput(`⚠️ XSS Ausgeführt! Alert-Box Popup simuliert. Flagge freigeschaltet: CTF{XSS_INJECTION_MASTER_2026}`);
      } else {
        setTestOutput(`Ausgabe: ${testPayload} (Kein XSS erkannt - benutze HTML Script Tags)`);
      }
    } else if (activeQuestId === 'sqli') {
      if (testPayload.includes("' OR '") || testPayload.includes("' OR 1=1") || testPayload.includes("' OR '1'='1")) {
        setTestOutput(`🔓 SQL Auth Bypass Erfolgreich! Angemeldet als 'admin'. Flagge: CTF{SQL_INJECTION_ADMIN_BYPASS}`);
      } else {
        setTestOutput(`Query: SELECT * FROM users WHERE username = '${testPayload}' AND password = '...' -> 0 Treffer.`);
      }
    } else if (activeQuestId === 'cmdi') {
      if (testPayload.includes(';') || testPayload.includes('&&') || testPayload.includes('|')) {
        setTestOutput(`Terminal Executed:\n$ ping -c 1 127.0.0.1\n$ cat /etc/flag.txt\n-> CTF{COMMAND_INJECTION_PWNED}`);
      } else {
        setTestOutput(`Terminal Executed:\n$ ping -c 1 ${testPayload}\nPING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.`);
      }
    } else if (activeQuestId === 'base64') {
      try {
        const decoded = atob('Q1RGe0JBU0U2NF9ERUNPREVfV0lOfQ==');
        setTestOutput(`Dekodierter String: ${decoded}`);
      } catch (e) {
        setTestOutput('Fehler beim Dekodieren');
      }
    }
  };

  const handleSubmitFlag = (e) => {
    e.preventDefault();
    const inputFlag = (flagInputs[activeQuestId] || '').trim();

    if (inputFlag === currentQuest.flag) {
      if (!solvedQuests.includes(activeQuestId)) {
        setSolvedQuests(prev => [...prev, activeQuestId]);
        if (onRewardXP) onRewardXP(currentQuest.points);
      }
      setFeedback(prev => ({ ...prev, [activeQuestId]: { type: 'success', msg: `🎉 Richtig! Quest '${currentQuest.title}' gelöst (+${currentQuest.points} XP).` } }));
    } else {
      setFeedback(prev => ({ ...prev, [activeQuestId]: { type: 'error', msg: '❌ Falsche Flagge. Überprüfe deinen Payload oder dekodiere den Hinweis.' } }));
    }
  };

  const toggleHint = (questId) => {
    setShowHint(prev => ({ ...prev, [questId]: !prev[questId] }));
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={14} /> Cybersecurity & Ethical Hacking
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🚩 Cybersecurity CTF Quest Lab (XSS, SQLi & Command Injection)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Löse praxisnahe Hacking-Challenges, teste Sicherheitslücken und finde die versteckten {'`CTF{...}`'} Flaggen.
          </p>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flag size={20} style={{ color: 'var(--accent-rose)' }} />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gelöste Flaggen</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
              {solvedQuests.length} / {CTF_QUESTS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Quest Selection Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {CTF_QUESTS.map((q) => {
          const isSolved = solvedQuests.includes(q.id);
          const isActive = activeQuestId === q.id;
          return (
            <button
              key={q.id}
              onClick={() => { setActiveQuestId(q.id); setTestOutput(''); setTestPayload(''); }}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--accent-primary)' : 'var(--bg-primary)',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSolved ? <CheckCircle2 size={16} style={{ color: isActive ? '#ffffff' : 'var(--accent-emerald)' }} /> : <Lock size={16} />}
              {q.title.split(':')[0]}
            </button>
          );
        })}
      </div>

      {/* Active Quest Card */}
      <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
            {currentQuest.title}
          </h3>
          <span style={{
            background: currentQuest.difficulty === 'Easy' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
            color: currentQuest.difficulty === 'Easy' ? '#10b981' : '#f59e0b',
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            fontSize: '0.85rem'
          }}>
            {currentQuest.difficulty} (+{currentQuest.points} XP)
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
          {currentQuest.description}
        </p>

        {/* Code Snippet Box */}
        <div style={{ background: '#0f172a', padding: '14px', borderRadius: 'var(--radius-md)', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '16px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Vulnerable Code Snippet:</div>
          {currentQuest.sampleCode}
        </div>

        {/* Interactive Testing Sandbox */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
            🧪 Interactive Payload Simulator:
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              placeholder="Test-Payload eingeben..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                minWidth: '240px'
              }}
            />
            <button className="btn btn-secondary" onClick={handleRunPayload} style={{ gap: '6px' }}>
              <Terminal size={16} /> Payload Testen
            </button>
          </div>

          {testOutput && (
            <pre style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: '#020617',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '0.88rem',
              whiteSpace: 'pre-wrap',
              border: '1px solid #0f172a'
            }}>
              {testOutput}
            </pre>
          )}
        </div>

        {/* Hint Toggle */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => toggleHint(currentQuest.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.88rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: 0
            }}
          >
            <HelpCircle size={16} /> {showHint[currentQuest.id] ? 'Hinweis ausblenden' : 'Hinweis anzeigen'}
          </button>
          {showHint[currentQuest.id] && (
            <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-main)' }}>
              💡 <strong>Tipp:</strong> {currentQuest.hint}
            </div>
          )}
        </div>

        {/* Flag Submission Form */}
        <form onSubmit={handleSubmitFlag} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={flagInputs[activeQuestId] || ''}
            onChange={(e) => setFlagInputs({ ...flagInputs, [activeQuestId]: e.target.value })}
            placeholder="CTF{...} Flagge hier eingeben"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              minWidth: '260px'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ gap: '8px' }}>
            <Flag size={16} /> Flagge Einreichen
          </button>
        </form>

        {feedback[activeQuestId] && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            background: feedback[activeQuestId].type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
            color: feedback[activeQuestId].type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            border: `1px solid ${feedback[activeQuestId].type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
          }}>
            {feedback[activeQuestId].msg}
          </div>
        )}
      </div>
    </div>
  );
}
