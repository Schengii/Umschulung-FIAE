import React, { useState } from 'react';

import { GitMerge, GitBranch, GitCommit, CheckCircle2, RotateCcw, Code2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  GIT_CONFLICT_SCENARIOS, 
  generateConflictMarkers, 
  hasConflictMarkers, 
  resolveConflictAction 
} from '../../utils/gitConflictEngine';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function GitMergeConflictLab() {
  const { awardXP } = useStore();
  const [selectedScenarioId, setSelectedScenarioId] = useState(GIT_CONFLICT_SCENARIOS[0].id);
  const scenario = GIT_CONFLICT_SCENARIOS.find(s => s.id === selectedScenarioId) || GIT_CONFLICT_SCENARIOS[0];

  const [editorCode, setEditorCode] = useState(() => 
    generateConflictMarkers(scenario.currentCode, scenario.incomingCode, scenario.branchCurrent, scenario.branchIncoming)
  );

  const [mergeStatus, setMergeStatus] = useState('conflict'); // 'conflict' | 'resolved' | 'committed'

  const handleSelectScenario = (scId) => {
    const sc = GIT_CONFLICT_SCENARIOS.find(s => s.id === scId);
    if (sc) {
      setSelectedScenarioId(sc.id);
      setEditorCode(generateConflictMarkers(sc.currentCode, sc.incomingCode, sc.branchCurrent, sc.branchIncoming));
      setMergeStatus('conflict');
      soundManager.playSFX('click');
    }
  };

  const handleQuickAction = (action) => {
    const resolved = resolveConflictAction(action, scenario.currentCode, scenario.incomingCode);
    setEditorCode(resolved);
    setMergeStatus('resolved');
    soundManager.playSFX('success');
  };

  const handleReset = () => {
    setEditorCode(generateConflictMarkers(scenario.currentCode, scenario.incomingCode, scenario.branchCurrent, scenario.branchIncoming));
    setMergeStatus('conflict');
    soundManager.playSFX('click');
  };

  const handleCommitMerge = () => {
    if (hasConflictMarkers(editorCode)) {
      setMergeStatus('conflict');
      soundManager.playSFX('error');
      return;
    }
    if (mergeStatus === 'committed') return;

    setMergeStatus('committed');
    soundManager.playSFX('levelUp');
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    awardXP(50, 'git_merge_master');
  };

  const stillHasConflict = hasConflictMarkers(editorCode);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-950 via-amber-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-orange-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/30 text-orange-200 border border-orange-400/30">
                Git 3-Way Merge Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +50 XP pro gelösten Konflikt
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <GitMerge className="w-8 h-8 text-orange-400" />
              Git Merge-Conflict Resolver
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Verstehe und löse reale Merge-Konflikte zwischen Branches interaktiv auf (Accept Current vs. Incoming vs. Both vs. Manual Edit).
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GIT_CONFLICT_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleSelectScenario(sc.id)}
            className={`p-4 rounded-xl border text-left transition ${
              selectedScenarioId === sc.id
                ? 'bg-orange-950/80 border-orange-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-orange-400 font-bold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" /> {sc.fileName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {sc.branchCurrent} ⟵ {sc.branchIncoming}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{sc.description}</p>
          </button>
        ))}
      </div>

      {/* 3-Way Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Branch (HEAD) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-cyan-400 flex items-center gap-1">
              <GitCommit className="w-4 h-4" /> Current Change ({scenario.branchCurrent} / HEAD)
            </span>
            <button
              onClick={() => handleQuickAction('accept_current')}
              className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded text-[11px] font-bold transition"
            >
              Accept Current
            </button>
          </div>
          <pre className="p-3 bg-slate-950 rounded-lg text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800">
            {scenario.currentCode}
          </pre>
        </div>

        {/* Incoming Branch */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <GitBranch className="w-4 h-4" /> Incoming Change ({scenario.branchIncoming})
            </span>
            <button
              onClick={() => handleQuickAction('accept_incoming')}
              className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded text-[11px] font-bold transition"
            >
              Accept Incoming
            </button>
          </div>
          <pre className="p-3 bg-slate-950 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
            {scenario.incomingCode}
          </pre>
        </div>
      </div>

      {/* Conflict Editor & Merger Workspace */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-bold text-white font-mono">{scenario.fileName} (Merging)</span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
              stillHasConflict
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {stillHasConflict ? '⚠️ Konflikt ungelöst' : '✓ Konflikt aufgelöst'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAction('accept_both')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition"
            >
              Accept Both
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={handleCommitMerge}
              disabled={stillHasConflict || mergeStatus === 'committed'}
              className={`px-5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg ${
                stillHasConflict || mergeStatus === 'committed'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              {mergeStatus === 'committed' ? 'Merge abgeschlossen!' : 'git commit (Merge abschließen)'}
            </button>
          </div>
        </div>

        {/* Live Merge Editor */}
        <textarea
          value={editorCode}
          onChange={(e) => setEditorCode(e.target.value)}
          rows={10}
          className={`w-full bg-slate-950 border rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none ${
            stillHasConflict ? 'border-rose-700/80 text-rose-200' : 'border-emerald-600/80 text-emerald-200'
          }`}
        />

        {/* Feedback Banner */}
        {mergeStatus === 'committed' && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold">Merge Commit erfolgreich erstellt! Der Konflikt wurde sauber in {scenario.fileName} gelöst.</span>
            </div>
            <span className="font-bold text-amber-300">+50 XP erhalten!</span>
          </div>
        )}
      </div>
    </div>
  );
}
