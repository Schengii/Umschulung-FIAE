import React, { useState } from 'react';
import { SQL_DUNGEON_LEVELS, MOCK_DATABASE_TABLES } from '../../data/gamesData';
import { Database, Play, CheckCircle2, AlertCircle, HelpCircle, Table, RefreshCw } from 'lucide-react';
import alasql from 'alasql';

export default function SqlDungeon({ onCompleteGame }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel = SQL_DUNGEON_LEVELS[levelIdx];
  
  const [userQuery, setUserQuery] = useState(currentLevel.initialQuery);
  const [queryResult, setQueryResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Real In-Browser AlaSQL Engine Execution
  const executeQuery = () => {
    setErrorMessage(null);
    setIsSuccess(false);

    try {
      // Setup temporary tables in memory
      alasql('CREATE TABLE IF NOT EXISTS mitarbeiter (id INT, name STRING, rolle STRING, gehalt INT, abteilung_id INT)');
      alasql('CREATE TABLE IF NOT EXISTS abteilungen (id INT, abteilungs_name STRING)');
      
      alasql('DELETE FROM mitarbeiter');
      alasql('DELETE FROM abteilungen');

      alasql.tables.mitarbeiter.data = [...MOCK_DATABASE_TABLES.mitarbeiter];
      alasql.tables.abteilungen.data = [...MOCK_DATABASE_TABLES.abteilungen];

      // Execute user query with real SQL Parser
      const res = alasql(userQuery);
      const rows = Array.isArray(res) ? res : [res];

      setQueryResult(rows);

      // Validate against current level win condition
      if (currentLevel.validate(rows)) {
        setIsSuccess(true);
        if (onCompleteGame) onCompleteGame(`sql_level_${currentLevel.id}`, currentLevel.xpReward);
      }
    } catch (err) {
      setErrorMessage(`SQL Syntax/Execution Error: ${err.message}`);
      setQueryResult(null);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Game Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={28} color="var(--accent-cyan)" /> SQL Query Dungeon (AlaSQL Engine)
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Schreibe echte SQL-Befehle mit echten JOINs, WHERE & GROUP BY Abfragen.
          </p>
        </div>

        {/* Level Switcher */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {SQL_DUNGEON_LEVELS.map((lvl, idx) => (
            <button
              key={lvl.id}
              onClick={() => {
                setLevelIdx(idx);
                setUserQuery(SQL_DUNGEON_LEVELS[idx].initialQuery);
                setQueryResult(null);
                setIsSuccess(false);
                setShowHint(false);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: levelIdx === idx ? 'var(--gradient-cyber)' : 'var(--bg-tertiary)',
                color: '#fff',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {lvl.id}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Challenge & Editor */}
        <div>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>{currentLevel.title}</span>
            <p style={{ fontWeight: '600', fontSize: '1.05rem', margin: '8px 0 16px 0' }}>
              {currentLevel.description}
            </p>

            <button
              onClick={() => setShowHint(!showHint)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-amber)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '16px'
              }}
            >
              <HelpCircle size={16} /> {showHint ? 'Hinweis verbergen' : 'Hinweis anzeigen'}
            </button>

            {showHint && (
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--accent-amber)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--accent-amber)', marginBottom: '16px' }}>
                💡 <strong>Tipp:</strong> {currentLevel.hint}
              </div>
            )}

            {/* SQL Code Terminal */}
            <div className="code-window">
              <div className="code-header">
                <span>SQL Terminal Query Editor</span>
                <span>In-Memory AlaSQL Engine</span>
              </div>
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  background: '#090d16',
                  color: '#38bdf8',
                  border: 'none',
                  outline: 'none',
                  padding: '14px',
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={executeQuery}>
                <Play size={16} /> Query Ausführen
              </button>
              <button className="btn btn-secondary" onClick={() => setUserQuery(currentLevel.initialQuery)}>
                <RefreshCw size={16} /> Reset
              </button>
            </div>

            {/* Result Status */}
            {isSuccess && (
              <div style={{ marginTop: '16px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--accent-green)', padding: '14px', borderRadius: 'var(--radius-md)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={24} />
                <div>
                  <strong>Level erfolgreich absolviert!</strong>
                  <p style={{ fontSize: '0.82rem' }}>+{currentLevel.xpReward} XP wurden gutgeschrieben.</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div style={{ marginTop: '16px', background: 'rgba(244, 63, 94, 0.2)', border: '1px solid var(--accent-rose)', padding: '14px', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={24} />
                <span>{errorMessage}</span>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Database Table Preview & Output */}
        <div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Table size={18} color="var(--accent-cyan)" /> Abfrage-Ergebnis (AlaSQL Output)
            </h4>

            {queryResult && queryResult.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                      {Object.keys(queryResult[0] || {}).map((col, idx) => (
                        <th key={idx} style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-cyan)' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} style={{ padding: '10px' }}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                Führe eine SQL-Query aus, um die Ergebnistabelle anzuzeigen.
              </div>
            )}

            {/* Schema Preview */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Schema der Tabelle "mitarbeiter":
              </h5>
              <code style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '6px', display: 'block' }}>
                id (INT), name (VARCHAR), rolle (VARCHAR), gehalt (INT), abteilung_id (INT)
              </code>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
