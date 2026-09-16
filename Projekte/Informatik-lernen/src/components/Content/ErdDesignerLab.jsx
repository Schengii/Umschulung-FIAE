import React, { useState, useMemo } from 'react';

import { Database, Table, Key, Link2, CheckCircle2, Code, Copy, Sparkles, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { INITIAL_ERD_SCHEMA, auditNormalization, generateSqlDdl } from '../../utils/erdDesignerEngine';

export default function ErdDesignerLab() {
  const { awardXP } = useStore();
  const [schema, setSchema] = useState(INITIAL_ERD_SCHEMA);
  const [sqlDialect, setSqlDialect] = useState('postgres'); // 'postgres' | 'mysql' | 'sqlite'
  const [copied, setCopied] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState('e_customers');
  const [xpClaimed, setXpClaimed] = useState(false);

  // Normalization Audit Results
  const normalizationIssues = useMemo(() => {
    return auditNormalization(schema);
  }, [schema]);

  // Generated SQL DDL
  const generatedSql = useMemo(() => {
    return generateSqlDdl(schema, sqlDialect);
  }, [schema, sqlDialect]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (!xpClaimed) {
      setXpClaimed(true);
      awardXP(15, 'erd_sql_exported');
    }
  };

  const handleAddField = (entityId) => {
    setSchema(prev => {
      const nextEntities = prev.entities.map(e => {
        if (e.id === entityId) {
          const nextFieldId = `f_${Date.now()}`;
          return {
            ...e,
            fields: [
              ...e.fields,
              { id: nextFieldId, name: 'new_attribute', type: 'VARCHAR(100)', isPk: false, isNullable: true }
            ]
          };
        }
        return e;
      });
      return { ...prev, entities: nextEntities };
    });
  };

  const handleRemoveField = (entityId, fieldId) => {
    setSchema(prev => {
      const nextEntities = prev.entities.map(e => {
        if (e.id === entityId) {
          return {
            ...e,
            fields: e.fields.filter(f => f.id !== fieldId)
          };
        }
        return e;
      });
      return { ...prev, entities: nextEntities };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Database size={14} /> Datenbanken &amp; IHK LF 8</span>
              <span className="badge badge-teal"><Sparkles size={14} /> Relational ERD Studio &amp; Normalisierung</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Relational ERD Designer &amp; Normalform-Linter
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Entwerfe relationale Datenmodelle (ER-Modelle), prüfe 1NF bis 3NF Normalformen auf funktionale Abhängigkeiten und exportiere produktionsreifen SQL DDL Code.
            </p>
          </div>
        </div>
      </div>

      {/* Normalization Linter Alerts Banner */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--accent-teal)" /> Normalisierungs-Audit (1NF, 2NF, 3NF)
          </h2>
          <span className={`badge ${normalizationIssues.length === 0 ? 'badge-emerald' : 'badge-amber'}`}>
            {normalizationIssues.length === 0 ? 'Optimal normalisiert' : `${normalizationIssues.length} Hinweise / Warnungen`}
          </span>
        </div>

        {normalizationIssues.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontSize: '0.92rem' }}>
            <CheckCircle2 size={16} /> Alle Tabellen erfüllen die 3. Normalform (3NF) ohne erkennbare relationale Anomalien!
          </div>
        ) : (
          <div className="space-y-2">
            {normalizationIssues.map((issue, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${issue.level === 'ERROR' ? 'var(--accent-rose)' : 'var(--accent-amber)'}`,
                  fontSize: '0.88rem'
                }}
              >
                <span style={{ fontWeight: '800', marginRight: '8px', color: issue.level === 'ERROR' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                  [{issue.nf}]
                </span>
                {issue.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ERD Entity Cards Grid */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {schema.entities.map(entity => (
          <div
            key={entity.id}
            onClick={() => setSelectedEntityId(entity.id)}
            className="glass-panel"
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              border: selectedEntityId === entity.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              position: 'relative'
            }}
          >
            {/* Entity Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Table size={18} color="var(--accent-indigo)" />
                <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>{entity.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddField(entity.id);
                }}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.78rem', gap: '4px' }}
              >
                <Plus size={14} /> Spalte
              </button>
            </div>

            {/* Entity Columns */}
            <div className="space-y-2" style={{ fontSize: '0.85rem' }}>
              {entity.fields.map(field => (
                <div
                  key={field.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {field.isPk && <Key size={14} color="var(--accent-amber)" title="Primary Key" />}
                    {field.isFk && <Link2 size={14} color="var(--accent-teal)" title={`Foreign Key (${field.references})`} />}
                    <span style={{ fontWeight: field.isPk ? '800' : '500', color: field.isPk ? 'var(--accent-amber)' : 'var(--text-main)' }}>
                      {field.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {field.type}
                    </span>
                    {!field.isPk && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveField(entity.id, field.id);
                        }}
                        className="btn btn-ghost"
                        style={{ padding: '2px 4px', color: 'var(--accent-rose)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SQL DDL Code Generator */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={18} color="var(--accent-teal)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Generierter SQL DDL Code</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Dialect Switcher */}
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
              {['postgres', 'mysql', 'sqlite'].map(dialect => (
                <button
                  key={dialect}
                  onClick={() => setSqlDialect(dialect)}
                  className={`btn ${sqlDialect === dialect ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '4px 10px', fontSize: '0.8rem', textTransform: 'uppercase' }}
                >
                  {dialect}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopySql}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.85rem', gap: '6px' }}
            >
              {copied ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
              {copied ? 'Kopiert!' : 'SQL Kopieren'}
            </button>
          </div>
        </div>

        <pre style={{
          background: '#0f172a',
          color: '#38bdf8',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          overflowX: 'auto',
          margin: 0,
          border: '1px solid #1e293b'
        }}>
          {generatedSql}
        </pre>
      </div>
    </div>
  );
}
