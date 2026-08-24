import React, { useState } from 'react';
import { Search, Code, CheckCircle2, XCircle, Sparkles, Flag } from 'lucide-react';

const REGEX_QUESTS = [
  {
    id: 'email',
    title: 'Quest #1: E-Mail-Adressen validieren',
    description: 'Erstelle einen RegEx-Ausdruck, der alle gültigen E-Mail-Adressen erkennt (z. B. dev@example.com).',
    targetString: 'Test-Mails: user.name@domain.de, invalid-email@, admin@company.com, test@.org',
    expectedMatches: ['user.name@domain.de', 'admin@company.com'],
    samplePattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    hint: 'Nutze `[a-zA-Z0-9._%+-]+` für den Namen, gefolgt von `@`, der Domain und `\\.[a-zA-Z]{2,}`'
  },
  {
    id: 'ip',
    title: 'Quest #2: IPv4 Adressen erkennen',
    description: 'Erstelle einen RegEx, der IPv4 Adressen wie `192.168.1.1` oder `10.0.0.255` im Text matchet.',
    targetString: 'Server IPs: 192.168.1.1, 999.999.999.999, 10.0.0.1, localhost, 172.16.254.1',
    expectedMatches: ['192.168.1.1', '10.0.0.1', '172.16.254.1'],
    samplePattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    hint: 'Nutze `\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b` um Zahlenblöcke von 1-3 Ziffern zu erfassen.'
  },
  {
    id: 'phone',
    title: 'Quest #3: Telefonnummern filtern',
    description: 'Finde deutsche Vorwahl-Telefonnummern im Format `+49 171 1234567` oder `0171-1234567`.',
    targetString: 'Kontakte: +49 171 1234567, Tel: 0171-1234567, Hallo, 12345',
    expectedMatches: ['+49 171 1234567', '0171-1234567'],
    samplePattern: '(?:\\+49|0)\\s?\\d{3,4}[-\\s]?\\d{5,8}',
    hint: 'Nutze `(?:\\+49|0)` für den Start, gefolgt von Leerzeichen/Bindestrich und Ziffern.'
  },
  {
    id: 'hex',
    title: 'Quest #4: Hex-Farbcodes extrahieren',
    description: 'Matche Hexadecimal Farbcodes wie `#FF5733`, `#0f172a` oder `#FFF`.',
    targetString: 'Farben: #FF5733, #0f172a, #FFF, 123456, #zzzzzz',
    expectedMatches: ['#FF5733', '#0f172a', '#FFF'],
    samplePattern: '#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b',
    hint: 'Nutze `#` gefolgt von `[a-fA-F0-9]{6}` oder `{3}`.'
  }
];

