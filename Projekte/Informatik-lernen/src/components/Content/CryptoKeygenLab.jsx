import React, { useState } from 'react';

import { ShieldCheck, Key, ArrowRight, RotateCcw, CheckCircle2, Zap } from 'lucide-react';
import { RSA_CRYPTO_STEPS } from '../../data/expertLabsData';
import { useStore } from '../../store/useStore';
import { onActivationKey } from '../Shared/keyActivation';

export default function CryptoKeygenLab() {
  const { awardXP } = useStore();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStep = RSA_CRYPTO_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < RSA_CRYPTO_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else if (!isCompleted) {
      setIsCompleted(true);
      awardXP(80, 'Kryptographie Meister: RSA & Diffie-Hellman');
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsCompleted(false);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '20px', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Key size={16} /> Asymmetrische Public-Key Kryptographie & Modulare Arithmetik
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            RSA Keygen & Diffie-Hellman Math Lab
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Erlebe die Mathematik hinter RSA: Primzahlengenerierung, Eulersche Totientenfunktion φ(n), Inverse Modulo-Exponenten und Chiffrierung.
          </p>
        </div>

        {/* Progress Badge */}
        <div style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="#fbbf24" /> Schritt {currentStepIdx + 1} / {RSA_CRYPTO_STEPS.length}
        </div>
      </div>

      {/* Pipeline Stepper */}
      <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, var(--border-color))', padding: '16px', marginBottom: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', minWidth: '600px' }}>
          {RSA_CRYPTO_STEPS.map((s, idx) => {
            const isActive = idx === currentStepIdx;
            const isPassed = idx < currentStepIdx;
            return (
              <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => setCurrentStepIdx(idx))}
                key={s.step}
                onClick={() => setCurrentStepIdx(idx)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '8px',
                  background: isActive ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : isPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid #818cf8' : isPassed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                  color: isActive ? 'var(--text-main)' : isPassed ? 'var(--accent-emerald)' : 'var(--text-dim)',
                  fontSize: '0.78rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Schritt {s.step}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{s.title.split('.')[1]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Calculation Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: Math Details */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                RSA Algorithmus
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontFamily: 'monospace' }}>
                Einwegfunktion (Trapdoor)
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 12px 0' }}>
              {currentStep.title}
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '16px' }}>
              {currentStep.desc}
            </p>

            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', color: 'var(--accent-emerald)', lineHeight: '1.6', marginBottom: '16px', whiteSpace: 'pre-line' }}>
              {currentStep.math}
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              💡 <strong>Hintergrund:</strong> {currentStep.detail}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: isCompleted ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                border: 'none',
                color: 'var(--text-on-accent)',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
            >
              {isCompleted ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              {isCompleted ? 'Schlüsselpaar verifiziert (+80 XP)' : 'Nächster mathematischer Schritt'}
            </button>
          </div>
        </div>

        {/* Right: Key Pair Summary */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, var(--border-color))', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={17} color="#4ade80" /> Generiertes RSA Schlüsselpaar
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '0.88rem', marginBottom: '4px' }}>
                  🌐 Öffentlicher Schlüssel (Public Key):
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  e = 17, n = 3233 (wird an Kommunikationspartner verteilt)
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ color: 'var(--accent-rose)', fontWeight: 'bold', fontSize: '0.88rem', marginBottom: '4px' }}>
                  🔒 Privater Schlüssel (Private Key - GEHEIM):
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  d = 2753, n = 3233 (verbleibt sicher im Keyring / HSM)
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
            💡 <strong>IHK & Uni Wissen:</strong> Moderne Web-Verschlüsselung (TLS 1.3) nutzt RSA primär zur Signaturprüfung von Zertifikaten und setzt für den eigentlichen Schlüsseltausch auf **ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)** wegen Perfect Forward Secrecy (PFS).
          </div>
        </div>

      </div>
    </div>
  );
}
