import React, { useState } from 'react';

import { Play, Layers, Award, Code2, Database } from 'lucide-react';
import { 
  SAMPLE_GRAPHQL_QUERIES, 
  executeGraphQLQuery 
} from '../../utils/graphqlSandboxEngine';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function GraphqlExplorerStudioLab() {
  const { awardXP } = useStore();

  const [selectedPresetId, setSelectedPresetId] = useState(SAMPLE_GRAPHQL_QUERIES[0].id);
  const [queryString, setQueryString] = useState(SAMPLE_GRAPHQL_QUERIES[0].query);
  const [queryResult, setQueryResult] = useState(() => executeGraphQLQuery(SAMPLE_GRAPHQL_QUERIES[0].query));
  const [xpClaimed, setXpClaimed] = useState(false);

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setQueryString(preset.query);
    const res = executeGraphQLQuery(preset.query);
    setQueryResult(res);
    soundManager.playSFX('click');
  };

  const handleRunQuery = () => {
    const res = executeGraphQLQuery(queryString);
    setQueryResult(res);
    if (res.success) {
      soundManager.playSFX('success');
      if (!xpClaimed) {
        setXpClaimed(true);
        awardXP(35, 'graphql_explorer_master');
      }
    } else {
      soundManager.playSFX('error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-950 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-violet-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/30 text-violet-200 border border-violet-400/30">
                API Architecture &amp; Type System
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +35 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Layers className="w-8 h-8 text-violet-400" />
              GraphQL Schema &amp; Query Explorer
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Führe GraphQL Queries live im Browser aus, inspiziere den generierten Abstract Syntax Tree (AST) und teste deklarative Datenabfragen.
            </p>
          </div>

          <button
            onClick={() => { if (!xpClaimed) { setXpClaimed(true); awardXP(35, 'graphql_explorer_master'); } }}
            disabled={xpClaimed}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shrink-0"
          >
            <Award className="w-4 h-4" /> {xpClaimed ? 'XP gesichert!' : 'GraphQL XP'}
          </button>
        </div>
      </div>

      {/* Preset Query Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SAMPLE_GRAPHQL_QUERIES.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPreset(p)}
            className={`p-3 rounded-xl border text-left text-xs transition ${
              selectedPresetId === p.id
                ? 'bg-violet-950/80 border-violet-500 text-white font-bold shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] text-violet-400 font-mono block mb-1">Query Preset</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Editor & Response Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Query Input */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-violet-400" />
              GraphQL Query Editor
            </h2>
            <button
              onClick={handleRunQuery}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Query Ausführen
            </button>
          </div>

          <textarea
            value={queryString}
            onChange={(e) => setQueryString(e.target.value)}
            rows={12}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-violet-300 font-mono text-xs focus:border-violet-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* JSON Response & AST Inspector */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              JSON Response &amp; AST
            </h2>
            {queryResult?.executionTimeMs && (
              <span className="text-xs font-mono text-slate-400">
                {queryResult.executionTimeMs} ms
              </span>
            )}
          </div>

          {queryResult?.success ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Server Antwort (Data):
                </span>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 font-mono text-xs overflow-x-auto max-h-48">
                  {JSON.stringify(queryResult.data, null, 2)}
                </pre>
              </div>

              {queryResult.ast && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    Abstract Syntax Tree (AST):
                  </span>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-violet-300 font-mono text-[11px] overflow-x-auto max-h-36">
                    {JSON.stringify(queryResult.ast, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs font-mono">
              <strong>Query Fehler:</strong> {queryResult?.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
