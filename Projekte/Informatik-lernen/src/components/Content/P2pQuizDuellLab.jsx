import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Swords, Trophy, Play, RotateCcw, 
  CheckCircle2, Bot, User, Wifi
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  P2P_QUIZ_QUESTIONS, 
  calculateRoundScore, 
  generateRoomCode, 
  createBotResponse 
} from '../../utils/p2pQuizEngine';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function P2pQuizDuellLab() {
  const { awardXP } = useStore();

  // Match States: 'lobby' | 'countdown' | 'in_game' | 'round_result' | 'game_over'
  const [gameState, setGameState] = useState('lobby');
  const [roomCode] = useState(() => generateRoomCode());
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [opponentType, setOpponentType] = useState('bot_medium'); // 'bot_easy' | 'bot_medium' | 'bot_hard' | 'webrtc'
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [playerSelected, setPlayerSelected] = useState(null);
  const [botSelectedData, setBotSelectedData] = useState(null);

  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [roundHistory, setRoundHistory] = useState([]);

  const timerRef = useRef(null);

  const currentQ = P2P_QUIZ_QUESTIONS[currentQuestionIdx];

  // Start Game
  const handleStartMatch = () => {
    setPlayerScore(0);
    setOpponentScore(0);
    setCurrentQuestionIdx(0);
    setRoundHistory([]);
    setPlayerSelected(null);
    setBotSelectedData(null);
    setTimeLeft(15);
    setGameState('in_game');
    soundManager.playSFX('click');
  };

  const evaluateRound = useCallback((pChoice, bData, remainingTime) => {
    const isPlayerCorrect = pChoice !== null && pChoice === currentQ.correct;
    const playerGain = calculateRoundScore(isPlayerCorrect, remainingTime, currentQ.timeLimit);
    const botGain = bData ? bData.score : 0;

    const newPScore = playerScore + playerGain;
    const newBScore = opponentScore + botGain;

    setPlayerScore(newPScore);
    setOpponentScore(newBScore);

    if (isPlayerCorrect) {
      soundManager.playSFX('success');
    } else {
      soundManager.playSFX('error');
    }

    setRoundHistory(prev => [
      ...prev,
      {
        question: currentQ.question,
        correct: currentQ.correct,
        playerChoice: pChoice,
        isPlayerCorrect,
        playerGain,
        botChoice: bData ? bData.chosenOption : null,
        botGain
      }
    ]);

    setGameState('round_result');
  }, [currentQ, playerScore, opponentScore]);

  // Timer Effect
  useEffect(() => {
    if (gameState === 'in_game') {
      // Simulate Bot Response delay
      const difficulty = opponentType.replace('bot_', '');
      const botResponse = createBotResponse(currentQuestionIdx, difficulty);
      setBotSelectedData(botResponse);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            evaluateRound(null, botResponse, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [gameState, currentQuestionIdx, opponentType, evaluateRound]);

  const handlePlayerAnswer = (optionIdx) => {
    if (playerSelected !== null || gameState !== 'in_game') return;
    clearInterval(timerRef.current);
    setPlayerSelected(optionIdx);
    evaluateRound(optionIdx, botSelectedData, timeLeft);
  };

  const handleNextRound = () => {
    if (currentQuestionIdx + 1 < P2P_QUIZ_QUESTIONS.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setPlayerSelected(null);
      setBotSelectedData(null);
      setTimeLeft(15);
      setGameState('in_game');
      soundManager.playSFX('click');
    } else {
      // Game Over
      setGameState('game_over');
      if (playerScore > opponentScore) {
        soundManager.playSFX('levelUp');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        awardXP(100);
      } else {
        awardXP(30);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-red-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-amber-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/30 text-amber-200 border border-amber-400/30">
                P2P Realtime Multiplayer • 1v1 Arena
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +100 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Swords className="w-8 h-8 text-amber-400" />
              IHK Quiz-Duell Arena
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Tritt im 1-gegen-1 Echtzeit-Duell gegen IT-Auszubildende oder smarte KI-Gegner an. Schnelligkeit bringt Extrapunkte!
            </p>
          </div>
        </div>
      </div>

      {/* LOBBY STATE */}
      {gameState === 'lobby' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gegner & Bot Match */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              Schnelles Duell starten
            </h2>

            <div className="space-y-3">
              <label className="text-xs text-slate-300 block">Wähle die Duell-Schwierigkeit:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bot_easy', label: 'Junior Bot', color: 'border-emerald-500' },
                  { id: 'bot_medium', label: 'Azubi Bot', color: 'border-amber-500' },
                  { id: 'bot_hard', label: 'Senior Bot', color: 'border-rose-500' }
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setOpponentType(b.id)}
                    className={`p-3 rounded-xl border text-center transition font-semibold text-xs ${
                      opponentType === b.id
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartMatch}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              Duell jetzt starten (8 Runden)
            </button>
          </div>

          {/* WebRTC LAN / Room Code */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Wifi className="w-5 h-5 text-cyan-400" />
              LAN &amp; Room-Code Duell
            </h2>

            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Dein Raum-Code zum Teilen:</span>
                <span className="text-2xl font-mono font-bold tracking-widest text-cyan-400">{roomCode}</span>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Raum-Code von Kollegen beitreten:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="Z.B. X7K9AB"
                    maxLength={6}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono text-sm text-center"
                  />
                  <button
                    onClick={handleStartMatch}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    Beitreten
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IN-GAME / ROUND RESULT STATE */}
      {(gameState === 'in_game' || gameState === 'round_result') && currentQ && (
        <div className="space-y-6">
          {/* Match Score Bar */}
          <div className="grid grid-cols-3 gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center items-center shadow-lg">
            {/* Player */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-sm">
                <User className="w-4 h-4" /> Du (Player 1)
              </div>
              <div className="text-3xl font-bold font-mono text-white">{playerScore}</div>
            </div>

            {/* Timer & Round */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold block">
                Runde {currentQuestionIdx + 1} / {P2P_QUIZ_QUESTIONS.length}
              </span>
              <div className={`text-2xl font-mono font-bold ${timeLeft <= 3 ? 'text-rose-400 animate-ping' : 'text-amber-400'}`}>
                ⏱️ {timeLeft}s
              </div>
            </div>

            {/* Opponent */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
                <Bot className="w-4 h-4" /> Gegner
              </div>
              <div className="text-3xl font-bold font-mono text-white">{opponentScore}</div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-semibold">
                Kategorie: {currentQ.category}
              </span>
              <span>100 Basispunkte + bis zu 50 Speed-Bonus</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-amber-500';
                
                if (gameState === 'round_result') {
                  if (idx === currentQ.correct) {
                    btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                  } else if (playerSelected === idx) {
                    btnStyle = 'bg-rose-950 border-rose-500 text-rose-200 font-bold';
                  } else {
                    btnStyle = 'bg-slate-950/60 border-slate-800 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handlePlayerAnswer(idx)}
                    disabled={gameState !== 'in_game' || playerSelected !== null}
                    className={`p-4 rounded-xl border text-left text-sm md:text-base transition flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {gameState === 'round_result' && idx === currentQ.correct && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Round Button */}
            {gameState === 'round_result' && (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleNextRound}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center gap-2"
                >
                  <span>Nächste Runde</span>
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAME OVER STATE */}
      {gameState === 'game_over' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {playerScore > opponentScore
                ? '🏆 GLORREICHER SIEG!'
                : playerScore === opponentScore
                ? '🤝 UNENTSCHIEDEN!'
                : '💥 KNAPPE NIEDERLAGE!'}
            </h2>
            <p className="text-slate-400 text-sm">
              Endstand: <span className="text-cyan-400 font-bold">{playerScore} Punkte</span> vs. <span className="text-rose-400 font-bold">{opponentScore} Punkte</span>
            </p>
          </div>

          <div className="text-left bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800 max-h-64 overflow-y-auto">
            {roundHistory.map((round, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <span className="text-slate-400 truncate max-w-[60%]">{idx + 1}. {round.question}</span>
                <span className={round.isPlayerCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {round.isPlayerCorrect ? `+${round.playerGain}` : '0'} Pkt.
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setGameState('lobby')}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold rounded-xl text-sm shadow-lg transition"
          >
            Zurück zur Duell-Lobby
          </button>
        </div>
      )}
    </div>
  );
}
