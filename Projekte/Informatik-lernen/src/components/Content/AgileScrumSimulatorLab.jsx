import React, { useState, useMemo } from 'react';

import { Kanban, Award, RotateCcw, TrendingDown, Layers } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  INITIAL_USER_STORIES, 
  calculateSprintMetrics, 
  moveStoryStatus 
} from '../../utils/scrumEngine';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

const KANBAN_COLUMNS = [
  { id: 'backlog', label: 'Product Backlog', color: 'border-slate-700 bg-slate-900/60' },
  { id: 'todo', label: 'Sprint To Do', color: 'border-blue-700/50 bg-blue-950/30' },
  { id: 'in_progress', label: 'In Progress', color: 'border-amber-700/50 bg-amber-950/30' },
  { id: 'review', label: 'Code Review', color: 'border-purple-700/50 bg-purple-950/30' },
  { id: 'done', label: 'Done (DoD)', color: 'border-emerald-700/50 bg-emerald-950/30' }
];

export default function AgileScrumSimulatorLab() {
  const { awardXP } = useStore();

  const [stories, setStories] = useState(INITIAL_USER_STORIES);
  const [sprintDays, setSprintDays] = useState(10);
  const [xpClaimed, setXpClaimed] = useState(false);

  const metrics = useMemo(() => calculateSprintMetrics(stories, sprintDays), [stories, sprintDays]);

  const handleMove = (storyId, newStatus) => {
    setStories(prev => moveStoryStatus(prev, storyId, newStatus));
    soundManager.playSFX('click');
  };

  const handleCompleteSprint = () => {
    if (xpClaimed) return;
    soundManager.playSFX('levelUp');
    setXpClaimed(true);
    awardXP(50, 'scrum_master');
  };

  const handleReset = () => {
    setStories(INITIAL_USER_STORIES);
    setXpClaimed(false);
    soundManager.playSFX('click');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-teal-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/30 text-teal-200 border border-teal-400/30">
                IHK Lernfeld 1 &amp; 10: Agiles Projektmanagement
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +50 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Kanban className="w-8 h-8 text-teal-400" />
              Scrum Sprint &amp; Kanban Simulator
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Plane Sprints, schätze Story Points (Planning Poker), bewege Stories über das Kanban-Board und analysiere das Burndown-Chart.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCompleteSprint}
              disabled={xpClaimed}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
            >
              <Award className="w-4 h-4" /> {xpClaimed ? 'Sprint abgeschlossen!' : 'Sprint abschließen'}
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Zurücksetzen"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sprint KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Gesamte Story Points</span>
          <div className="text-2xl font-bold text-white">{metrics.totalPoints} SP</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Sprintlänge: {sprintDays} Tage</span>
          <input
            type="range"
            min="5"
            max="20"
            value={sprintDays}
            onChange={(e) => setSprintDays(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Abgeschlossen (Done)</span>
          <div className="text-2xl font-bold text-emerald-400">{metrics.completedPoints} SP ({metrics.completionRate}%)</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-xs text-slate-400 font-semibold block mb-1">In Arbeit &amp; Review</span>
          <div className="text-2xl font-bold text-amber-400">{metrics.inProgressPoints} SP</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Verbleibend</span>
          <div className="text-2xl font-bold text-rose-400">{metrics.remainingPoints} SP</div>
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          Interaktives Sprint Kanban Board
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto">
          {KANBAN_COLUMNS.map((col) => {
            const colStories = stories.filter(s => s.status === col.id);
            return (
              <div key={col.id} className={`p-3 rounded-xl border flex flex-col min-h-72 ${col.color}`}>
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200">{col.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 font-mono text-slate-300 font-bold">
                    {colStories.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {colStories.map((story) => (
                    <div
                      key={story.id}
                      className="p-3 bg-slate-950/90 border border-slate-800 rounded-lg text-xs space-y-2 shadow"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] text-teal-400 font-bold">{story.id}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-bold">
                          {story.storyPoints} SP
                        </span>
                      </div>

                      <div className="font-semibold text-slate-200 leading-snug">{story.title}</div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px]">
                        <span className="text-slate-500">{story.category}</span>
                        <div className="flex gap-1">
                          {col.id !== 'backlog' && (
                            <button
                              onClick={() => {
                                const prevColIdx = KANBAN_COLUMNS.findIndex(c => c.id === col.id) - 1;
                                if (prevColIdx >= 0) handleMove(story.id, KANBAN_COLUMNS[prevColIdx].id);
                              }}
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                              title="Zurück schieben"
                            >
                              ◀
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button
                              onClick={() => {
                                const nextColIdx = KANBAN_COLUMNS.findIndex(c => c.id === col.id) + 1;
                                if (nextColIdx < KANBAN_COLUMNS.length) handleMove(story.id, KANBAN_COLUMNS[nextColIdx].id);
                              }}
                              className="px-1.5 py-0.5 bg-teal-800 hover:bg-teal-700 text-white rounded font-bold"
                              title="Weiter schieben"
                            >
                              ▶
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Burndown Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-rose-400" />
          Sprint Burndown Chart (Ideal vs. Tatsächlich)
        </h2>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.burndownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit=" SP" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="idealRemaining" name="Ideale Linie (SP)" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
              <Line type="monotone" dataKey="actualRemaining" name="Tatsächlicher Verlauf (SP)" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
