import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Key, EyeOff, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { EllipticCurve, simulateSchnorrZkp } from '../../utils/zkpCryptoEngine';

const ORDER_N = 19n;
const PRIVATE_KEY_X = 7n; // Secret
const G = [5n, 1n];

export default function ZkpCryptoVisualizerLab() {
  const { awardXP } = useStore();
  const [step, setStep] = useState(0);
  const [zkpData, setZkpData] = useState(null);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Setup our simple curve (memoized: a fresh instance every render would
  // re-trigger the effect below on every store update, since awardXP()
  // itself updates the store this component is subscribed to)
  const curve = useMemo(() => new EllipticCurve(2n, 2n, 17n), []);

  useEffect(() => {
    if (step === 1 && !zkpData) {
      const data = simulateSchnorrZkp(curve, G, ORDER_N, PRIVATE_KEY_X);
      setZkpData(data);
    }
    if (step === 4 && !xpClaimed) {
      setXpClaimed(true);
      awardXP(45, 'Zero-Knowledge Proof Verifier');
    }
  }, [step, zkpData, curve, xpClaimed, awardXP]);

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const reset = () => {
    setStep(0);
    setZkpData(null);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <EyeOff size={28} color="var(--accent-purple)" />
          Kryptographie & Zero-Knowledge Proof (ZKP) Visualizer
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Simulation des interaktiven Schnorr-Protokolls. Alice (Prover) beweist Bob (Verifier), dass sie einen privaten Schlüssel <strong style={{ color: 'var(--accent-red)' }}>x</strong> besitzt, ohne diesen zu enthüllen.
          Verwendet wird Elliptische Kurven Kryptographie (ECC).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Alice (Prover) */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', borderTop: '4px solid var(--accent-purple)' }}>
          <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Key size={20} color="var(--accent-purple)" /> Alice (Prover)
          </h2>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Geheimnis & Schlüssel:</div>
            <div>Privater Schlüssel <strong>x = {privateKeyX.toString()}</strong> <span style={{ color: 'var(--accent-red)', fontSize: '0.8rem' }}>(Streng geheim)</span></div>
            <div>Öffentlicher Schlüssel <strong>Y = x * G</strong></div>
          </div>

          <div style={{ minHeight: '200px' }}>
            {step >= 1 && zkpData && (
              <div className="fade-in" style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid var(--accent-purple)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                <div style={{ fontWeight: '600' }}>Schritt 1: Commitment (R) generieren</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Alice wählt ein zufälliges <strong>k = {zkpData.k.toString()}</strong></div>
                <div>Berechnet <strong>R = k * G = ({zkpData.R[0].toString()}, {zkpData.R[1].toString()})</strong></div>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-purple)' }}><ArrowRight size={14} style={{ verticalAlign: 'middle' }}/> Sendet R an Bob</div>
              </div>
            )}
            
            {step >= 3 && zkpData && (
              <div className="fade-in" style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid var(--accent-purple)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: '600' }}>Schritt 3: Response (s) berechnen</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Alice berechnet die Antwort auf Basis von Bobs Challenge <strong>c = {zkpData.c.toString()}</strong></div>
                <div><strong>s = (k + c * x) mod n = {zkpData.s.toString()}</strong></div>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-purple)' }}><ArrowRight size={14} style={{ verticalAlign: 'middle' }}/> Sendet s an Bob</div>
              </div>
            )}
          </div>
        </div>

        {/* Bob (Verifier) */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', borderTop: '4px solid var(--accent-blue)' }}>
          <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Shield size={20} color="var(--accent-blue)" /> Bob (Verifier)
          </h2>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Bekannte Parameter:</div>
            <div>Basis-Punkt <strong>G = ({G[0].toString()}, {G[1].toString()})</strong></div>
            <div>Alices Öffentlicher Schlüssel <strong>Y = ({zkpData?.Y[0].toString() || '?'}, {zkpData?.Y[1].toString() || '?'})</strong></div>
          </div>

          <div style={{ minHeight: '200px' }}>
            {step >= 2 && zkpData && (
              <div className="fade-in" style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent-blue)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                <div style={{ fontWeight: '600' }}>Schritt 2: Challenge (c) senden</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Bob wählt eine zufällige Challenge <strong>c = {zkpData.c.toString()}</strong></div>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-blue)' }}><ArrowRight size={14} style={{ verticalAlign: 'middle' }}/> Sendet c an Alice</div>
              </div>
            )}
            
            {step >= 4 && zkpData && (
              <div className="fade-in" style={{ padding: '12px', background: zkpData.isValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${zkpData.isValid ? 'var(--accent-green)' : 'var(--accent-red)'}`, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: '600' }}>Schritt 4: ZKP Verifikation</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Bob verifiziert, ohne x zu kennen:</div>
                <div>Prüft ob: <strong>s * G == R + c * Y</strong></div>
                <div style={{ fontSize: '0.85rem', marginTop: '8px', fontFamily: 'monospace' }}>
                  s*G = ({zkpData.sG[0].toString()}, {zkpData.sG[1].toString()})<br/>
                  R+cY = ({zkpData.checkR[0].toString()}, {zkpData.checkR[1].toString()})
                </div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: zkpData.isValid ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {zkpData.isValid ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                  {zkpData.isValid ? 'Beweis gültig! Alice kennt x.' : 'Beweis ungültig!'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
        {step < 4 ? (
          <button onClick={nextStep} className="action-button primary" style={{ padding: '12px 24px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Nächster ZKP-Schritt <ArrowRight size={18} />
          </button>
        ) : (
          <button onClick={reset} className="action-button secondary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
            Simulation neustarten
          </button>
        )}
      </div>
    </div>
  );
}
