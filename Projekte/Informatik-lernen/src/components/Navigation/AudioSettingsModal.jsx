import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, X, Play } from 'lucide-react';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function AudioSettingsModal({ isOpen, onClose }) {
  const { soundVolume, isSoundMuted, setSoundVolume, setIsSoundMuted } = useStore();

  if (!isOpen) return null;

  const testSFX = (type) => {
    soundManager.playSFX(type);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Audio- & SFX-Einstellungen</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Mute Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                {isSoundMuted ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                )}
                <div>
                  <span className="text-sm font-semibold block">Töne aktivieren</span>
                  <span className="text-xs text-slate-400">Audio-Effekte für XP, Quizzes und Timer</span>
                </div>
              </div>
              <button
                onClick={() => setIsSoundMuted(!isSoundMuted)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  !isSoundMuted ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Gesamtlautstärke</span>
                <span className="font-mono font-bold">{Math.round(soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                disabled={isSoundMuted}
                onChange={(e) => setSoundVolume(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Test Audio Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 block font-semibold">Sound-Effekte testen:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => testSFX('success')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-200 flex items-center justify-between transition"
                >
                  <span>XP Erfolg</span>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                </button>
                <button
                  onClick={() => testSFX('levelUp')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-200 flex items-center justify-between transition"
                >
                  <span>Level-Up Fanfare</span>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                </button>
                <button
                  onClick={() => testSFX('timerBell')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-200 flex items-center justify-between transition"
                >
                  <span>Timer Glocke</span>
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                </button>
                <button
                  onClick={() => testSFX('error')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-200 flex items-center justify-between transition"
                >
                  <span>Fehler Ton</span>
                  <Play className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition"
          >
            Fertig
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
