import React, { useState, useMemo } from 'react';
import { chunkDocument, rankChunksWithCrossEncoder } from '../../utils/llmRagChunkingEngine';

const SAMPLE_TEXT = `Modernes Information Retrieval in LLM-Systemen basiert auf Retrieval-Augmented Generation (RAG).
Dokumente werden zunächst in semantisch sinnvolle Chunks unterteilt, in Embeddings transformiert und in einer Vektordatenbank indiziert.

Bei der Chunking-Strategie gibt es gravierende Trade-Offs:
Ein zu kleiner Chunk verliert den semantischen Kontext („Lost in the Middle“).
Ein zu großer Chunk überfordert das Context-Window des LLMs und verdünnt die Vektordichte im Embedding-Raum.

Two-Stage Retrieval kombiniert Geschwindigkeit mit Genauigkeit:
Stage 1 (Bi-Encoder Retrieval): Ein Vektor-Index (z. B. HNSW mit Cosine Similarity) ruft blitzschnell die Top-100 Kandidaten ab. Da Query und Dokument getrennt codiert werden, fehlt die Inter-Token-Attention.
Stage 2 (Cross-Encoder Re-Ranking): Ein vollständiges Transformer-Modell (z. B. bge-reranker-large) bewertet die Query zusammen mit dem Kandidaten-Text mittels voller Self-Attention über alle Token hinweg.

Vermeidung von Halluzinationen:
Re-Ranking verbessert Precision@K signifikant, da irrelevante Treffer mit scheinbar hoher Vektor-Ähnlichkeit herausgefiltert werden, bevor der Prompt für das generative LLM konstruiert wird.`;

export default function LlmRagChunkingLab() {
  const [documentText, setDocumentText] = useState(SAMPLE_TEXT);
  const [strategy, setStrategy] = useState('paragraph');
  const [chunkSize, setChunkSize] = useState(250);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [query, setQuery] = useState('Warum braucht man einen Cross-Encoder Re-Ranker?');

  const chunks = useMemo(() => {
    return chunkDocument(documentText, /** @type {any} */ (strategy), chunkSize, chunkOverlap);
  }, [documentText, strategy, chunkSize, chunkOverlap]);

  const rankedChunks = useMemo(() => {
    return rankChunksWithCrossEncoder(chunks, query);
  }, [chunks, query]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                AI & Information Retrieval
              </span>
              <span className="text-xs text-slate-400">Two-Stage RAG Pipeline</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              LLM RAG Chunking & Cross-Encoder Re-Ranking Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Simuliere Dokument-Chunking-Strategien (Fixed, Sliding Window, Semantic Paragraphs) und vergleiche Bi-Encoder Dense Retrieval mit Cross-Attention Re-Ranking zur Halluzinationsvermeidung.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDocumentText(SAMPLE_TEXT);
                setQuery('Warum braucht man einen Cross-Encoder Re-Ranker?');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Standard-Beispiel laden
            </button>
          </div>
        </div>
      </div>

      {/* Settings & Query Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span>Quelldokument</span>
              <span className="text-xs text-slate-400 font-normal">{documentText.length} Zeichen</span>
            </h2>
            <textarea
              rows={8}
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono resize-y"
              placeholder="Füge hier Dokumententext ein..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">Strategie</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="paragraph">Absatzbasiert (Paragraphs)</option>
                  <option value="sliding">Sliding Window mit Overlap</option>
                  <option value="fixed">Feste Chunkgröße</option>
                </select>
              </div>

              {strategy !== 'paragraph' && (
                <>
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1">Chunk-Größe (Char)</label>
                    <input
                      type="number"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(Number(e.target.value) || 100)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  {strategy === 'sliding' && (
                    <div>
                      <label className="block text-slate-400 text-xs font-medium mb-1">Overlap (Char)</label>
                      <input
                        type="number"
                        value={chunkOverlap}
                        onChange={(e) => setChunkOverlap(Number(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Query Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Suchanfrage (RAG Retrieval Query)</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Gib eine Frage an den RAG-Index ein..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-500">Beispielfragen:</span>
              <button
                onClick={() => setQuery('Was ist der Nachteil zu großer Chunks?')}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Nachteil großer Chunks?
              </button>
              <button
                onClick={() => setQuery('Wie vermeidet man Halluzinationen in RAG?')}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Halluzinationen vermeiden?
              </button>
            </div>
          </div>
        </div>

        {/* Results & Ranked Chunks (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>Ergebnisse: Two-Stage Re-Ranking</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {rankedChunks.length} Chunks generiert
              </span>
            </h2>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {rankedChunks.map((chunk, idx) => {
              const isTop = idx === 0 && (chunk.crossEncoderScore || 0) > 0.4;
              return (
                <div
                  key={chunk.id}
                  className={`p-4 rounded-xl border transition ${
                    isTop
                      ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-900/10'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isTop ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Chunk {chunk.id}</span>
                      {isTop && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/30 text-purple-200">
                          Top Match für Prompt-Injektion
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 mr-1">Bi-Encoder:</span>
                        <span className="text-cyan-400">{((chunk.biEncoderScore || 0) * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-1">Cross-Encoder:</span>
                        <span className="text-purple-400 font-bold">{((chunk.crossEncoderScore || 0) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
                    {chunk.text}
                  </p>
                  
                  <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                    <span>Zeichenbereich: [{chunk.charStart} - {chunk.charEnd}]</span>
                    <span>Länge: {chunk.text.length} Chars</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
