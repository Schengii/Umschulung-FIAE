import React, { useState, useEffect } from 'react';

import { PlusCircle, Save, Trash2, Download, Upload, CheckCircle2, AlertCircle, Play, Code2, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getStoredCustomChallenges, 
  saveCustomChallenge, 
  deleteCustomChallenge, 
  validateChallengeStructure,
  exportChallengesToJson,
  importChallengesFromJson
} from '../../utils/customChallengesManager';

import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function CustomChallengeCreatorLab() {
  const { awardXP } = useStore();
  const [customList, setCustomList] = useState([]);
  
  // Editor Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Algorithmen & Logik');
  const [difficulty, setDifficulty] = useState('Medium');
  const [description, setDescription] = useState('');
  const [starterCode, setStarterCode] = useState(`function solve(input) {\n  // Dein Code hier\n  return input;\n}`);
  const [solutionCode, setSolutionCode] = useState(`function solve(input) {\n  return input;\n}`);
  
  // Test Cases List
  const [testCases, setTestCases] = useState([
    { inputStr: '["test"]', expectedStr: '"test"' }
  ]);

  const [validationErrors, setValidationErrors] = useState([]);
  const [testRunFeedback, setTestRunFeedback] = useState(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    setCustomList(getStoredCustomChallenges());
  }, []);

  const handleAddTestCase = () => {
    setTestCases(prev => [...prev, { inputStr: '[]', expectedStr: '""' }]);
  };

  const handleRemoveTestCase = (idx) => {
    setTestCases(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateTestCase = (idx, field, value) => {
    setTestCases(prev => prev.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc));
  };

  const parseTestCases = () => {
    const parsed = [];
    for (let i = 0; i < testCases.length; i++) {
      try {
        const inp = JSON.parse(testCases[i].inputStr);
        const exp = JSON.parse(testCases[i].expectedStr);
        parsed.push({ input: Array.isArray(inp) ? inp : [inp], expected: exp });
      } catch (err) {
        throw new Error(`Testfall #${i + 1} enthält ungültiges JSON: ${err.message}`);
      }
    }
    return parsed;
  };

  const handleTestSolution = () => {
    setValidationErrors([]);
    setTestRunFeedback(null);

    let parsedTC = [];
    try {
      parsedTC = parseTestCases();
    } catch (err) {
      setValidationErrors([err.message]);
      soundManager.playSFX('error');
      return;
    }

    const tempChallenge = {
      id: 'temp_validation',
      title: title || 'Validierung',
      description,
      starterCode,
      testCases: parsedTC
    };

    const validation = validateChallengeStructure(tempChallenge);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      soundManager.playSFX('error');
      return;
    }

    // Run against solutionCode
    try {
      const userFunc = new Function(`${solutionCode}; if (typeof solve === 'function') return solve; throw new Error('Funktion solve() fehlt.');`)();
      const results = [];
      let allOk = true;

      for (let i = 0; i < parsedTC.length; i++) {
        const tc = parsedTC[i];
        const res = userFunc(...tc.input);
        const passed = JSON.stringify(res) === JSON.stringify(tc.expected);
        if (!passed) allOk = false;
        results.push({ testIndex: i + 1, passed, actual: res, expected: tc.expected });
      }

      setTestRunFeedback({ success: true, allOk, results });
      if (allOk) {
        soundManager.playSFX('success');
      } else {
        soundManager.playSFX('error');
      }
    } catch (codeErr) {
      setTestRunFeedback({ success: false, error: codeErr.message });
      soundManager.playSFX('error');
    }
  };

  const handleSave = () => {
    let parsedTC = [];
    try {
      parsedTC = parseTestCases();
    } catch (err) {
      setValidationErrors([err.message]);
      return;
    }

    const challengeObj = {
      id: `custom_${Date.now()}`,
      title,
      category,
      difficulty,
      description,
      starterCode,
      solutionCode,
      testCases: parsedTC,
      createdAt: new Date().toISOString()
    };

    const validation = validateChallengeStructure(challengeObj);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      soundManager.playSFX('error');
      return;
    }

    const res = saveCustomChallenge(challengeObj);
    if (res.success) {
      setCustomList(res.all);
      soundManager.playSFX('levelUp');
      confetti({ particleCount: 80, spread: 60 });
      awardXP(40, 'challenge_creator');
      // Reset
      setTitle('');
      setDescription('');
    }
  };

  const handleDelete = (cId) => {
    const res = deleteCustomChallenge(cId);
    if (res.success) {
      setCustomList(res.all);
      soundManager.playSFX('click');
    }
  };

  const handleExportAll = () => {
    const json = exportChallengesToJson(customList);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-challenges-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundManager.playSFX('click');
  };

  const handleImportSubmit = () => {
    const res = importChallengesFromJson(importJsonText);
    if (res.success) {
      res.validList.forEach(c => saveCustomChallenge(c));
      setCustomList(getStoredCustomChallenges());
      setShowImportModal(false);
      setImportJsonText('');
      soundManager.playSFX('success');
    } else {
      setValidationErrors([res.error]);
      soundManager.playSFX('error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Community &amp; Dozenten Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
                +40 XP pro erstellte Challenge
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <PlusCircle className="w-8 h-8 text-emerald-400" />
              Custom Coding Challenge Creator
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Erstelle eigene Code-Aufgaben mit automatisierten Testfällen, exportiere sie für Azubis oder importiere Aufgaben-Kataloge.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Upload className="w-4 h-4" /> JSON Import
            </button>
            {customList.length > 0 && (
              <button
                onClick={handleExportAll}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" /> Export ({customList.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editor & Creator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Challenge Config Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            1. Aufgaben-Stammdaten &amp; Beschreibung
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Titel der Challenge:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Z.B. Array Element Filter"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Kategorie:</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Schwierigkeit:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Aufgabenstellung (Markdown unterstützt):</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Beschreibe präzise, was die Funktion leisten soll..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs leading-relaxed focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Starter-Code (Vorgabe für Nutzer):</label>
              <textarea
                value={starterCode}
                onChange={(e) => setStarterCode(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-emerald-300 font-mono text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Test Cases & Musterlösung */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              2. Musterlösung &amp; Testfälle
            </h2>
            <button
              onClick={handleAddTestCase}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-lg transition"
            >
              + Testfall
            </button>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">Musterlösung (zum Validieren):</label>
            <textarea
              value={solutionCode}
              onChange={(e) => setSolutionCode(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-cyan-300 font-mono text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Test Case Inputs */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {testCases.map((tc, idx) => (
              <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Testfall #{idx + 1}</span>
                  {testCases.length > 1 && (
                    <button onClick={() => handleRemoveTestCase(idx)} className="text-rose-400 hover:text-rose-300">
                      Entfernen
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Input JSON Array:</span>
                    <input
                      type="text"
                      value={tc.inputStr}
                      onChange={(e) => handleUpdateTestCase(idx, 'inputStr', e.target.value)}
                      placeholder='[1, "abc"]'
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Expected JSON:</span>
                    <input
                      type="text"
                      value={tc.expectedStr}
                      onChange={(e) => handleUpdateTestCase(idx, 'expectedStr', e.target.value)}
                      placeholder='true'
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-emerald-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Bitte korrigiere folgende Fehler:
              </div>
              {validationErrors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          {/* Test Run Feedback */}
          {testRunFeedback && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                {testRunFeedback.allOk ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Musterlösung besteht alle Testfälle!
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Testlauf fehlgeschlagen: {testRunFeedback.error || 'Ergebnisse ungleich'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleTestSolution}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5 fill-slate-200" /> Lösung Prüfen
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
            >
              <Save className="w-3.5 h-3.5" /> Challenge Speichern
            </button>
          </div>
        </div>
      </div>

      {/* Saved Custom Challenges List */}
      {customList.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Deine erstellten Challenges ({customList.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customList.map((ch) => (
              <div key={ch.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-emerald-400">{ch.category}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{ch.difficulty}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{ch.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{ch.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-mono">{ch.testCases?.length || 0} Tests</span>
                  <button
                    onClick={() => handleDelete(ch.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-400" />
              Challenges aus JSON importieren
            </h3>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              rows={8}
              placeholder="Füge hier das JSON-Array mit Challenges ein..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-emerald-300 font-mono text-xs focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Abbrechen
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Importieren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
