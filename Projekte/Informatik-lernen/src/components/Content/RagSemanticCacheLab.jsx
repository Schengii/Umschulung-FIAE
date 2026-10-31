// @ts-check
import { useState, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Server,
  DollarSign,
  Clock,
  ShieldCheck,
  Search,
  PlusCircle,
  Sliders,
  Database,
  ArrowRight,
} from 'lucide-react';
import {
  calculateCosineSimilarity,
  generateDemoEmbedding,
  querySemanticCache,
  DEFAULT_SEMANTIC_CACHE,
} from '../../utils/ragSemanticCacheEngine';

export default function RagSemanticCacheLab() {
  const [cacheEntries, setCacheEntries] = useState(DEFAULT_SEMANTIC_CACHE);
  const [queryInput, setQueryInput] = useState('Wie erstelle ich ein VLAN auf einem Switch?');
  const [threshold, setThreshold] = useState(0.8);
  const [newPrompt, setNewPrompt] = useState('');
  const [newResponse, setNewResponse] = useState('');

  const evaluation = useMemo(() => {
    return querySemanticCache(queryInput, cacheEntries, threshold);
  }, [queryInput, cacheEntries, threshold]);

  const queryEmbedding = useMemo(() => {
    return generateDemoEmbedding(queryInput);
  }, [queryInput]);

  /**
   * @param {React.FormEvent} e
   */
  const handleAddCacheEntry = (e) => {
    e.preventDefault();
    if (!newPrompt.trim() || !newResponse.trim()) return;

    const newEntry = {
      id: `cache-${Date.now()}`,
      prompt: newPrompt.trim(),
      embedding: generateDemoEmbedding(newPrompt.trim()),
      response: newResponse.trim(),
      tokensSaved: 400,
      latencySavedMs: 1300,
      hits: 1,
    };

    setCacheEntries((prev) => [newEntry, ...prev]);
    setNewPrompt('');
    setNewResponse('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in p-2 sm:p-4">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RAG & LLM Optimization · Semantic Caching</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              RAG Semantic Cache & Vector Similarity Studio
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-3xl">
              Simuliere semantisches Caching für KI- & RAG-Pipelines. Statt teure und langsame LLM-Inferenz bei jeder semantisch ähnlichen Nutzeranfrage neu auszuführen, matched ein Vector Store den Cosine-Threshold und liefert Antworten in wenigen Millisekunden bei null LLM-Tokenkosten.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Simulator & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Query Console & Parameters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/60 shadow-lg space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Nutzer-Prompt (Eingehende Anfrage)
            </h2>

            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-300">Prompt eingeben:</label>
              <textarea
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Beispiel: Wie richte ich ein VLAN auf einem Switch ein?"
              />
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-slate-400">Schnell-Tests:</span>
                <button
                  type="button"
                  onClick={() => setQueryInput('Wie konfiguriere ich ein VLAN auf einem Cisco Switch?')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 transition"
                >
                  VLAN Exact
                </button>
                <button
                  type="button"
                  onClick={() => setQueryInput('Cisco Switch VLAN 10 Port Zuweisung?')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 transition"
                >
                  VLAN Paraphrase
                </button>
                <button
                  type="button"
                  onClick={() => setQueryInput('Erkläre symmetrische Verschlüsselung mit AES')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 transition"
                >
                  AES Krypto
                </button>
                <button
                  type="button"
                  onClick={() => setQueryInput('Wie backe ich vegane Schokoladenmuffins?')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded border border-slate-700 transition"
                >
                  Cache Miss (Off-topic)
                </button>
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  Cosine Similarity Threshold:
                </span>
                <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  {threshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.98"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Höhere Schwellenwerte verringern False Positives (z. B. 0.85–0.90 für strikte Fakten), niedrigere Schwellenwerte erhöhen die Trefferquote (Cache Hit Rate).
              </p>
            </div>
          </div>

          {/* Add custom entry */}
          <form onSubmit={handleAddCacheEntry} className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/60 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Neuen Cache-Eintrag einlernen
            </h3>
            <input
              type="text"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="Referenz-Prompt..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <textarea
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              rows={2}
              placeholder="Antworttext / Tool-Ergebnis..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 rounded-lg transition"
            >
              In Semantic Vector Store indexieren
            </button>
          </form>
        </div>

        {/* Right Column: Execution Pipeline & Similarity Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <div
            className={`rounded-2xl p-6 border shadow-xl transition-all ${
              evaluation.isHit
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-emerald-950/20'
                : 'bg-amber-950/40 border-amber-500/50 shadow-amber-950/20'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    evaluation.isHit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {evaluation.isHit ? <Zap className="w-6 h-6" /> : <Server className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Routing Ergebnis
                  </div>
                  <div className="text-xl font-black text-white">
                    {evaluation.isHit ? 'CACHE HIT (Zero Token Cost)' : 'CACHE MISS (LLM Inference)'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Latenz</div>
                  <div className="text-lg font-bold font-mono text-cyan-300 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {evaluation.latencyMs} ms
                  </div>
                </div>
                {evaluation.isHit && (
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Gesparte Kosten</div>
                    <div className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${evaluation.estimatedCostSavedUsd}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/40 font-mono text-xs text-slate-300 flex items-center gap-2">
              <span className="text-slate-400">Execution Pipeline:</span>
              <span className="font-semibold text-white">{evaluation.executionPath}</span>
            </div>
          </div>

          {/* Response Payload */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/60 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Ausgelieferte Antwort (Payload)
              </span>
              <span className="text-xs font-mono text-slate-400">
                Similarity Score: {(evaluation.similarityScore * 100).toFixed(1)}%
              </span>
            </h3>

            {evaluation.isHit && evaluation.matchedEntry ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm leading-relaxed font-sans">
                  {evaluation.matchedEntry.response}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  Gematchter Original-Prompt im Cache:{' '}
                  <span className="text-cyan-300 italic font-mono">
                    "{evaluation.matchedEntry.prompt}"
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/30 text-amber-200 text-sm leading-relaxed">
                Keine semantisch hinreichende Übereinstimmung im Cache gefunden (Score: {(evaluation.similarityScore * 100).toFixed(1)}% &lt; {(threshold * 100).toFixed(1)}%). Die Anfrage wurde an das LLM (z. B. GPT-4 / Claude / Llama 3) gesendet.
              </div>
            )}
          </div>

          {/* Vector Store Comparison Table */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/60 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Vector Index Einträge & Cosine Scores
            </h3>

            <div className="space-y-3">
              {cacheEntries.map((entry) => {
                const sim = calculateCosineSimilarity(queryEmbedding, entry.embedding);
                const isWinner = entry.id === evaluation.matchedEntry?.id && evaluation.isHit;

                return (
                  <div
                    key={entry.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isWinner
                        ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="font-medium text-white flex items-center gap-2">
                        {isWinner && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
                            ACTIVE HIT
                          </span>
                        )}
                        <span>{entry.prompt}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-400">Cosine:</span>
                        <span
                          className={`font-bold ${
                            sim >= threshold ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {sim.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
