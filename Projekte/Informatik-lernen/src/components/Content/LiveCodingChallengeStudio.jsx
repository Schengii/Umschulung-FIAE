import React, { useState } from 'react';

import { Code2, Play, CheckCircle2, XCircle, RotateCcw, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CODING_CHALLENGES, 
  runChallengeCode 
} from '../../utils/codingChallengesEngine';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function LiveCodingChallengeStudio() {
  const { awardXP } = useStore();
  const [selectedChallengeId, setSelectedChallengeId] = useState(CODING_CHALLENGES[0].id);
  const currentChallenge = CODING_CHALLENGES.find(c => c.id === selectedChallengeId) || CODING_CHALLENGES[0];

  const [userCode, setUserCode] = useState(currentChallenge.starterCode);
  const [testRunResult, setTestRunResult] = useState(null);
  const [solvedChallengeIds, setSolvedChallengeIds] = useState([]);

  const handleSelectChallenge = (cId) => {
    const ch = CODING_CHALLENGES.find(c => c.id === cId);
    if (ch) {
      setSelectedChallengeId(ch.id);
      setUserCode(ch.starterCode);
      setTestRunResult(null);
      soundManager.playSFX('click');
    }
  };

  const handleRunCode = () => {
    const res = runChallengeCode(userCode, currentChallenge.id);
    setTestRunResult(res);

    if (res.success && res.allPassed) {
      soundManager.playSFX('levelUp');
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      if (!solvedChallengeIds.includes(currentChallenge.id)) {
        setSolvedChallengeIds(prev => [...prev, currentChallenge.id]);
        awardXP(50, 'code_challenge_master');
      }
    } else {
      soundManager.playSFX('error');
    }
  };

  const handleResetCode = () => {
    setUserCode(currentChallenge.starterCode);
    setTestRunResult(null);
    soundManager.playSFX('click');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-violet-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/30 text-violet-200 border border-violet-400/30">
                LeetCode &amp; Exercism Style Arena
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +50 XP pro gelöste Challenge
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Code2 className="w-8 h-8 text-violet-400" />
              Live Coding Challenge Studio
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Löse Programmieraufgaben im Browser mit sofortiger automatischer Test-Suite und Ausführungszeit-Messung.
            </p>
          </div>
        </div>
      </div>

      {/* Challenge Picker Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CODING_CHALLENGES.map((ch) => (
          <button
            key={ch.id}
            onClick={() => handleSelectChallenge(ch.id)}
            className={`p-3.5 rounded-xl border text-left transition ${
              selectedChallengeId === ch.id
                ? 'bg-violet-950/80 border-violet-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-violet-400 uppercase">{ch.category}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{ch.difficulty}</span>
            </div>
            <div className="font-bold text-sm">{ch.title}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Task Description & Test Cases */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white">{currentChallenge.title}</h2>
            <span className="text-xs px-2.5 py-1 rounded bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
              {currentChallenge.difficulty}
            </span>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            {currentChallenge.description}
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Beispiel-Testfälle:
            </span>
            <div className="space-y-2 font-mono text-xs">
              {currentChallenge.testCases.map((tc, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                  <div className="text-slate-400">Input: <span className="text-cyan-300">{JSON.stringify(tc.input)}</span></div>
                  <div className="text-slate-400">Expected: <span className="text-emerald-400 font-bold">{JSON.stringify(tc.expected)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Editor & Test Results */}
        <div className="lg:col-span-7 space-y-4">
          {/* Code Editor Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-violet-400" /> JavaScript Lösung
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleResetCode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  onClick={handleRunCode}
                  className="px-5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Code Testen
                </button>
              </div>
            </div>

            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              rows={9}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-violet-200 font-mono text-sm leading-relaxed focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Test Runner Feedback */}
          {testRunResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Testergebnisse</h3>
                {testRunResult.success && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    testRunResult.allPassed
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-rose-950 text-rose-300 border border-rose-700'
                  }`}>
                    {testRunResult.allPassed ? '✓ ALLE TESTFÄLLE BESTANDEN' : '✗ EINIGE TESTS FEHLGESCHLAGEN'}
                  </span>
                )}
              </div>

              {testRunResult.error ? (
                <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs font-mono">
                  {testRunResult.error}
                </div>
              ) : (
                <div className="space-y-2">
                  {testRunResult.testResults.map((tr) => (
                    <div
                      key={tr.testCaseIndex}
                      className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                        tr.passed
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                          : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-1.5">
                          {tr.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                          Testfall #{tr.testCaseIndex} ({tr.elapsedMs} ms)
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Expected: {JSON.stringify(tr.expected)} | Actual: {JSON.stringify(tr.actual)}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tr.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {tr.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
