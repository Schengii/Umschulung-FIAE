import React, { useState } from 'react';
import { SUBNETTING_QUIZ, NETWORK_CHEAT_SHEET } from '../../data/subnettingData';
import { Network, Calculator, HelpCircle, Award } from 'lucide-react';

export default function SubnettingLab({ onRewardXP }) {
  const [ipAddress, setIpAddress] = useState('192.168.1.100');
  const [cidr, setCidr] = useState(24);
  const [activeTab, setActiveTab] = useState('calc'); // 'calc' | 'quiz' | 'cheat'
  
  // Quiz State
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Helper Subnet Calculator Logic
  const calculateSubnet = (ip, prefix) => {
    try {
      const octets = ip.split('.').map(Number);
      if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) {
        return null;
      }
      
      const maskBinary = '1'.repeat(prefix) + '0'.repeat(32 - prefix);
      const maskOctets = [
        parseInt(maskBinary.substring(0, 8), 2),
        parseInt(maskBinary.substring(8, 16), 2),
        parseInt(maskBinary.substring(16, 24), 2),
        parseInt(maskBinary.substring(24, 32), 2)
      ];

      const netOctets = octets.map((o, i) => o & maskOctets[i]);
      const wildOctets = maskOctets.map(o => 255 - o);
      const broadcastOctets = netOctets.map((o, i) => o | wildOctets[i]);

      const totalIps = Math.pow(2, 32 - prefix);
      const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : totalIps - 2;

      const firstHost = [...netOctets];
      if (prefix < 31) firstHost[3] += 1;
      
      const lastHost = [...broadcastOctets];
      if (prefix < 31) lastHost[3] -= 1;

      return {
        mask: maskOctets.join('.'),
        networkId: netOctets.join('.'),
        broadcast: broadcastOctets.join('.'),
        firstHost: firstHost.join('.'),
        lastHost: lastHost.join('.'),
        totalIps,
        usableHosts,
        binaryMask: maskOctets.map(o => o.toString(2).padStart(8, '0')).join('.')
      };
    } catch {
      return null;
    }
  };

  const result = calculateSubnet(ipAddress, Number(cidr));

  const handleAnswer = (optionIdx) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);
    if (optionIdx === SUBNETTING_QUIZ[currentQuizIdx].correct) {
      setScore(score + 1);
      if (onRewardXP) onRewardXP(25);
    }
  };

  const nextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    if (currentQuizIdx + 1 < SUBNETTING_QUIZ.length) {
      setCurrentQuizIdx(currentQuizIdx + 1);
    } else {
      setCurrentQuizIdx(0);
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <Network size={14} /> Systemintegration & Netzwerke (IHK LF 4/7)
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🌐 CIDR Subnetting & Network Calculator Lab
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Interaktive Subnetz-Berechnung, Host-Range Analyse & IHK-Prüfungstraining.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('calc')}
            className={`btn ${activeTab === 'calc' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.9rem' }}
          >
            <Calculator size={16} /> Rechner & Visualisierer
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.9rem' }}
          >
            <HelpCircle size={16} /> IHK Übungs-Quiz
          </button>
          <button
            onClick={() => setActiveTab('cheat')}
            className={`btn ${activeTab === 'cheat' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.9rem' }}
          >
            <Award size={16} /> Spickzettel & Masken
          </button>
        </div>
      </div>

      {/* CALCULATOR TAB */}
      {activeTab === 'calc' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                IP-Adresse (IPv4)
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.100"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                Subnetzmaske Prefix: /{cidr}
              </label>
              <input
                type="range"
                min="8"
                max="30"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-indigo)' }}
              />
            </div>
          </div>

          {result ? (
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: 'var(--accent-indigo)' }}>
                📊 Analyse-Ergebnisse für {ipAddress}/{cidr}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Netz-ID (Network ID)</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>{result.networkId}</div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Broadcast-Adresse</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-amber, #f59e0b)' }}>{result.broadcast}</div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Subnetzmaske</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{result.mask}</div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nutzbare Hosts</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>{result.usableHosts.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <strong style={{ color: 'var(--text-main)' }}>Host-Adressbereich: </strong>
                <span style={{ color: 'var(--text-muted)' }}>{result.firstHost} bis {result.lastHost}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Binärmaske</span>
                <code style={{ background: '#0f172a', color: '#38bdf8', padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'block', fontSize: '0.9rem' }}>
                  {result.binaryMask}
                </code>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', color: 'var(--accent-rose)', background: 'rgba(244,63,94,0.1)', borderRadius: 'var(--radius-md)' }}>
              Ungültige IP-Adresse eingegeben. Bitte Format `XXX.XXX.XXX.XXX` verwenden.
            </div>
          )}
        </div>
      )}

      {/* QUIZ TAB */}
      {activeTab === 'quiz' && (
        <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Frage {currentQuizIdx + 1} von {SUBNETTING_QUIZ.length}</span>
            <span className="badge badge-indigo">Score: {score} Punkte</span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-main)' }}>
            {SUBNETTING_QUIZ[currentQuizIdx].question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {SUBNETTING_QUIZ[currentQuizIdx].options.map((opt, idx) => {
              let bg = 'var(--bg-card)';
              let border = '1px solid var(--border-color)';
              if (isAnswered) {
                if (idx === SUBNETTING_QUIZ[currentQuizIdx].correct) {
                  bg = 'rgba(16,185,129,0.15)';
                  border = '2px solid var(--accent-emerald)';
                } else if (selectedOption === idx) {
                  bg = 'rgba(244,63,94,0.15)';
                  border = '2px solid var(--accent-rose)';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: bg,
                    border: border,
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    cursor: isAnswered ? 'default' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', marginBottom: '16px', borderLeft: '4px solid var(--accent-indigo)' }}>
                <strong>Erklärung: </strong> {SUBNETTING_QUIZ[currentQuizIdx].explanation}
              </div>
              <button className="btn btn-primary" onClick={nextQuestion}>
                Nächste Frage
              </button>
            </div>
          )}
        </div>
      )}

      {/* CHEAT SHEET TAB */}
      {activeTab === 'cheat' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>CIDR</th>
                <th style={{ padding: '12px' }}>Subnetzmaske</th>
                <th style={{ padding: '12px' }}>Gesamt IPs</th>
                <th style={{ padding: '12px' }}>Nutzbare Hosts</th>
                <th style={{ padding: '12px' }}>Einsatzbereich</th>
              </tr>
            </thead>
            <tbody>
              {NETWORK_CHEAT_SHEET.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: '800', color: 'var(--accent-indigo)' }}>{row.cidr}</td>
                  <td style={{ padding: '12px' }}><code>{row.mask}</code></td>
                  <td style={{ padding: '12px' }}>{row.totalIps}</td>
                  <td style={{ padding: '12px', fontWeight: '700', color: 'var(--accent-emerald)' }}>{row.usableHosts}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{row.useCase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
