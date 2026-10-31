import React, { useState } from 'react';
import { 
  GraduationCap, CheckCircle, ShieldAlert, Award, 
  Calculator, Clock
} from 'lucide-react';
import { 
  MEP_QUESTION_CATALOG, 
  calculateMepCombinedScore, 
  calculateRequiredMepScore 
} from '../../utils/ihkMepEngine';

export default function IhkMepSimulatorLab({ onAwardXP }) {
  const [selectedArea, setSelectedArea] = useState('wiso');
  const [writtenScore, setWrittenScore] = useState(38);
  const [mepScoreInput, setMepScoreInput] = useState(74);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [hasClaimedXp, setHasClaimedXp] = useState(false);

  const currentQuestions = MEP_QUESTION_CATALOG[selectedArea] || MEP_QUESTION_CATALOG.wiso;
  const currentQuestion = currentQuestions[activeQuestionIdx] || currentQuestions[0];
  const mepRequirement = calculateRequiredMepScore(writtenScore, 50);
  const finalResult = calculateMepCombinedScore(writtenScore, mepScoreInput);

  const handleToggleAnswer = (id) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleClaimXp = () => {
    if (!hasClaimedXp && finalResult.isPassed) {
      setHasClaimedXp(true);
      if (onAwardXP) {
        onAwardXP(60, 'ihk_mep_survivor');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>IHK Notfall-Rettungsanker (AO 2020 & BBiG)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              IHK Mündliche Ergänzungsprüfung (MEP) Simulator
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl text-sm">
              Simulation und Notenberechnung für die 15-minütige mündliche Ergänzungsprüfung,
              wenn ein schriftlicher Prüfungsbereich mit Note 5 (30–49 Punkte) bewertet wurde.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-mono">
              Gewichtung 2 : 1 (Schriftlich : Mündlich)
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Prüfungsbereich & Notenrechner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prüfungsbereich */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-rose-400" />
            1. Gefährdeten Prüfungsbereich auswählen:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setSelectedArea('wiso'); setActiveQuestionIdx(0); }}
              className={`p-3 rounded-lg border text-xs text-left transition ${
                selectedArea === 'wiso'
                  ? 'bg-rose-600/30 border-rose-500 text-white font-bold'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold text-sm mb-0.5">WiSo</div>
              <div className="text-[10px] text-slate-400">Bereich 3</div>
            </button>
            <button
              onClick={() => { setSelectedArea('ap2_b1'); setActiveQuestionIdx(0); }}
              className={`p-3 rounded-lg border text-xs text-left transition ${
                selectedArea === 'ap2_b1'
                  ? 'bg-rose-600/30 border-rose-500 text-white font-bold'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold text-sm mb-0.5">AP2 Bereich 1</div>
              <div className="text-[10px] text-slate-400">Planung & Konzept</div>
            </button>
            <button
              onClick={() => { setSelectedArea('ap2_b2'); setActiveQuestionIdx(0); }}
              className={`p-3 rounded-lg border text-xs text-left transition ${
                selectedArea === 'ap2_b2'
                  ? 'bg-rose-600/30 border-rose-500 text-white font-bold'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold text-sm mb-0.5">AP2 Bereich 2</div>
              <div className="text-[10px] text-slate-400">Fachaufgabe</div>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">Schriftliches Ergebnis:</span>
              <span className="font-mono text-rose-400 font-bold">{writtenScore} Punkte (Note 5)</span>
            </div>
            <input
              type="range"
              min="30"
              max="49"
              value={writtenScore}
              onChange={e => setWrittenScore(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="text-xs text-slate-400">
              {mepRequirement.isAchievable ? (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>MEP möglich: Du benötigst mindestens <strong>{mepRequirement.minRequiredMep} Punkte</strong> in der MEP zum Bestehen.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Mathematisch nicht mehr auf Note 4 ausgleichbar.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MEP Ergebnisrechner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            2. Erreichte MEP-Prüfungspunkte simulieren:
          </label>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">MEP-Prüfungsleistung (0–100):</span>
              <span className="font-mono text-emerald-300 font-bold">{mepScoreInput} Punkte</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={mepScoreInput}
              onChange={e => setMepScoreInput(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Berechnungsformel:</span>
                <span className="font-mono text-slate-300">(2 × {writtenScore} + 1 × {mepScoreInput}) ÷ 3</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-800">
                <span className="text-slate-200">Neues Gesamtergebnis:</span>
                <span className={finalResult.isPassed ? 'text-emerald-400' : 'text-rose-400'}>
                  {finalResult.combinedPoints} Punkte – {finalResult.gradeLabel}
                </span>
              </div>
            </div>
            <div className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
              finalResult.isPassed ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
            }`}>
              <span>{finalResult.isPassed ? '✓ Bereich erfolgreich auf Note 4 gerettet!' : '✗ Noch nicht bestanden (< 50 Punkte)'}</span>
              {finalResult.isPassed && (
                <button
                  onClick={handleClaimXp}
                  disabled={hasClaimedXp}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs"
                >
                  {hasClaimedXp ? 'XP Erhalten' : '+60 XP einlösen'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interaktiver Fragenkatalog für die 15-Minuten MEP */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              Typische IHK-Prüfungsfragen ({currentQuestions.length} Fragen verfügbar)
            </h2>
          </div>
          <div className="flex gap-2">
            {currentQuestions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQuestionIdx(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold font-mono transition ${
                  activeQuestionIdx === idx
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="text-xs uppercase font-semibold text-rose-400 mb-1">
              Thema: {currentQuestion.topic}
            </div>
            <div className="text-base font-medium text-slate-100 mb-4">
              "{currentQuestion.question}"
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-xs text-slate-400 self-center mr-1">Erwartete Schlüsselbegriffe:</span>
              {currentQuestion.keywords.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-indigo-300">
                  {kw}
                </span>
              ))}
            </div>

            <button
              onClick={() => handleToggleAnswer(currentQuestion.id)}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition"
            >
              {revealedAnswers[currentQuestion.id] ? 'Musterantwort ausblenden' : 'Musterantwort der Prüfer anzeigen'}
            </button>

            {revealedAnswers[currentQuestion.id] && (
              <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-emerald-500/40 text-xs text-emerald-200 space-y-1">
                <div className="font-bold text-emerald-300">IHK-Musterantwort:</div>
                <p className="leading-relaxed">{currentQuestion.modelAnswer}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
