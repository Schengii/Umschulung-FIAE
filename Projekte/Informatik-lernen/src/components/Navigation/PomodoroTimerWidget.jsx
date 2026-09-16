import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, X } from 'lucide-react';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function PomodoroTimerWidget() {
  const { awardXP } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' (25m) or 'break' (5m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      soundManager.playSFX('timerBell');
      if (mode === 'focus') {
        awardXP(50);
        setCompletedSessions((c) => c + 1);
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, awardXP]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    soundManager.playSFX('click');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    soundManager.playSFX('click');
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
    soundManager.playSFX('click');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl w-72 text-white space-y-3 backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-bold">Pomodoro Fokus</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl">
              <button
                onClick={() => switchMode('focus')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === 'focus' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fokus (25m)
              </button>
              <button
                onClick={() => switchMode('break')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === 'break' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pause (5m)
              </button>
            </div>

            {/* Timer Display */}
            <div className="text-center py-2">
              <div className="text-4xl font-mono font-bold tracking-wider text-white">
                {formattedTime}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {completedSessions} abgeschlossene Sessions
              </span>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={toggleTimer}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetTimer}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 rounded-full shadow-xl backdrop-blur-md transition group"
          >
            <Timer className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-xs font-mono font-bold">{formattedTime}</span>
            {isRunning && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
