import React, { useState, useMemo } from 'react';
import { Award, Calendar, CheckCircle2, AlertTriangle, TrendingDown, Copy, Check, Zap, Layers, BarChart2 } from 'lucide-react';
import { 
  calculateSprintBurndown, 
  analyzeKanbanWipLimits, 
  generateIhkMethodologyJustification, 
  IHK_METHOD_COMPARISON
} from '../../utils/ihkAgileBurndownEngine';
import { useStore } from '../../store/useStore';

export default function IhkAgileBurndownLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('burndown'); // 'burndown' | 'decision' | 'kanban'

  // Burndown Config
  const [totalDays, setTotalDays] = useState(10);
  const [initialSP, setInitialSP] = useState(50);
  const [dailyCompleted, setDailyCompleted] = useState([5, 4, 6, 3, 5, 4, 7, 4, 6, 6]);
  const [scopeAddedPoints, setScopeAddedPoints] = useState(5);
  const [scopeAdditions, setScopeAdditions] = useState([
    { day: 4, points: 5, reason: 'IHK-Anforderungserweiterung: Zusätzliche Validierung' }
  ]);

  // IHK Proposal settings
  const [selectedMethod, setSelectedMethod] = useState('hybrid'); // 'hybrid' | 'scrum' | 'waterfall'
  const [candidateRole, setCandidateRole] = useState('FIAE');
  const [totalProjectHours, setTotalProjectHours] = useState(80);
  const [projectName, setProjectName] = useState('Microservice Telemetrie Pipeline');
  const [copied, setCopied] = useState(false);

  // Kanban Columns
  const [kanbanCols, setKanbanCols] = useState([
    { id: 'backlog', name: 'Product Backlog', cardsCount: 8, wipLimit: 0 },
    { id: 'dev', name: 'In Development', cardsCount: 3, wipLimit: 4 },
    { id: 'review', name: 'Code Review', cardsCount: 5, wipLimit: 2 },
    { id: 'test', name: 'QA / Testing', cardsCount: 1, wipLimit: 3 },
    { id: 'done', name: 'Done (Fertig)', cardsCount: 15, wipLimit: 0 }
  ]);

  // Reward state
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const burndownResult = useMemo(() => {
    return calculateSprintBurndown({
      totalDays,
      initialStoryPoints: initialSP,
      dailyCompletedPoints: dailyCompleted.slice(0, totalDays),
      scopeAdditions
    });
  }, [totalDays, initialSP, dailyCompleted, scopeAdditions]);

  const kanbanAnalysis = useMemo(() => {
    return analyzeKanbanWipLimits(kanbanCols);
  }, [kanbanCols]);

  const generatedIhkText = useMemo(() => {
    return generateIhkMethodologyJustification(selectedMethod, {
      role: candidateRole,
      totalHours: totalProjectHours,
      projectName
    });
  }, [selectedMethod, candidateRole, totalProjectHours, projectName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedIhkText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimReward = () => {
    if (!rewardClaimed) {
      awardXP(60);
      setRewardClaimed(true);
    }
  };

  const handleAddScope = () => {
    setScopeAdditions(prev => [
      ...prev,
      { day: 5, points: scopeAddedPoints, reason: 'Ungeplante Story-Punkte (Scope Creep)' }
    ]);
  };

  const handleUpdateCompleted = (index, value) => {
    const updated = [...dailyCompleted];
    updated[index] = Number(value);
    setDailyCompleted(updated);
  };

  const adjustKanbanCards = (colId, delta) => {
    setKanbanCols(prev => prev.map(c => {
      if (c.id !== colId) return c;
      return { ...c, cardsCount: Math.max(0, c.cardsCount + delta) };
    }));
  };

  // SVG Chart Scaling
  const chartWidth = 600;
  const chartHeight = 260;
  const padding = 40;
  const maxPoints = Math.max(initialSP + 10, ...burndownResult.dataPoints.map(d => Math.max(d.ideal, d.actual)));

  const getX = (day) => padding + (day / totalDays) * (chartWidth - padding * 2);
  const getY = (val) => chartHeight - padding - (val / maxPoints) * (chartHeight - padding * 2);

  // Path generators
  const idealPath = burndownResult.dataPoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.day)} ${getY(d.ideal)}`)
    .join(' ');

  const actualPath = burndownResult.dataPoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.day)} ${getY(d.actual)}`)
    .join(' ');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              IHK AP2 Teil A Pflichtthema
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Projektantrag & Dokumentation
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-indigo-400" />
            IHK Agile vs. Waterfall & Burndown Studio (AP2 Teil A)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Interaktives Sprint-Burndown-Diagramm, Story-Point-Velocity-Rechner, Kanban WIP-Bottleneck-Analyse und IHK-konforme Begründungsvorlagen für die Methodenwahl im Projektantrag.
          </p>
        </div>

        <button
          onClick={handleClaimReward}
          disabled={rewardClaimed}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg ${
            rewardClaimed 
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 cursor-default'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-900/30'
          }`}
        >
          <Zap className="w-4 h-4" />
          {rewardClaimed ? '✓ 60 XP Eingelöst' : '+60 XP Belohnung'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 my-6 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('burndown')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'burndown' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Sprint Burndown & Velocity
        </button>
        <button
          onClick={() => setActiveTab('decision')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'decision' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          IHK Vorgehensmodell-Entscheider
        </button>
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'kanban' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Kanban WIP Bottleneck Inspector
        </button>
      </div>

      {/* Tab 1: Burndown */}
      {activeTab === 'burndown' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400 font-medium">Sprint-Umfang (Initial)</div>
              <div className="text-2xl font-bold text-slate-100 mt-1">{burndownResult.initialStoryPoints} SP</div>
              <div className="text-xs text-indigo-400 mt-1">{burndownResult.totalDays} Arbeitstage</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400 font-medium">Abgeschlossen</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{burndownResult.totalCompleted} SP</div>
              <div className="text-xs text-slate-400 mt-1">Velocity: ~{burndownResult.velocityPerDay} SP / Tag</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400 font-medium">Scope-Creep (Nachschlag)</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">+{burndownResult.totalScopeAdded} SP</div>
              <div className="text-xs text-slate-400 mt-1">Ungeplante Anforderungen</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400 font-medium">Sprint-Ziel Status</div>
              <div className={`text-xl font-bold mt-1 flex items-center gap-1.5 ${
                burndownResult.isGoalAchieved ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {burndownResult.isGoalAchieved ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                {burndownResult.isGoalAchieved ? 'Erreicht (0 SP)' : `${burndownResult.finalRemainingPoints} SP Rest`}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {burndownResult.isGoalAchieved ? 'Im Zeitplan' : `Fehlen ~${burndownResult.daysNeededAtCurrentVelocity} Tage`}
              </div>
            </div>
          </div>

          {/* SVG Chart & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Burndown-Kurve (Ideal vs. Ist)
                </h2>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-3 h-0.5 bg-slate-500 inline-block border-t border-dashed"></span> Ideal
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-3 h-0.5 bg-emerald-500 inline-block"></span> Ist-Verlauf
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Burndown Canvas */}
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto max-h-[300px]">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = padding + pct * (chartHeight - padding * 2);
                    const labelVal = Math.round(maxPoints * (1 - pct));
                    return (
                      <g key={i}>
                        <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={padding - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">{labelVal}</text>
                      </g>
                    );
                  })}

                  {/* Day labels */}
                  {Array.from({ length: totalDays + 1 }).map((_, d) => {
                    const x = getX(d);
                    return (
                      <g key={d}>
                        <line x1={x} y1={chartHeight - padding} x2={x} y2={chartHeight - padding + 5} stroke="#64748b" strokeWidth="1" />
                        <text x={x} y={chartHeight - padding + 16} fill="#64748b" fontSize="10" textAnchor="middle">T{d}</text>
                      </g>
                    );
                  })}

                  {/* Ideal Line */}
                  <path d={idealPath} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5" />

                  {/* Actual Line */}
                  <path d={actualPath} fill="none" stroke="#10b981" strokeWidth="2.5" />

                  {/* Actual Data Points */}
                  {burndownResult.dataPoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={getX(pt.day)}
                      cy={getY(pt.actual)}
                      r={pt.scopeAdded > 0 ? 5 : 3.5}
                      fill={pt.scopeAdded > 0 ? '#f59e0b' : '#10b981'}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Interactive Sprint Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Sprint-Parameter anpassen
              </h3>

              <div>
                <label className="text-xs text-slate-400">Geplante Story Points (Sprint Backlog): {initialSP} SP</label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={initialSP}
                  onChange={e => setInitialSP(Number(e.target.value))}
                  className="w-full mt-1 accent-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Sprint-Dauer: {totalDays} Tage</label>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  value={totalDays}
                  onChange={e => setTotalDays(Number(e.target.value))}
                  className="w-full mt-1 accent-indigo-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-2">Täglich erledigte Punkte (T1 - T{totalDays}):</div>
                <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1">
                  {Array.from({ length: totalDays }).map((_, i) => (
                    <div key={i}>
                      <span className="text-[10px] text-slate-500 block">T{i + 1}</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={dailyCompleted[i] ?? 0}
                        onChange={e => handleUpdateCompleted(i, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-center font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Zusätzliche Story Points:</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={scopeAddedPoints}
                    onChange={e => setScopeAddedPoints(Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-center font-mono"
                  />
                </div>
                <button
                  onClick={handleAddScope}
                  className="w-full px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition"
                >
                  + Scope-Creep simulieren (+{scopeAddedPoints} SP)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Decision & IHK Text Generator */}
      {activeTab === 'decision' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-200">
              IHK-Methodenvergleich: Welches Modell für welches Projekt?
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Kriterium</th>
                    <th className="py-2.5 px-3 text-slate-300">Wasserfall (Klassisch)</th>
                    <th className="py-2.5 px-3 text-purple-400">Scrum (Rein Agil)</th>
                    <th className="py-2.5 px-3 text-indigo-400 font-bold bg-indigo-950/20">Hybrides Modell (IHK-Favorit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {IHK_METHOD_COMPARISON.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{row.criterion}</td>
                      <td className="py-2.5 px-3">{row.waterfall}</td>
                      <td className="py-2.5 px-3">{row.scrum}</td>
                      <td className="py-2.5 px-3 bg-indigo-950/20 font-medium text-indigo-200">{row.hybrid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-200">
                1-Klick IHK Begründungstext-Generator (für Projektantrag & Bericht)
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition shadow"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Kopiert!' : 'In Zwischenablage kopieren'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400">Vorgehensmodell</label>
                <select
                  value={selectedMethod}
                  onChange={e => setSelectedMethod(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                >
                  <option value="hybrid">Hybrides Modell (Empfohlen)</option>
                  <option value="scrum">Scrum (Rein agil)</option>
                  <option value="waterfall">Wasserfall (Klassisch)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400">Ausbildungsberuf</label>
                <select
                  value={candidateRole}
                  onChange={e => {
                    const role = e.target.value;
                    setCandidateRole(role);
                    setTotalProjectHours(role === 'FISI' ? 40 : 80);
                  }}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                >
                  <option value="FIAE">Fachinformatiker Anwendungsentwicklung (80h)</option>
                  <option value="FISI">Fachinformatiker Systemintegration (40h)</option>
                  <option value="FIDP">Fachinformatiker Daten- & Prozessanalyse (80h)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400">Projektname</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                />
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {generatedIhkText}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Kanban WIP Bottleneck */}
      {activeTab === 'kanban' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-start md:items-center">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Kanban Work-in-Progress (WIP) Limit & Bottleneck Sandbox
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                WIP-Limits verhindern Multitasking und Stau. Wenn eine Spalte ihr Limit überschreitet, verlangsamt sich der gesamte Durchsatz (Little's Law).
              </p>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              kanbanAnalysis.hasBottlenecks ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {kanbanAnalysis.hasBottlenecks ? `⚠️ ${kanbanAnalysis.bottleneckCount} Engpass erkannt!` : '✓ Optimaler Fluss'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {kanbanAnalysis.columns.map(col => (
              <div
                key={col.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  col.isOverloaded 
                    ? 'bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/30' 
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{col.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                      WIP: {col.wipLimit > 0 ? col.wipLimit : '∞'}
                    </span>
                  </div>

                  <div className="my-3 text-center">
                    <span className={`text-3xl font-extrabold font-mono ${
                      col.isOverloaded ? 'text-rose-400' : 'text-slate-100'
                    }`}>
                      {col.cardsCount}
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">Tickets</span>
                  </div>

                  {col.utilization !== null && (
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full ${col.isOverloaded ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, col.utilization)}%` }}
                      ></div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {col.recommendation}
                  </p>
                </div>

                <div className="flex gap-1 mt-4">
                  <button
                    onClick={() => adjustKanbanCards(col.id, -1)}
                    className="flex-1 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-200 font-bold"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => adjustKanbanCards(col.id, 1)}
                    className="flex-1 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-200 font-bold"
                  >
                    +1
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
