import React, { useState, useEffect, useRef } from 'react';

import { Mic, MicOff, Volume2, RotateCcw, Headphones, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VOICE_QUIZ_QUESTIONS, evaluateSpokenAnswer } from '../../utils/voiceQuizEngine';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function VoiceQuizStudioLab() {
  const { awardXP } = useStore();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [xpClaimedIdx, setXpClaimedIdx] = useState([]);
  const currentQ = VOICE_QUIZ_QUESTIONS[currentIdx];

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  const recognitionRef = useRef(null);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'de-DE';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      // Fallback for browsers without Web Speech API
      const simulatedText = prompt('Spracherkennung nicht direkt verfügbar. Bitte sprich / tippe deine Antwort ein:', '');
      if (simulatedText) {
        setTranscript(simulatedText);
        handleEvaluateAnswer(simulatedText);
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      handleEvaluateAnswer(transcript);
    } else {
      setTranscript('');
      setEvaluationResult(null);
      recognitionRef.current.start();
      soundManager.playSFX('click');
    }
  };

  const handleSpeakQuestion = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQ.question);
    utterance.lang = 'de-DE';
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleEvaluateAnswer = (textToEvaluate) => {
    const text = textToEvaluate || transcript;
    const res = evaluateSpokenAnswer(text, currentIdx);
    setEvaluationResult(res);

    if (res.passed) {
      soundManager.playSFX('levelUp');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      if (!xpClaimedIdx.includes(currentIdx)) {
        setXpClaimedIdx(prev => [...prev, currentIdx]);
        awardXP(40, 'podcast_quiz_master');
      }
    } else {
      soundManager.playSFX('error');
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < VOICE_QUIZ_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
      setTranscript('');
      setEvaluationResult(null);
      soundManager.playSFX('click');
    }
  };

  const handleReset = () => {
    setTranscript('');
    setEvaluationResult(null);
    soundManager.playSFX('click');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-purple-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                Audio &amp; Voice Recognition Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +40 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Headphones className="w-8 h-8 text-purple-400" />
              Podcast Voice Quiz Studio
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Beantworte IHK-Fachfragen frei per Spracheingabe (Mikrofon) mit automatischer semantischer Schlüsselwort-Prüfung.
            </p>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-3">
          <span className="px-2.5 py-1 rounded bg-purple-950/80 text-purple-300 font-semibold border border-purple-800">
            {currentQ.topic}
          </span>
          <span>Frage {currentIdx + 1} von {VOICE_QUIZ_QUESTIONS.length}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
            {currentQ.question}
          </h2>
          <button
            onClick={handleSpeakQuestion}
            className={`p-3 rounded-xl border transition ${
              isSpeakingQuestion
                ? 'bg-purple-600 border-purple-400 text-white animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Frage vorlesen"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Control & Recording Area */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <button
              onClick={handleToggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-2xl ${
                isListening
                  ? 'bg-rose-600 border-4 border-rose-400 text-white animate-pulse shadow-rose-600/50'
                  : 'bg-purple-600 hover:bg-purple-500 border-4 border-purple-400 text-white shadow-purple-600/40'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>

            <span className="text-xs font-bold text-slate-400">
              {isListening ? '🔴 Höre zu... Jetzt frei sprechen!' : 'Klicke auf das Mikrofon und sprich deine Antwort'}
            </span>
          </div>

          {/* Transcript Box */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-left text-xs font-mono min-h-20 flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-slate-200">
              {transcript || <span className="text-slate-500 italic">Gesprochener Text erscheint hier in Echtzeit...</span>}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {transcript && !isListening && !evaluationResult && (
              <button
                onClick={() => handleEvaluateAnswer()}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg"
              >
                Antwort Prüfen
              </button>
            )}
            {transcript && (
              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Neu aufnehmen
              </button>
            )}
          </div>
        </div>

        {/* Evaluation Feedback */}
        {evaluationResult && (
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                evaluationResult.passed
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-rose-950 text-rose-300 border border-rose-700'
              }`}>
                {evaluationResult.passed ? '✓ AUSGEZEICHNET BEANTWORTET' : '✗ NOCH UNVOLLSTÄNDIG'}
              </span>
              <span className="font-mono text-slate-400">Übereinstimmung: {evaluationResult.score}%</span>
            </div>

            {/* Matched Keywords */}
            <div>
              <span className="text-slate-400 block mb-1">Erkannte Schlüsselbegriffe:</span>
              <div className="flex flex-wrap gap-1.5 font-mono">
                {evaluationResult.matchedKeywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Ideal Answer */}
            <div className="p-3 bg-slate-900 rounded-lg text-slate-300 space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-400 block">Muster-Antwort der Prüfer:</span>
              <p>{evaluationResult.idealAnswer}</p>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition"
              >
                Nächste Frage ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