export default function RegexMasterLab({ onRewardXP }) {
  const [patternInput, setPatternInput] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flagsInput, setFlagsInput] = useState('g');
  const [testText, setTestText] = useState('Test-Mails: user.name@domain.de, invalid-email@, admin@company.com, test@.org');
  const [activeQuestId, setActiveQuestId] = useState('email');
  const [solvedQuests, setSolvedQuests] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');

  const currentQuest = REGEX_QUESTS.find(q => q.id === activeQuestId);

  const getMatches = () => {
    if (!patternInput) return [];
    try {
      const regex = new RegExp(patternInput, flagsInput.includes('g') ? flagsInput : flagsInput + 'g');
      const matches = [...testText.matchAll(regex)];
      return matches.map(m => m[0]);
    } catch {
      return [];
    }
  };

  const matches = getMatches();

  const handleSelectQuest = (quest) => {
    setActiveQuestId(quest.id);
    setPatternInput('');
    setTestText(quest.targetString);
    setShowHint(false);
    setFeedback('');
  };

  const handleCheckQuest = () => {
    const foundMatches = getMatches();
    const expected = currentQuest.expectedMatches;

    const isMatchExact = expected.length > 0 && 
      expected.every(item => foundMatches.includes(item)) &&
      foundMatches.length === expected.length;

    if (isMatchExact) {
      if (!solvedQuests.includes(activeQuestId)) {
        setSolvedQuests(prev => [...prev, activeQuestId]);
        if (onRewardXP) onRewardXP(35);
      }
      setFeedback('🎉 Richtig! Alle Ziel-Strings wurden exakt gematcht (+35 XP).');
    } else {
      setFeedback(`❌ Noch nicht ganz. Gematcht: [${foundMatches.join(', ')}]. Erwartet: [${expected.join(', ')}]`);
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Search size={14} /> Regular Expressions & Pattern Matching
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🔍 Regex Master Quest & Live Matcher
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Lerne und teste Reguläre Ausdrücke (RegEx) interaktiv mit Live Highlighting & geführten Quests.
          </p>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flag size={20} style={{ color: 'var(--accent-emerald)' }} />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gelöste Quests</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
              {solvedQuests.length} / {REGEX_QUESTS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Quest Selection Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {REGEX_QUESTS.map((q) => {
          const isSolved = solvedQuests.includes(q.id);
          const isActive = activeQuestId === q.id;
          return (
            <button
              key={q.id}
              onClick={() => handleSelectQuest(q)}
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
              {isSolved ? <CheckCircle2 size={16} style={{ color: isActive ? '#ffffff' : 'var(--accent-emerald)' }} /> : <Search size={16} />}
              {q.title.split(':')[0]}
            </button>
          );
        })}
      </div>

      {/* Active Quest Context Box */}
      <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px 0' }}>
          {currentQuest.title}
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '0 0 12px 0' }}>
          {currentQuest.description}
        </p>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowHint(!showHint)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
          >
            {showHint ? 'Tipp ausblenden' : 'Tipp anzeigen'}
          </button>
          <button
            onClick={() => setPatternInput(currentQuest.samplePattern)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
          >
            Lösung einsetzen
          </button>
        </div>

        {showHint && (
          <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-main)' }}>
            💡 {currentQuest.hint}
          </div>
        )}
      </div>

      {/* Live RegEx Input Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b', padding: '0 12px' }}>
          <span style={{ color: '#64748b', fontFamily: 'monospace', fontWeight: '800', fontSize: '1.1rem' }}>/</span>
          <input
            type="text"
            value={patternInput}
            onChange={(e) => setPatternInput(e.target.value)}
            placeholder="RegEx Pattern (z. B. [a-z]+)"
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <span style={{ color: '#64748b', fontFamily: 'monospace', fontWeight: '800', fontSize: '1.1rem' }}>/</span>
          <input
            type="text"
            value={flagsInput}
            onChange={(e) => setFlagsInput(e.target.value)}
            placeholder="g"
            style={{
              width: '40px',
              padding: '12px 4px',
              background: 'transparent',
              border: 'none',
              color: '#a5b4fc',
              fontFamily: 'monospace',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleCheckQuest} style={{ gap: '8px', padding: '0 24px' }}>
          <CheckCircle2 size={18} /> Quest Überprüfen
        </button>
      </div>

      {feedback && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontWeight: '700',
          background: feedback.includes('Richtig') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
          color: feedback.includes('Richtig') ? 'var(--accent-emerald)' : 'var(--accent-rose)',
          border: `1px solid ${feedback.includes('Richtig') ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
        }}>
          {feedback}
        </div>
      )}

      {/* Target Test Area & Live Matches Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Test Text Input */}
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
            📝 Ziel-Text zum Durchsuchen:
          </label>
          <textarea
            rows={6}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: '#0f172a',
              color: '#f8fafc',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              border: '1px solid #1e293b',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Live Match Results */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>🎯 Gematchte Ergebnisse:</span>
            <span style={{ color: '#10b981', fontWeight: '800' }}>{matches.length} Treffer</span>
          </h4>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {matches.length === 0 ? (
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Keine Treffer gefunden. Passe den Ausdruck an!</span>
            ) : (
              matches.map((m, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(99,102,241,0.25)',
                    color: '#a5b4fc',
                    border: '1px solid #6366f1',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'monospace',
                    fontSize: '0.88rem',
                    fontWeight: '700'
                  }}
                >
                  {m}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
