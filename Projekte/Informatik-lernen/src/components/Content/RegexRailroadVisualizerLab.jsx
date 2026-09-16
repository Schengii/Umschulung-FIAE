import React, { useState, useMemo } from 'react';

import { Regex, Layers, Award, Eye, Code2 } from 'lucide-react';
import { parseRegexTokens, testRegexMatch } from '../../utils/regexParserEngine';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export const REGEX_PRESETS = [
  {
    id: 'email',
    name: 'E-Mail Adresse (RFC 5322)',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: 'g',
    sampleText: 'Kontakt: max.mustermann@firma.de oder info@tech-cloud.io (ungueltig: test@.com)'
  },
  {
    id: 'ipv4',
    name: 'IPv4 Adresse',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    flags: 'g',
    sampleText: 'Gültige IP: 192.168.1.1 und 10.0.0.254'
  },
  {
    id: 'password',
    name: 'Starkes Passwort (min. 8 Zeichen, Zahl, Großbuchstabe)',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: 'g',
    sampleText: 'SicheresP@ssw0rt!2026'
  },
  {
    id: 'date_iso',
    name: 'ISO-Datum (YYYY-MM-DD)',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    flags: 'g',
    sampleText: '2026-08-22'
  }
];

export default function RegexRailroadVisualizerLab() {
  const { awardXP } = useStore();

  const [pattern, setPattern] = useState(REGEX_PRESETS[0].pattern);
  const [flags, setFlags] = useState('g');
  const [sampleText, setSampleText] = useState(REGEX_PRESETS[0].sampleText);
  const [xpClaimed, setXpClaimed] = useState(false);

  const tokens = useMemo(() => parseRegexTokens(pattern), [pattern]);
  const testResult = useMemo(() => testRegexMatch(pattern, flags, sampleText), [pattern, flags, sampleText]);

  const handleSelectPreset = (preset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setSampleText(preset.sampleText);
    soundManager.playSFX('click');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-950 via-rose-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-pink-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/30 text-pink-200 border border-pink-400/30">
                Visual RegEx Engine &amp; Syntax Tree
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +45 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Regex className="w-8 h-8 text-pink-400" />
              RegEx Visualizer &amp; Railroad Diagram Studio
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Visualisiere reguläre Ausdrücke als interaktive Eisenbahn-Diagramme mit Token-Bäumen, IHK-Erklärungen und Live-Matching.
            </p>
          </div>

          <button
            onClick={() => { if (!xpClaimed) { setXpClaimed(true); awardXP(45, 'regex_master'); } }}
            disabled={xpClaimed}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shrink-0"
          >
            <Award className="w-4 h-4" /> {xpClaimed ? 'XP gesichert!' : 'RegEx XP sichern'}
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {REGEX_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPreset(p)}
            className={`p-3 rounded-xl border text-left text-xs transition ${
              pattern === p.pattern
                ? 'bg-pink-950/80 border-pink-500 text-white font-bold shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] text-pink-400 font-mono uppercase block mb-1">Preset</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* RegEx Pattern Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-pink-400" /> Regulärer Ausdruck (Pattern &amp; Flags)
          </span>
          <span className="font-mono text-slate-400">/{pattern}/{flags}</span>
        </div>

        <div className="flex gap-2">
          <span className="text-xl font-mono text-slate-500 self-center">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-pink-300 font-mono text-sm focus:border-pink-500 focus:outline-none"
          />
          <span className="text-xl font-mono text-slate-500 self-center">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            className="w-16 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2.5 text-pink-300 font-mono text-sm text-center focus:border-pink-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Visual Railroad Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-pink-400" />
          Visuelles Eisenbahn-Diagramm &amp; Token-Kette
        </h2>

        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 overflow-x-auto flex items-center gap-2 min-h-24">
          {/* Start Point */}
          <div className="w-4 h-4 rounded-full bg-emerald-500 shrink-0 shadow-lg shadow-emerald-500/40" title="Start" />
          <div className="w-6 h-0.5 bg-slate-700 shrink-0" />

          {tokens.map((tok, idx) => {
            let color = 'bg-slate-800 border-slate-700 text-slate-300';
            if (tok.type === 'char_class') color = 'bg-indigo-950/80 border-indigo-500 text-indigo-200';
            else if (tok.type === 'quantifier' || tok.type === 'quantifier_range') color = 'bg-amber-950/80 border-amber-500 text-amber-200';
            else if (tok.type.startsWith('anchor')) color = 'bg-rose-950/80 border-rose-500 text-rose-200';
            else if (tok.type.startsWith('group')) color = 'bg-purple-950/80 border-purple-500 text-purple-200';

            return (
              <React.Fragment key={idx}>
                <div className={`px-3 py-2 rounded-xl border font-mono text-xs text-center shrink-0 shadow-md ${color}`}>
                  <div className="text-[10px] text-slate-400 block font-sans">{tok.label}</div>
                  <div className="font-bold">{tok.raw}</div>
                </div>
                {idx < tokens.length - 1 && <div className="w-4 h-0.5 bg-slate-700 shrink-0" />}
              </React.Fragment>
            );
          })}

          <div className="w-6 h-0.5 bg-slate-700 shrink-0" />
          {/* End Point */}
          <div className="w-4 h-4 rounded-full bg-rose-500 shrink-0 shadow-lg shadow-rose-500/40" title="Ende" />
        </div>
      </div>

      {/* Live Match Tester */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-pink-400" />
            Live Test-String &amp; Match-Erkennung
          </h2>
          {testResult.isValid && (
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
              testResult.isMatch
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {testResult.matchCount} Matches gefunden
            </span>
          )}
        </div>

        <textarea
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          rows={3}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 font-mono text-xs focus:border-pink-500 focus:outline-none"
        />

        {/* Matches Breakdown */}
        {testResult.isValid && testResult.matches.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Gefundene Treffer:</span>
            <div className="flex flex-wrap gap-2">
              {testResult.matches.map((m, idx) => (
                <div key={idx} className="p-2 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-xs font-mono text-emerald-300">
                  <span className="text-slate-500">#{idx + 1} (Index {m.index}):</span> <strong className="text-white">"{m.value}"</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
