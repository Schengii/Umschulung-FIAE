import React, { useState, useMemo } from 'react';

import { Headphones, AlertCircle, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ITSM_INITIAL_TICKETS, evaluateCabRiskScore } from '../../utils/itsmEngine';

export default function ItsmSimulatorLab() {
  const { awardXP } = useStore();
  const [tickets, setTickets] = useState(ITSM_INITIAL_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState('INC-1042');

  // CAB Risk Calculator State
  const [cabComplexity, setCabComplexity] = useState(4); // 1 - 5
  const [cabRollback, setCabRollback] = useState(4); // 1 - 5 (5 = easy rollback)
  const [cabBusinessImpact, setCabBusinessImpact] = useState(4); // 1 - 5

  const selectedTicket = useMemo(() => {
    return tickets.find(t => t.id === selectedTicketId) || tickets[0];
  }, [tickets, selectedTicketId]);

  const cabRisk = useMemo(() => {
    return evaluateCabRiskScore({
      technicalComplexity: cabComplexity,
      rollbackFeasibility: cabRollback,
      businessImpact: cabBusinessImpact
    });
  }, [cabComplexity, cabRollback, cabBusinessImpact]);

  const handleResolveTicket = (ticketId) => {
    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'Resolved / Closed' };
      }
      return t;
    }));
    awardXP(25, 'itsm_ticket_resolved');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Headphones size={14} /> ITIL 4 &amp; ITSM</span>
              <span className="badge badge-teal"><Sparkles size={14} /> Service Desk &amp; Change Advisory Board</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              ITIL 4 ITSM &amp; Service Desk Management Simulator
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Bearbeite Incidents, Service Requests und Changes mit SLA-Priorisierungsmatrix (Impact $\times$ Urgency) und bewerte Change Requests im Change Advisory Board (CAB).
            </p>
          </div>
        </div>
      </div>

      {/* 2-Pane: Ticket Queue + Ticket Detail / CAB */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'minmax(340px, 1fr) minmax(380px, 1.2fr)', gap: '20px' }}>
        {/* Ticket Queue */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="var(--accent-amber)" /> Aktive Service-Desk Warteschlange ({tickets.filter(t => t.status !== 'Resolved / Closed').length})
          </h2>

          <div className="space-y-3">
            {tickets.map(ticket => {
              const isSelected = selectedTicketId === ticket.id;
              const isResolved = ticket.status === 'Resolved / Closed';

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    opacity: isResolved ? 0.6 : 1.0,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>{ticket.id}</span>
                      <span style={{ fontWeight: '800', fontSize: '0.78rem', color: ticket.priority.startsWith('P1') ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                        {ticket.priority}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: isResolved ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      {isResolved ? '✓ Gelöst' : `SLA: ${ticket.slaMinutesRemaining}m`}
                    </span>
                  </div>

                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    {ticket.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Ticket Inspector & Resolution */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div>
              <span className="badge badge-teal" style={{ marginBottom: '6px' }}>{selectedTicket.type}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{selectedTicket.id}: {selectedTicket.title}</h2>
            </div>

            {selectedTicket.status !== 'Resolved / Closed' ? (
              <button
                onClick={() => handleResolveTicket(selectedTicket.id)}
                className="btn btn-primary"
                style={{ padding: '8px 14px', fontSize: '0.85rem', gap: '6px' }}
              >
                <Check size={16} /> Ticket Lösen
              </button>
            ) : (
              <span className="badge badge-emerald">✓ Gelöst</span>
            )}
          </div>

          <div className="space-y-4" style={{ fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Kategorie:</span>
                <strong>{selectedTicket.category}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Auswirkung (Impact):</span>
                <strong>{selectedTicket.impact}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Dringlichkeit (Urgency):</span>
                <strong>{selectedTicket.urgency}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontWeight: '700', color: 'var(--accent-teal)', display: 'block', marginBottom: '4px' }}>
                💡 Empfohlene Lösung / Remediation:
              </span>
              <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.5' }}>
                {selectedTicket.solution}
              </p>
            </div>

            {/* Change Advisory Board (CAB) Risk Matrix */}
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--accent-indigo)" /> CAB Change-Risiko-Bewertung
              </h3>

              <div className="space-y-3">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span>Technische Komplexität</span>
                    <strong>{cabComplexity} / 5</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={cabComplexity}
                    onChange={(e) => setCabComplexity(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span>Rollback-Machbarkeit (5 = Sofortiges automatisches Rollback)</span>
                    <strong>{cabRollback} / 5</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={cabRollback}
                    onChange={(e) => setCabRollback(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span>Geschäftliche Auswirkung (Business Impact)</span>
                    <strong>{cabBusinessImpact} / 5</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={cabBusinessImpact}
                    onChange={(e) => setCabBusinessImpact(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>CAB Risiko-Einstufung:</span>
                  <span style={{ fontWeight: '800', color: cabRisk.score > 3.5 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                    Score {cabRisk.score}: {cabRisk.riskTier}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
