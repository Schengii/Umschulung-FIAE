import React, { useState, useEffect } from 'react';

import { Database, Play, Download, Table, HardDrive, Award, AlertTriangle, Code2 } from 'lucide-react';
import { SqlSandboxInstance } from '../../utils/sqlSandboxEngine';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function SqliteWasmStudioLab() {
  const { awardXP } = useStore();
  const [sandbox, setSandbox] = useState(null);
  const [schema, setSchema] = useState({});
  const [queryInput, setQueryInput] = useState(`SELECT c.name, c.city, o.id AS order_id, o.total_amount, o.status
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
ORDER BY o.total_amount DESC;`);
  
  const [queryResult, setQueryResult] = useState(null);
  const [activePreset, setActivePreset] = useState('ecommerce');
  const [xpClaimed, setXpClaimed] = useState(false);

  useEffect(() => {
    const inst = new SqlSandboxInstance();
    inst.loadSeed('ecommerce');
    setSandbox(inst);
    setSchema(inst.getSchema());

    // Initial query run
    const initialRes = inst.execute(`SELECT c.name, c.city, o.id AS order_id, o.total_amount, o.status
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
ORDER BY o.total_amount DESC;`);
    setQueryResult(initialRes);

    return () => {
      inst.destroy();
    };
  }, []);

  const handleExecute = () => {
    if (!sandbox) return;
    const res = sandbox.execute(queryInput);
    setQueryResult(res);
    setSchema(sandbox.getSchema());
    if (res.success) {
      soundManager.playSFX('success');
      if (!xpClaimed) {
        setXpClaimed(true);
        awardXP(15, 'sql_master');
      }
    } else {
      soundManager.playSFX('error');
    }
  };

  const handleLoadPreset = (presetName) => {
    if (!sandbox) return;
    sandbox.destroy();
    const inst = new SqlSandboxInstance();
    inst.loadSeed(presetName);
    setSandbox(inst);
    setActivePreset(presetName);
    setSchema(inst.getSchema());

    if (presetName === 'ecommerce') {
      const q = `SELECT * FROM customers;`;
      setQueryInput(q);
      setQueryResult(inst.execute(q));
    } else {
      const q = `SELECT * FROM servers WHERE status = 'ONLINE';`;
      setQueryInput(q);
      setQueryResult(inst.execute(q));
    }
    soundManager.playSFX('click');
  };

  const handleExportCsv = () => {
    if (!sandbox || !queryResult || !queryResult.rows) return;
    const csvContent = sandbox.exportToCsv(queryResult.rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sql-result-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    soundManager.playSFX('click');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-cyan-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
                In-Browser Relational SQL Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +100 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Database className="w-8 h-8 text-cyan-400" />
              SQL Relational Database Sandbox
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Führe beliebige SQL-Abfragen (JOINs, Aggregationen, CREATE TABLE, INSERT) direkt im Browser aus mit Schema-Explorer und CSV-Export.
            </p>
          </div>
          <button
            onClick={() => { if (!xpClaimed) { setXpClaimed(true); awardXP(30, 'sql_master'); } }}
            disabled={xpClaimed}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition shadow-lg shrink-0"
          >
            <Award className="w-4 h-4" />
            {xpClaimed ? 'XP gesichert!' : 'SQL XP sichern'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schema Explorer */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              Tabellen-Schema
            </h2>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleLoadPreset('ecommerce')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  activePreset === 'ecommerce' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Shop DB
              </button>
              <button
                onClick={() => handleLoadPreset('it_assets')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  activePreset === 'it_assets' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Server DB
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(schema).map(([tableName, meta]) => (
              <div key={tableName} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-cyan-400" /> {tableName}
                  </span>
                  <span className="text-slate-500 font-mono">{meta.totalRows} Zeilen</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {meta.columns.map((col, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded font-mono text-[11px] border border-slate-800">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Schnellauswahl Beispiel-Queries */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 block font-semibold">Beispiel-Queries:</span>
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <button
                onClick={() => setQueryInput("SELECT city, COUNT(*) AS count FROM customers GROUP BY city;")}
                className="text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition"
              >
                ➔ GROUP BY city
              </button>
              <button
                onClick={() => setQueryInput(`INSERT INTO customers VALUES (5, 'Lisa Meier', 'lisa@it.org', 'Stuttgart', '2026-06-15');`)}
                className="text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-emerald-300 transition"
              >
                ➔ INSERT INTO customers
              </button>
            </div>
          </div>
        </div>

        {/* Query Editor & Result View */}
        <div className="lg:col-span-8 space-y-4">
          {/* SQL Editor Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" /> SQL Abfragefenster
              </span>
              <button
                onClick={handleExecute}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Ausführen (F5)
              </button>
            </div>

            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              rows={5}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-cyan-300 font-mono text-sm leading-relaxed focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Results Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white">Ergebnis-Tabelle</h3>
                {queryResult && queryResult.success && (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/60">
                    {queryResult.rowCount} Zeilen ({queryResult.executionTimeMs} ms)
                  </span>
                )}
              </div>

              {queryResult && queryResult.rows && queryResult.rows.length > 0 && (
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV Export
                </button>
              )}
            </div>

            {/* Error Display */}
            {queryResult && !queryResult.success && (
              <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">SQL Syntax / Runtime Fehler:</span>
                  <span className="font-mono">{queryResult.error}</span>
                </div>
              </div>
            )}

            {/* Table Result */}
            {queryResult && queryResult.success && queryResult.rows && queryResult.rows.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0">
                    <tr>
                      {Object.keys(queryResult.rows[0]).map((header) => (
                        <th key={header} className="p-3 border-b border-slate-800 font-bold uppercase text-cyan-400">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40 text-slate-300">
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} className="p-3 whitespace-nowrap">
                            {val !== null && val !== undefined ? String(val) : <span className="text-slate-600">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : queryResult && queryResult.success ? (
              <div className="p-6 text-center text-slate-500 text-sm font-mono bg-slate-950 rounded-xl border border-slate-800">
                Befehl erfolgreich ausgeführt (0 Zeilen zurückgegeben).
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
