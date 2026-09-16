import React, { useState, useMemo } from 'react';

import { Cpu, Play, ShieldAlert, CheckCircle2, Layers, Clock, Sparkles, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { simulateScheduler, checkBankersSafety, requestBankersResources } from '../../utils/osSchedulerEngine';

const BANKER_MAX = [
  [7, 5, 3], // P0
  [3, 2, 2], // P1
  [9, 0, 2], // P2
  [2, 2, 2], // P3
  [4, 3, 3]  // P4
];

export default function OsProcessSchedulerLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('scheduler'); // 'scheduler' | 'banker'

  // Scheduler State
  const [algorithm, setAlgorithm] = useState('RR'); // FCFS, SJF, RR, Priority
  const [quantum, setQuantum] = useState(2);
  const [processes, setProcesses] = useState([
    { id: 1, name: 'P1 (Init/System)', arrival: 0, burst: 5, priority: 2, color: '#6366f1' },
    { id: 2, name: 'P2 (Web Server)', arrival: 1, burst: 4, priority: 1, color: '#10b981' },
    { id: 3, name: 'P3 (DB Worker)', arrival: 2, burst: 2, priority: 3, color: '#f59e0b' },
    { id: 4, name: 'P4 (Log Daemon)', arrival: 4, burst: 3, priority: 4, color: '#ec4899' }
  ]);

  // Banker's Algorithm State
  const [bankerAvailable, setBankerAvailable] = useState([3, 3, 2]); // R1, R2, R3
  const bankerMax = BANKER_MAX;
  const [bankerAlloc, setBankerAlloc] = useState([
    [0, 1, 0], // P0
    [2, 0, 0], // P1
    [3, 0, 2], // P2
    [2, 1, 1], // P3
    [0, 0, 2]  // P4
  ]);
  const [requestTargetProc, setRequestTargetProc] = useState(1);
  const [requestVector, setRequestVector] = useState([1, 0, 2]);
  const [bankerResultMsg, setBankerResultMsg] = useState(null);
  const [bankerXpClaimed, setBankerXpClaimed] = useState(false);
  const [schedulerXpClaimed, setSchedulerXpClaimed] = useState(false);

  // Run Scheduling Simulation
  const schedulerResult = useMemo(() => {
    return simulateScheduler(processes, algorithm, quantum);
  }, [processes, algorithm, quantum]);

  // Run Banker's Safety Check
  const bankerSafety = useMemo(() => {
    return checkBankersSafety(bankerAvailable, bankerMax, bankerAlloc);
  }, [bankerAvailable, bankerMax, bankerAlloc]);

  const handleAddProcess = () => {
    const nextId = processes.length ? Math.max(...processes.map(p => p.id)) + 1 : 1;
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#14b8a6'];
    const newProc = {
      id: nextId,
      name: `P${nextId} (Job)`,
      arrival: 0,
      burst: 3,
      priority: 2,
      color: colors[(nextId - 1) % colors.length]
    };
    setProcesses([...processes, newProc]);
  };

  const handleRemoveProcess = (id) => {
    if (processes.length <= 1) return;
    setProcesses(processes.filter(p => p.id !== id));
  };

  const handleBankerRequest = () => {
    const res = requestBankersResources(requestTargetProc, requestVector, bankerAvailable, bankerMax, bankerAlloc);
    if (res.success) {
      setBankerAvailable(res.newAvailable);
      setBankerAlloc(res.newAlloc);
      setBankerResultMsg({ type: 'success', text: res.message });
      if (!bankerXpClaimed) {
        setBankerXpClaimed(true);
        awardXP(35, 'banker_master');
      }
    } else {
      setBankerResultMsg({ type: 'error', text: res.reason });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Cpu size={14} /> Technische Informatik &amp; IHK LF 7/9</span>
              <span className="badge badge-teal"><Sparkles size={14} /> OS Process &amp; Concurrency Lab</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              OS Process Scheduler &amp; Deadlock Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Simuliere CPU-Scheduling-Algorithmen (FCFS, SJF, Round Robin, Priority) mit animiertem Gantt-Chart sowie den Bankier-Algorithmus (Banker's Algorithm) zur Vermeidung von Deadlocks.
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setActiveTab('scheduler')}
              className={`btn ${activeTab === 'scheduler' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            >
              <Clock size={16} /> CPU Scheduler &amp; Gantt
            </button>
            <button
              onClick={() => setActiveTab('banker')}
              className={`btn ${activeTab === 'banker' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            >
              <ShieldAlert size={16} /> Bankier-Algorithmus (Deadlock)
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'scheduler' ? (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Algorithmus
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'FCFS', label: 'FCFS' },
                      { id: 'SJF', label: 'SJF (Shortest Job)' },
                      { id: 'RR', label: 'Round Robin (RR)' },
                      { id: 'Priority', label: 'Priority' }
                    ].map(alg => (
                      <button
                        key={alg.id}
                        onClick={() => setAlgorithm(alg.id)}
                        className={`btn ${algorithm === alg.id ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        {alg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {algorithm === 'RR' && (
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Time Quantum: <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>{quantum} Ticks</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={quantum}
                      onChange={(e) => setQuantum(Number(e.target.value))}
                      style={{ width: '130px' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleAddProcess} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.88rem', gap: '6px' }}>
                  <Plus size={16} /> Prozess hinzufügen
                </button>
                <button
                  onClick={() => {
                    if (!schedulerXpClaimed) {
                      setSchedulerXpClaimed(true);
                      awardXP(25, 'scheduler_explored');
                    }
                  }}
                  disabled={schedulerXpClaimed}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.88rem', gap: '6px' }}
                >
                  <Play size={16} /> {schedulerXpClaimed ? 'Zeitablauf Berechnet!' : 'Zeitablauf Berechnen'}
                </button>
              </div>
            </div>
          </div>

          {/* Gantt Chart Visualizer */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-primary)" /> CPU Gantt-Diagramm (Ausführungs-Timeline)
            </h2>

            {/* Timeline Bar */}
            <div style={{ overflowX: 'auto', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', minWidth: '600px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {schedulerResult.timeline.map((slot, idx) => (
                  <div
                    key={idx}
                    title={`Zeit ${slot.time}: ${slot.name || slot.processId}`}
                    style={{
                      flex: 1,
                      minWidth: '32px',
                      height: '46px',
                      background: slot.processId === 'IDLE' ? 'var(--bg-tertiary)' : slot.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      borderRight: '1px solid rgba(255,255,255,0.15)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {slot.processId === 'IDLE' ? 'IDLE' : `P${slot.processId}`}
                  </div>
                ))}
              </div>

              {/* Timeline Time Ticks */}
              <div style={{ display: 'flex', minWidth: '600px', marginTop: '6px', justifyContent: 'space-between', padding: '0 4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {schedulerResult.timeline.map((slot, idx) => (
                  <span key={idx} style={{ flex: 1, minWidth: '32px', textAlign: 'left' }}>
                    t={slot.time}
                  </span>
                ))}
                <span>t={schedulerResult.timeline.length}</span>
              </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid-responsive" style={{ marginTop: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Durchschnittl. Wartezeit (T_wt)</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-teal)', marginTop: '4px' }}>
                  {schedulerResult.avgWaiting} Ticks
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Durchschnittl. Turnaround (T_tat)</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-indigo)', marginTop: '4px' }}>
                  {schedulerResult.avgTurnaround} Ticks
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>CPU-Auslastung</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  {schedulerResult.cpuUtilization}%
                </div>
              </div>
            </div>
          </div>

          {/* Process Table Configurator */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Prozess-Tabelle &amp; Parameter</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Prozess</th>
                    <th style={{ padding: '10px' }}>Ankunftszeit (Arrival)</th>
                    <th style={{ padding: '10px' }}>Burst-Zeit (Dauer)</th>
                    <th style={{ padding: '10px' }}>Priorität</th>
                    <th style={{ padding: '10px' }}>Wartezeit (T_wt)</th>
                    <th style={{ padding: '10px' }}>Turnaround (T_tat)</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map(p => {
                    const stats = schedulerResult.processStats.find(s => s.id === p.id) || {};
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px', fontWeight: '700' }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: p.color, marginRight: '8px' }} />
                          {p.name}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={p.arrival}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setProcesses(processes.map(x => x.id === p.id ? { ...x, arrival: val } : x));
                            }}
                            style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                          />
                        </td>
                        <td style={{ padding: '10px' }}>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={p.burst}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              setProcesses(processes.map(x => x.id === p.id ? { ...x, burst: val } : x));
                            }}
                            style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                          />
                        </td>
                        <td style={{ padding: '10px' }}>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={p.priority}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              setProcesses(processes.map(x => x.id === p.id ? { ...x, priority: val } : x));
                            }}
                            style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                          />
                        </td>
                        <td style={{ padding: '10px', color: 'var(--accent-teal)', fontWeight: '700' }}>
                          {stats.waitingTime ?? '-'}
                        </td>
                        <td style={{ padding: '10px', color: 'var(--accent-indigo)', fontWeight: '700' }}>
                          {stats.turnaroundTime ?? '-'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleRemoveProcess(p.id)}
                            className="btn btn-ghost"
                            style={{ padding: '4px 8px', color: 'var(--accent-rose)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* BANKER'S ALGORITHM TAB */
        <div className="space-y-6">
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} color="var(--accent-amber)" /> Bankier-Algorithmus (Deadlock-Vermeidung)
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Ermittelt, ob sich das System in einem sicheren Zustand (Safe State) befindet und eine Deadlock-freie Ausführungsreihenfolge existiert.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${bankerSafety.isSafe ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.95rem', padding: '6px 14px' }}>
                  {bankerSafety.isSafe ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                  Status: {bankerSafety.isSafe ? 'SICHER (Kein Deadlock)' : 'UNSICHER (Deadlock-Gefahr)'}
                </span>
              </div>
            </div>

            {/* Safe Sequence Banner */}
            {bankerSafety.isSafe && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)', padding: '14px 20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                <span style={{ fontWeight: '700', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} /> Sichere Ausführungsreihenfolge (Safe Sequence):
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap', fontFamily: 'monospace', fontWeight: '800', fontSize: '1.05rem' }}>
                  {bankerSafety.safeSequence.map((procIdx, i) => (
                    <React.Fragment key={procIdx}>
                      <span style={{ background: 'var(--bg-card)', padding: '4px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        P{procIdx}
                      </span>
                      {i < bankerSafety.safeSequence.length - 1 && <ArrowRight size={16} color="var(--accent-emerald)" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Matrices Grid */}
            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Allocation Matrix */}
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>Allocation Matrix (Aktuell belegt)</h3>
                <table style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)' }}>
                      <th>Prozess</th>
                      <th>R1</th>
                      <th>R2</th>
                      <th>R3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankerAlloc.map((row, pIdx) => (
                      <tr key={pIdx}>
                        <td style={{ fontWeight: '700', padding: '6px' }}>P{pIdx}</td>
                        {row.map((val, rIdx) => (
                          <td key={rIdx} style={{ padding: '6px' }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Max Matrix */}
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>Max Matrix (Maximalbedarf)</h3>
                <table style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)' }}>
                      <th>Prozess</th>
                      <th>R1</th>
                      <th>R2</th>
                      <th>R3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankerMax.map((row, pIdx) => (
                      <tr key={pIdx}>
                        <td style={{ fontWeight: '700', padding: '6px' }}>P{pIdx}</td>
                        {row.map((val, rIdx) => (
                          <td key={rIdx} style={{ padding: '6px' }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Need Matrix */}
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>Need Matrix (Restbedarf = Max - Alloc)</h3>
                <table style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)' }}>
                      <th>Prozess</th>
                      <th>R1</th>
                      <th>R2</th>
                      <th>R3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankerSafety.needMatrix.map((row, pIdx) => (
                      <tr key={pIdx}>
                        <td style={{ fontWeight: '700', padding: '6px' }}>P{pIdx}</td>
                        {row.map((val, rIdx) => (
                          <td key={rIdx} style={{ padding: '6px', color: 'var(--accent-teal)', fontWeight: '700' }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resource Request Simulator */}
            <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
                Dynamische Ressourcenanforderung simulieren
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Ziel-Prozess</label>
                  <select
                    value={requestTargetProc}
                    onChange={(e) => setRequestTargetProc(Number(e.target.value))}
                    style={{ display: 'block', padding: '6px 12px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', marginTop: '4px' }}
                  >
                    {bankerAlloc.map((_, idx) => (
                      <option key={idx} value={idx}>Prozess P{idx}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Ressourcen Vektor [R1, R2, R3]</label>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {requestVector.map((val, idx) => (
                      <input
                        key={idx}
                        type="number"
                        min="0"
                        max="10"
                        value={val}
                        onChange={(e) => {
                          const next = [...requestVector];
                          next[idx] = Math.max(0, parseInt(e.target.value) || 0);
                          setRequestVector(next);
                        }}
                        style={{ width: '50px', padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '18px' }}>
                  <button onClick={handleBankerRequest} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                    Anforderung testen &amp; Zuteilen
                  </button>
                </div>
              </div>

              {bankerResultMsg && (
                <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '6px', fontSize: '0.9rem', background: bankerResultMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: bankerResultMsg.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)', border: `1px solid ${bankerResultMsg.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}` }}>
                  {bankerResultMsg.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
