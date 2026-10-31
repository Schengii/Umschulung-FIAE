import React, { useState, useMemo } from 'react';
import { 
  Mic, MicOff, Volume2, Award, 
  RotateCcw, ArrowRight, UserCheck, MessageSquare, Check
} from 'lucide-react';
import { 
  ORAL_DEFENSE_QUESTIONS, 
  EXAMINER_PERSONAS, 
  evaluateOralAnswer, 
  calculateOralDefenseResult 
} from '../../utils/ihkOralDefenseEngine';
import { useStore } from '../../store/useStore';

export default function IhkOralDefenseStudioLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [evaluatedResults, setEvaluatedResults] = useState({});
  const [currentText, setCurrentText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const currentQuestion = ORAL_DEFENSE_QUESTIONS[currentQuestionIdx];
  const currentExaminer = useMemo(() => {
    return EXAMINER_PERSONAS.find(p => p.id === currentQuestion?.examinerId) || EXAMINER_PERSONAS[0];
  }, [currentQuestion]);

  // Web Speech API: Frage vorlesen
  const handlePlayQuestionAudio = () => {
    if (!('speechSynthesis' in window) || !currentQuestion) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText);
    utterance.lang = 'de-DE';
    utterance.pitch = currentExaminer.voicePitch || 1.0;
    utterance.rate = currentExaminer.voiceRate || 1.0;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Simuliertes Mikrofon / Web Speech Recognition
  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Falls SpeechRecognition unterstützt wird
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'de-DE';
        rec.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          setCurrentText(prev => (prev ? prev + ' ' + transcript : transcript));
          setIsRecording(false);
        };
        rec.onerror = () => setIsRecording(false);
        rec.start();
      } else {
        setTimeout(() => {
          setIsRecording(false);
        }, 4000);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentText.trim()) return;

    const evaluation = evaluateOralAnswer(currentQuestion, currentText);
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: currentText }));
    setEvaluatedResults(prev => ({ ...prev, [currentQuestion.id]: evaluation }));
    setCurrentText('');

    if (currentQuestionIdx < ORAL_DEFENSE_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const finalResult = useMemo(() => {
    const answersList = Object.values(evaluatedResults);
    if (answersList.length < ORAL_DEFENSE_QUESTIONS.length) return null;
    return calculateOralDefenseResult(answersList);
  }, [evaluatedResults]);

  const handleClaimXP = () => {
    if (!xpClaimed && finalResult?.passed) {
      if (onRewardXP) onRewardXP(50);
      else awardXP(50, 'oral_defense_master');
      setXpClaimed(true);
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setEvaluatedResults({});
    setCurrentQuestionIdx(0);
    setCurrentText('');
    setXpClaimed(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mic size={14} /> IHK Abschlussprüfung Teil 2
              </span>
              <span className="badge badge-teal">15-Minuten Fachgespräch</span>
              <span className="badge badge-green">Sprachausgabe &amp; Feedback</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              IHK Fachgespräch &amp; Audio-Prüfungssimulator
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Simuliere das mündliche Prüfungsfachgespräch vor dem 3-köpfigen IHK-Prüfungsausschuss. Höre die Fragen per Sprachausgabe, antworte frei und erhalte detaillierte Bewertungen mit Keyword-Analysen.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw size={16} /> Neu starten
            </button>
            {finalResult?.passed && (
              <button
                className="btn btn-primary"
                onClick={handleClaimXP}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Award size={18} />
                {xpClaimed ? 'XP erhalten!' : 'Fachgespräch bestanden (+50 XP)'}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 700 }}>
            <span>Fortschritt: Frage {currentQuestionIdx + 1} von {ORAL_DEFENSE_QUESTIONS.length}</span>
            <span>{Object.keys(evaluatedResults).length} beantwortet</span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                background: 'var(--accent-primary)', 
                width: `${((currentQuestionIdx + 1) / ORAL_DEFENSE_QUESTIONS.length) * 100}%`,
                transition: 'width 0.3s ease'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Main Examination Room */}
      {!finalResult ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Examiner Panel */}
          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--accent-primary)'
              }}>
                <UserCheck size={24} color="var(--accent-primary)" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                  {currentExaminer.role}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Schwerpunkt: {currentExaminer.focus}
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}>
              <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-block' }}>
                Themengebiet: {currentQuestion.category}
              </span>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.6' }}>
                "{currentQuestion.questionText}"
              </p>

              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePlayQuestionAudio}
                style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Volume2 size={15} color={isPlayingAudio ? 'var(--accent-primary)' : 'inherit'} />
                {isPlayingAudio ? 'Wird vorgelesen...' : 'Frage vorlesen'}
              </button>
            </div>
          </div>

          {/* Candidate Response Area */}
          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="var(--accent-teal)" />
                Deine Antwort
              </h3>

              <button
                className={`btn ${isRecording ? 'btn-rose' : 'btn-secondary'} btn-sm`}
                onClick={handleToggleRecord}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                {isRecording ? 'Aufnahme stoppen' : 'Einsprechen'}
              </button>
            </div>

            <textarea
              rows={6}
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Formuliere hier deine strukturierte Antwort mit Fachbegriffen..."
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                lineHeight: '1.5',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {currentText.trim().split(/\s+/).filter(Boolean).length} Wörter eingegeben
              </span>

              <button
                className="btn btn-primary"
                onClick={handleSubmitAnswer}
                disabled={!currentText.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Antwort einreichen <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Final Exam Report */
        <div 
          className="glass-panel"
          style={{
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}
        >
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: finalResult.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            border: `2px solid ${finalResult.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
          }}>
            <Award size={36} color={finalResult.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)'} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>
            Prüfungsergebnis: {finalResult.summary}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '24px' }}>
            Erreichte Gesamtpunktzahl: {finalResult.totalScore} / {finalResult.maxPossibleScore} Punkte ({finalResult.percentage}%) • IHK-Note: {finalResult.grade}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '24px' }}>
            {ORAL_DEFENSE_QUESTIONS.map(q => {
              const res = evaluatedResults[q.id];
              const ans = userAnswers[q.id];
              return (
                <div key={q.id} style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '6px' }}>
                    <span>{q.topic}</span>
                    <span style={{ color: (res?.percentage || 0) >= 50 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {res?.score || 0} / {res?.maxScore || 10} Pkt
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '6px' }}>
                    "{ans || 'Keine Antwort eingegeben'}"
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    {res?.feedback}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <button className="btn btn-secondary" onClick={handleReset}>
              Fachgespräch wiederholen
            </button>
            {finalResult.passed && (
              <button 
                className="btn btn-primary" 
                onClick={handleClaimXP}
                disabled={xpClaimed}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {xpClaimed ? <Check size={16} /> : <Award size={16} />}
                {xpClaimed ? '50 XP Gutgeschrieben' : '50 XP Freischalten'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
