import React, { useState, useMemo } from 'react';
import { Database, Zap, CheckCircle2, HardDrive, Copy, Layers } from 'lucide-react';
import { 
  estimateIndexMetrics, 
  recommendIndexType, 
  INDEX_TYPES 
} from '../../utils/postgresIndexTypesEngine';
import { useStore } from '../../store/useStore';

export default function PostgresIndexTypesLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('advisor'); // 'advisor' | 'compare' | 'cheatsheet'
  
  // Advisor State
  const [dataType, setDataType] = useState('timestamp');
  const [queryPattern, setQueryPattern] = useState('range');
  const [rowCount, setRowCount] = useState(5000000);
  const [isSorted, setIsSorted] = useState(true);
  const [copied, setCopied] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Compare Tab State
  const [compareRowCount, setCompareRowCount] = useState(2000000);

  const recommendation = useMemo(() => {
    return recommendIndexType({
      dataType,
      queryPattern,
      tableRows: rowCount,
      isClusteredOrAppended: isSorted
    });
  }, [dataType, queryPattern, rowCount, isSorted]);

  const recommendedMetrics = useMemo(() => {
    return estimateIndexMetrics({
      indexType: recommendation.recommendedType,
      rowCount,
      isPhysicallySorted: isSorted
    });
  }, [recommendation, rowCount, isSorted]);

  const comparisonData = useMemo(() => {
    return Object.keys(INDEX_TYPES).map(key => {
      const type = INDEX_TYPES[key];
      const metrics = estimateIndexMetrics({
        indexType: type.id,
        rowCount: compareRowCount,
        isPhysicallySorted: true
      });
      return {
        ...type,
        ...metrics
      };
    });
  }, [compareRowCount]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(recommendation.sqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    if (!rewardClaimed) {
      awardXP(50, 'PostgreSQL Index Specialist (B-Tree, GIN, GiST, BRIN)');
      setRewardClaimed(true);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Database size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>
                PostgreSQL Index Types Deep Dive
              </h1>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                B-Tree, GIN, GiST & BRIN: Index-Auswahl, Speicher-Overhead und Query Execution Tuning
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('advisor')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'advisor' ? '#3b82f6' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={16} /> Index Advisor
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'compare' ? '#3b82f6' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HardDrive size={16} /> Benchmark & Größen
          </button>
          <button
            onClick={() => setActiveTab('cheatsheet')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'cheatsheet' ? '#3b82f6' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} /> Index-Matrix
          </button>
        </div>
      </div>

      {/* TAB 1: Index Advisor */}
      {activeTab === 'advisor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls */}
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#38bdf8', fontWeight: 'bold' }}>
              Szenario-Parameter für automatische Index-Empfehlung
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Spalten-Datentyp:
                </label>
                <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '6px' }}
                >
                  <option value="timestamp">timestamp (z. B. created_at, Event-Logs)</option>
                  <option value="integer">integer / bigint (z. B. user_id, Bestellnummer)</option>
                  <option value="jsonb">jsonb (Semi-strukturierte Dokumente)</option>
                  <option value="geometry">geometry / geography (PostGIS Geodaten)</option>
                  <option value="array">array (text[], int[] Tag-Listen)</option>
                  <option value="varchar">varchar / text (Suchbegriffe, Namen)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Abfrage-Muster (SQL Query Pattern):
                </label>
                <select
                  value={queryPattern}
                  onChange={(e) => setQueryPattern(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '6px' }}
                >
                  <option value="equality">Exakte Gleichheit (=, IN)</option>
                  <option value="range">Bereichsabfrage (&lt;, &gt;, BETWEEN)</option>
                  <option value="contains">JSONB Enthält / Array Schnittmenge (@&gt;, &amp;&amp;)</option>
                  <option value="spatial">Räumliche Distanz &amp; Bounding Box (&lt;-&gt;, &amp;&amp;)</option>
                  <option value="fulltext">Volltextsuche (to_tsvector @@ to_tsquery)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Tabellengröße: <strong>{(rowCount / 1000000).toFixed(1)} Mio. Zeilen</strong>
                </label>
                <input
                  type="range"
                  min="100000"
                  max="15000000"
                  step="500000"
                  value={rowCount}
                  onChange={(e) => setRowCount(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Physikalische Sortierung auf Disk:
                </label>
                <button
                  onClick={() => setIsSorted(!isSorted)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isSorted ? '#10b981' : '#475569',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {isSorted ? '✓ Sortiert / Append-Only' : 'Ungleichmäßig / Random'}
                </button>
              </div>
            </div>
          </div>

          {/* Recommendation Display */}
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                  Empfohlener PostgreSQL Indextyp
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                  {INDEX_TYPES[recommendation.recommendedType.toUpperCase()].name}
                </h3>
              </div>

              <button
                onClick={handleCopySql}
                style={{
                  padding: '8px 16px',
                  background: copied ? '#10b981' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? 'Kopiert!' : 'SQL DDL kopieren (+50 XP)'}
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
              <code style={{ color: '#4ade80', fontSize: '0.95rem', fontFamily: 'monospace' }}>
                {recommendation.sqlSnippet}
              </code>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '20px' }}>
              <strong>Begründung:</strong> {recommendation.reason}
            </div>

            {/* Performance Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tabellengröße Netto</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>{recommendedMetrics.tableSizeMb} MB</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Geschätzte Indexgröße</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#38bdf8' }}>{recommendedMetrics.indexSizeMb} MB</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  ({((recommendedMetrics.indexSizeMb / recommendedMetrics.tableSizeMb) * 100).toFixed(1)}% der Tabelle)
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Abfragezeit (Index Scan)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4ade80' }}>{recommendedMetrics.indexScanMs} ms</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>vs. {recommendedMetrics.seqScanMs} ms Seq Scan</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Abfrage-Speedup</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b' }}>~{recommendedMetrics.speedup}x</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Compare Tab */}
      {activeTab === 'compare' && (
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8' }}>
              Speicherbedarf & Abfragedauer im direkten Vergleich
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <span>Zeilenanzahl:</span>
              <select
                value={compareRowCount}
                onChange={(e) => setCompareRowCount(Number(e.target.value))}
                style={{ padding: '6px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
              >
                <option value={500000}>500.000 Zeilen (~60 MB)</option>
                <option value={2000000}>2.000.000 Zeilen (~240 MB)</option>
                <option value={10000000}>10.000.000 Zeilen (~1.2 GB)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {comparisonData.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: item.id === 'brin' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{item.name}</h4>
                  {item.id === 'brin' && (
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#15803d', color: '#fff' }}>
                      Kompaktester Index
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px', minHeight: '38px' }}>
                  {item.bestFor}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <div>Indexgröße: <strong style={{ color: item.id === 'brin' ? '#4ade80' : '#38bdf8' }}>{item.indexSizeMb} MB</strong></div>
                  <div>Query Time: <strong>{item.indexScanMs} ms</strong></div>
                  <div>Write Overhead: <span style={{ color: item.id === 'gin' ? '#f87171' : '#cbd5e1' }}>{item.writeOverhead}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Index Cheatsheet */}
      {activeTab === 'cheatsheet' && (
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 16px 0', color: '#fbbf24' }}>
            PostgreSQL Index-Typen Referenzmatrix
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Index</th>
                <th style={{ padding: '10px' }}>Unterstützte Operatoren</th>
                <th style={{ padding: '10px' }}>Haupt-Einsatzzweck</th>
                <th style={{ padding: '10px' }}>Wartungs-Overhead (Schreiben)</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(INDEX_TYPES).map(type => (
                <tr key={type.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 'bold', color: '#38bdf8' }}>{type.name}</td>
                  <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: '#a78bfa' }}>{type.operators.join('  ')}</td>
                  <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{type.bestFor}</td>
                  <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{type.writeOverhead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
