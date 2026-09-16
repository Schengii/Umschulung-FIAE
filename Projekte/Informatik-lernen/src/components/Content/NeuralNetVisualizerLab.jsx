import React, { useState } from 'react';

import { Brain, Award, Layers, Sliders, Hash } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function NeuralNetVisualizerLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('neural_net');
  const [xpClaimed, setXpClaimed] = useState(false);

  // Neural Net State
  const [inputX1, setInputX1] = useState(0.8);
  const [inputX2, setInputX2] = useState(0.4);
  const [activationFn, setActivationFn] = useState('relu'); // 'relu', 'sigmoid', 'tanh'

  const [weights, setWeights] = useState({
    w11: 0.5, w12: -0.2, b1: 0.1,
    w21: -0.4, w22: 0.9, b2: -0.2,
    wo1: 0.7, wo2: 0.3, bo: 0.0
  });

  const activate = (z, fn) => {
    if (fn === 'relu') return Math.max(0, z);
    if (fn === 'sigmoid') return 1 / (1 + Math.exp(-z));
    if (fn === 'tanh') return Math.tanh(z);
    return z;
  };

  // Hidden Layer Forward Pass
  const z1 = inputX1 * weights.w11 + inputX2 * weights.w12 + weights.b1;
  const a1 = activate(z1, activationFn);

  const z2 = inputX1 * weights.w21 + inputX2 * weights.w22 + weights.b2;
  const a2 = activate(z2, activationFn);

  // Output Layer Forward Pass
  const zo = a1 * weights.wo1 + a2 * weights.wo2 + weights.bo;
  const ao = activate(zo, 'sigmoid'); // Output probability

  // BPE Tokenizer State
  const [bpeText, setBpeText] = useState('low lower lowest newer newest');
  const [bpeSteps, setBpeSteps] = useState(0);

  const computeBpe = (text, steps) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    let vocab = {};
    words.forEach(w => {
      const splitWord = w.split('').join(' ') + ' </w>';
      vocab[splitWord] = (vocab[splitWord] || 0) + 1;
    });

    const mergeHistory = [];
    let currentVocab = { ...vocab };

    for (let s = 0; s < steps; s++) {
      // Find most frequent pair
      const pairs = {};
      Object.entries(currentVocab).forEach(([word, freq]) => {
        const symbols = word.split(' ');
        for (let i = 0; i < symbols.length - 1; i++) {
          const pair = `${symbols[i]} ${symbols[i + 1]}`;
          pairs[pair] = (pairs[pair] || 0) + freq;
        }
      });

      if (Object.keys(pairs).length === 0) break;
      const bestPair = Object.keys(pairs).reduce((a, b) => pairs[a] > pairs[b] ? a : b);
      mergeHistory.push({ pair: bestPair, count: pairs[bestPair] });

      // Apply merge
      const newVocab = {};
      const targetRegex = new RegExp(bestPair.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const replacement = bestPair.replace(' ', '');

      Object.entries(currentVocab).forEach(([word, freq]) => {
        const newWord = word.replace(targetRegex, replacement);
        newVocab[newWord] = freq;
      });
      currentVocab = newVocab;
    }

    return { currentVocab, mergeHistory };
  };

  const bpeResult = computeBpe(bpeText, bpeSteps);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-purple-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                Deep Learning & LLM Tokenizer Lab
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +100 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              Neural Network & BPE Tokenizer Studio
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Verstehe Forward-Propagation mit interaktiven Gewichten und Aktivierungsfunktionen sowie den Byte-Pair Encoding (BPE) Algorithmus moderner Sprachmodelle (GPT/Claude).
            </p>
          </div>
          <button
            onClick={() => { if (!xpClaimed) { setXpClaimed(true); awardXP(30, 'ai_pioneer'); } }}
            disabled={xpClaimed}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition shadow-lg shrink-0"
          >
            <Award className="w-4 h-4" />
            {xpClaimed ? 'XP gesichert!' : 'AI XP sichern'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('neural_net')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'neural_net'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          Neuronales Netz (Forward-Propagation)
        </button>
        <button
          onClick={() => setActiveTab('bpe_tokenizer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'bpe_tokenizer'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Hash className="w-4 h-4" />
          BPE Tokenizer Algorithmus
        </button>
      </div>

      {/* Tab 1: Neural Network */}
      {activeTab === 'neural_net' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              Inputs & Hyperparameter
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Aktivierungsfunktion Hidden Layer:</label>
                <div className="flex gap-2">
                  {['relu', 'sigmoid', 'tanh'].map((fn) => (
                    <button
                      key={fn}
                      onClick={() => setActivationFn(fn)}
                      className={`flex-1 py-1.5 rounded-lg font-mono text-xs uppercase font-bold transition ${
                        activationFn === fn
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {fn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Input x₁: {inputX1}</label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={inputX1}
                    onChange={(e) => setInputX1(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Input x₂: {inputX2}</label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={inputX2}
                    onChange={(e) => setInputX2(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <span className="font-bold text-slate-300 block">Gewichte (Weights):</span>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div>
                    <span className="text-slate-400 block">w₁₁: {weights.w11}</span>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={weights.w11}
                      onChange={(e) => setWeights({ ...weights, w11: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">w₁₂: {weights.w12}</span>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={weights.w12}
                      onChange={(e) => setWeights({ ...weights, w12: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">b₁: {weights.b1}</span>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.1"
                      value={weights.b1}
                      onChange={(e) => setWeights({ ...weights, b1: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white">Netzwerk-Architektur & Aktivierung</h2>

            {/* Visualisierung der Schichten */}
            <div className="grid grid-cols-3 gap-4 text-center items-center py-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              {/* Input Layer */}
              <div className="space-y-4">
                <span className="text-xs text-slate-400 font-bold block">Input Layer</span>
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-900/60 border-2 border-blue-500 flex flex-col items-center justify-center font-mono">
                  <span className="text-[10px] text-blue-300">x₁</span>
                  <span className="font-bold text-white text-xs">{inputX1}</span>
                </div>
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-900/60 border-2 border-blue-500 flex flex-col items-center justify-center font-mono">
                  <span className="text-[10px] text-blue-300">x₂</span>
                  <span className="font-bold text-white text-xs">{inputX2}</span>
                </div>
              </div>

              {/* Hidden Layer */}
              <div className="space-y-4">
                <span className="text-xs text-purple-300 font-bold block">Hidden ({activationFn})</span>
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-900/60 border-2 border-purple-500 flex flex-col items-center justify-center font-mono">
                  <span className="text-[10px] text-purple-300">h₁ (a₁)</span>
                  <span className="font-bold text-white text-xs">{a1.toFixed(2)}</span>
                </div>
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-900/60 border-2 border-purple-500 flex flex-col items-center justify-center font-mono">
                  <span className="text-[10px] text-purple-300">h₂ (a₂)</span>
                  <span className="font-bold text-white text-xs">{a2.toFixed(2)}</span>
                </div>
              </div>

              {/* Output Layer */}
              <div className="space-y-4">
                <span className="text-xs text-emerald-400 font-bold block">Output (Sigmoid)</span>
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-900/60 border-2 border-emerald-500 flex flex-col items-center justify-center font-mono shadow-lg shadow-emerald-950">
                  <span className="text-[10px] text-emerald-300">y (Score)</span>
                  <span className="font-bold text-emerald-200 text-sm">{(ao * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">Mathematische Formel (Forward Pass):</span>
              <div className="font-mono text-purple-300">
                z₁ = ({inputX1} × {weights.w11}) + ({inputX2} × {weights.w12}) + {weights.b1} = {z1.toFixed(2)}
              </div>
              <div className="font-mono text-emerald-300">
                a₁ = {activationFn}({z1.toFixed(2)}) = {a1.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: BPE Tokenizer */}
      {activeTab === 'bpe_tokenizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-purple-400" />
              BPE Korpus eingeben
            </h2>

            <div className="space-y-3">
              <label className="text-xs text-slate-300 block">Trainings-Text:</label>
              <input
                type="text"
                value={bpeText}
                onChange={(e) => setBpeText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm"
              />

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  BPE Merge-Schritte: <span className="font-bold text-purple-400">{bpeSteps}</span>
                </label>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setBpeSteps(Math.max(0, bpeSteps - 1))}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300"
                  >
                    - 1
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={bpeSteps}
                    onChange={(e) => setBpeSteps(Number(e.target.value))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setBpeSteps(bpeSteps + 1)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold text-white"
                  >
                    + 1
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Vokabular & Merges</h2>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs text-slate-400 block font-semibold">Aktuelle Token-Segmentierung im Korpus:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(bpeResult.currentVocab).map(([word, count], i) => (
                  <div key={i} className="px-3 py-1.5 bg-slate-900 border border-purple-700/50 rounded-lg font-mono text-sm text-purple-200">
                    {word.split(' ').map((tok, ti) => (
                      <span key={ti} className="bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800/60 mr-1 text-xs text-cyan-300">
                        {tok}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-500 ml-1">×{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-white block">Ausgeführte BPE Merges:</span>
              {bpeResult.mergeHistory.length === 0 ? (
                <span className="text-slate-500">Noch keine Merges ausgeführt (Initialzustand: Einzelbuchstaben).</span>
              ) : (
                <div className="space-y-1">
                  {bpeResult.mergeHistory.map((m, idx) => (
                    <div key={idx} className="flex justify-between font-mono bg-slate-900 p-2 rounded border border-slate-800">
                      <span>Schritt {idx + 1}: Merge ('{m.pair}') ➔ '{m.pair.replace(' ', '')}'</span>
                      <span className="text-emerald-400 font-bold">Häufigkeit: {m.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
