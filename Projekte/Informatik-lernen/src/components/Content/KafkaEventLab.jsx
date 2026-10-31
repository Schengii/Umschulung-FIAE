import React, { useMemo, useState } from 'react';
import { Network, Send, Download, RotateCcw, CheckCircle2, Circle, Award } from 'lucide-react';
import { KAFKA_PATTERNS } from '../../data/kafkaData';
import {
  createTopic,
  produce,
  assignPartitions,
  pollGroup,
  consumerLag,
  groupOffsets,
  partitionsByKey,
  repartition,
  KAFKA_DRILL_QUESTIONS
} from '../../utils/kafkaEventEngine';
import LabDrillSection from '../Shared/LabDrillSection';
import SourceList from '../Shared/SourceList';

const KEYS = ['kunde-1', 'kunde-2', 'kunde-3', 'kunde-4'];
const KEY_COLORS = { 'kunde-1': 'var(--accent-primary)', 'kunde-2': 'var(--accent-teal)', 'kunde-3': 'var(--accent-amber)', 'kunde-4': 'var(--accent-rose)' };
const GROUPS = [
  { id: 'payment', label: 'payment-service', accent: 'var(--accent-primary)' },
  { id: 'analytics', label: 'analytics-service', accent: 'var(--accent-purple)' }
];
const XP = 50;

const SOURCES = [
  { title: 'Apache Kafka – Introduction', url: 'https://kafka.apache.org/intro', note: 'Topics, Partitionen, Schlüssel → Partition, Retention („events are not deleted after consumption“)' },
  { title: 'Apache Kafka 4.3 – Design', url: 'https://kafka.apache.org/43/design/design/', note: 'Partition je Gruppe genau einem Consumer, Position = ein Offset je Partition, Ordnung nur innerhalb einer Partition' },
  { title: 'KafkaConsumer (Kafka 4.2 API)', url: 'https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html', note: 'Consumer Groups, Lastverteilung und Rebalancing' },
  { title: 'Kafka Producer Configs', url: 'https://kafka.apache.org/41/configuration/producer-configs/', note: 'Partitionierung über den Hash des Schlüssels (partitioner.ignore.keys)' },
  { title: 'KIP-480: Sticky Partitioner', url: 'https://cwiki.apache.org/confluence/display/KAFKA/KIP-480:+Sticky+Partitioner', note: 'Verteilung von Events ohne Schlüssel (hier vereinfacht als Round-Robin)' },
  { title: 'Obsidian-Vault: ADR „Kafka statt NATS für Event-Broker“', note: 'Projekt event_relay – Persistenz und Replay als Entscheidungsgrund, dafür höhere Betriebskomplexität (KRaft/ZooKeeper)' }
];

function Step({ done, children }) {
  return (
    <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: done ? 'var(--text-main)' : 'var(--text-muted)' }}>
      {done ? <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: 2 }} /> : <Circle size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
      <span>{children}</span>
    </li>
  );
}

export default function KafkaEventLab({ onRewardXP }) {
  const [topic, setTopic] = useState(() => createTopic(3));
  const [key, setKey] = useState(KEYS[0]);
  const [counter, setCounter] = useState(1);
  const [consumers, setConsumers] = useState({ payment: 2, analytics: 1 });
  const [lastDeliveries, setLastDeliveries] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);
  const [goals, setGoals] = useState({ produced: false, idle: false, fanout: false, repartitioned: false });
  const [xpClaimed, setXpClaimed] = useState(false);

  const partitionCount = topic.partitions.length;
  const consumerIds = (g) => Array.from({ length: consumers[g] }, (_, i) => `${g}-c${i + 1}`);
  const keyMap = useMemo(() => partitionsByKey(topic), [topic]);
  const totalEvents = topic.partitions.reduce((n, l) => n + l.length, 0);
  const allGoals = Object.values(goals).every(Boolean);

  const sendEvent = (k) => {
    const value = `order#${counter}`;
    const res = produce(topic, { key: k, value });
    setTopic(res.topic);
    setCounter((c) => c + 1);
    setLastEvent({ key: k, value, partition: res.partition, offset: res.offset });
    if (totalEvents + 1 >= 5) setGoals((g) => ({ ...g, produced: true }));
  };

  const sendBurst = () => {
    let t = topic;
    let c = counter;
    for (let i = 0; i < 6; i++) {
      t = produce(t, { key: KEYS[i % KEYS.length], value: `order#${c++}` }).topic;
    }
    setTopic(t);
    setCounter(c);
    setLastEvent(null);
    setGoals((g) => ({ ...g, produced: true }));
  };

  const poll = (groupId) => {
    const res = pollGroup(topic, groupId, consumerIds(groupId), 2);
    setTopic(res.topic);
    setLastDeliveries(res.deliveries.map((d) => ({ ...d, groupId })));
    const other = GROUPS.find((g) => g.id !== groupId).id;
    if (res.deliveries.length && groupOffsets(res.topic, other).some((o) => o > 0)) setGoals((g) => ({ ...g, fanout: true }));
  };

  const changeConsumers = (groupId, n) => {
    setConsumers((c) => ({ ...c, [groupId]: n }));
    if (n > partitionCount) setGoals((g) => ({ ...g, idle: true }));
  };

  const changePartitions = (n) => {
    setTopic(repartition(topic, n));
    setLastDeliveries([]);
    setLastEvent(null);
    if (totalEvents > 0) setGoals((g) => ({ ...g, repartitioned: true }));
    if (Math.max(consumers.payment, consumers.analytics) > n) setGoals((g) => ({ ...g, idle: true }));
  };

  const reset = () => {
    setTopic(createTopic(3));
    setCounter(1);
    setLastDeliveries([]);
    setLastEvent(null);
  };

  const claimXp = () => {
    if (xpClaimed || !allGoals) return;
    setXpClaimed(true);
    if (onRewardXP) onRewardXP(XP);
  };

  const pattern = KAFKA_PATTERNS[0];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-teal)' }}>
        <span className="badge badge-teal" style={{ marginBottom: '10px' }}>Verteilte Systeme · Vertiefung AP2</span>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 800, margin: '8px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Network size={30} style={{ color: 'var(--accent-teal)' }} /> Event-Streaming mit Apache Kafka
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, lineHeight: 1.6 }}>
          Schicke Bestell-Events in ein Topic, beobachte, in welcher Partition sie landen, und lass zwei Consumer Groups unabhängig voneinander lesen.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '22px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>Das Wichtigste in 60 Sekunden</h2>
        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          <li><strong style={{ color: 'var(--text-main)' }}>Topic</strong> = benannter Event-Strom, aufgeteilt in <strong style={{ color: 'var(--text-main)' }}>Partitionen</strong>. Jede Partition ist ein Log, an das nur angehängt wird; jedes Event bekommt dort einen fortlaufenden <strong style={{ color: 'var(--text-main)' }}>Offset</strong>.</li>
          <li><strong style={{ color: 'var(--text-main)' }}>Schlüssel</strong> bestimmen die Partition: hash(key) mod Partitionsanzahl. Gleicher Schlüssel → gleiche Partition → feste Reihenfolge. Über Partitionen hinweg gibt es <em>keine</em> Reihenfolge.</li>
          <li>Eine <strong style={{ color: 'var(--text-main)' }}>Consumer Group</strong> teilt sich die Partitionen: jede Partition liest genau ein Consumer der Gruppe. Mehr Consumer als Partitionen bleiben untätig.</li>
          <li>Lesen löscht nichts. Jede Gruppe merkt sich ihren eigenen Offset; Events verschwinden erst nach Ablauf der <strong style={{ color: 'var(--text-main)' }}>Retention</strong>.</li>
        </ul>
      </div>

      <div className="grid-responsive" style={{ gap: '20px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-main)' }}>1. Producer</h2>
          <label htmlFor="kafka-key" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Schlüssel (Kunden-ID)</label>
          <select id="kafka-key" value={key} onChange={(e) => setKey(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-main)', marginBottom: '12px' }}>
            {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
            <option value="">(ohne Schlüssel)</option>
          </select>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => sendEvent(key || null)}><Send size={14} /> Event senden</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={sendBurst}>6 Events (alle Kunden)</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={reset}><RotateCcw size={14} /> Topic leeren</button>
          </div>
          <p aria-live="polite" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px', minHeight: '1.3em' }}>
            {lastEvent && <>„{lastEvent.value}“ ({lastEvent.key || 'ohne Schlüssel'}) → Partition {lastEvent.partition}, Offset {lastEvent.offset}</>}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-main)' }}>2. Topic „orders“</h2>
          <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Partitionen</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} role="group" aria-label="Anzahl Partitionen">
            {[1, 2, 3, 4, 6].map((n) => (
              <button key={n} type="button" className={`btn btn-sm ${n === partitionCount ? 'btn-primary' : 'btn-secondary'}`} aria-pressed={n === partitionCount} onClick={() => changePartitions(n)}>{n}</button>
            ))}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '10px', lineHeight: 1.5 }}>
            Ändern spielt alle Events neu ein. So siehst du, wie sich die Zuordnung Schlüssel → Partition verschiebt. Im echten Kafka bleiben alte Events in ihrer Partition – nur neue landen anders.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-main)' }}>Partitions-Logs ({totalEvents} Events)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {topic.partitions.map((log, p) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <strong style={{ width: '42px', flexShrink: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>P{p}</strong>
              <div role="region" aria-label={`Partition ${p}`} style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '6px', borderRadius: '8px', background: 'var(--bg-tertiary)', flex: 1, minHeight: '44px', minWidth: 0 }}>
                {log.length === 0 && <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', alignSelf: 'center' }}>leer</span>}
                {log.map((r) => {
                  const markers = GROUPS.filter((g) => groupOffsets(topic, g.id)[p] === r.offset);
                  return (
                    <div key={r.offset} title={`${r.value} · ${r.key || 'ohne Schlüssel'}`} style={{ flexShrink: 0, padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: `2px solid ${r.key ? KEY_COLORS[r.key] : 'var(--border-color)'}`, background: 'var(--bg-card)', color: 'var(--text-main)', position: 'relative' }}>
                      <div style={{ fontWeight: 700 }}>#{r.offset}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{r.key || '—'}</div>
                      {markers.length > 0 && <div style={{ fontSize: '0.65rem', color: markers[0].accent, fontWeight: 700 }}>▲ {markers.map((m) => m.id).join(', ')}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '10px' }}>▲ markiert das nächste Event, das die Gruppe lesen wird (committeter Offset).</p>
        {Object.keys(keyMap).length > 0 && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Ordnungsgarantie: {Object.entries(keyMap).map(([k, ps]) => `${k} → P${ps.join('/P')}`).join(' · ')}
          </p>
        )}
      </div>

      <div className="grid-responsive" style={{ gap: '20px', marginBottom: '24px' }}>
        {GROUPS.map((g) => {
          const ids = consumerIds(g.id);
          const assignment = assignPartitions(partitionCount, ids);
          const lag = consumerLag(topic, g.id);
          return (
            <div key={g.id} className="glass-panel" style={{ padding: '20px', borderTop: `4px solid ${g.accent}` }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)' }}>3. Consumer Group „{g.label}“</h2>
              <label htmlFor={`kafka-consumers-${g.id}`} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Consumer: {consumers[g.id]}</label>
              <input id={`kafka-consumers-${g.id}`} type="range" min={1} max={6} value={consumers[g.id]} onChange={(e) => changeConsumers(g.id, Number(e.target.value))} style={{ width: '100%' }} />
              <ul style={{ listStyle: 'none', margin: '10px 0', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {ids.map((id) => (
                  <li key={id} style={{ color: assignment[id].length ? 'var(--text-main)' : 'var(--accent-amber)' }}>
                    {id}: {assignment[id].length ? `P${assignment[id].join(', P')}` : 'keine Partition (idle)'}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>Lag: <strong style={{ color: lag.total ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{lag.total}</strong> ungelesene Events</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => poll(g.id)}><Download size={14} /> poll() – bis zu 2 Events je Partition</button>
            </div>
          );
        })}
      </div>

      {lastDeliveries.length > 0 && (
        <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px' }} aria-live="polite">
          <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Zuletzt geliefert ({lastDeliveries[0].groupId}):</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {lastDeliveries.map((d) => <li key={`${d.partition}-${d.record.offset}`}>{d.consumer} ← P{d.partition} #{d.record.offset}: {d.record.value} ({d.record.key || 'ohne Schlüssel'})</li>)}
          </ul>
        </div>
      )}

      <div className="grid-responsive" style={{ gap: '20px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>Aufgaben</h2>
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <Step done={goals.produced}>Sende mindestens 5 Events. Prüfe: Landet jeder Kunde immer in derselben Partition?</Step>
            <Step done={goals.idle}>Stelle mehr Consumer ein, als es Partitionen gibt. Was machen die überzähligen?</Step>
            <Step done={goals.fanout}>Lass beide Gruppen lesen. Warum fehlen „analytics“ keine Events, obwohl „payment“ sie schon gelesen hat?</Step>
            <Step done={goals.repartitioned}>Ändere die Partitionsanzahl bei vorhandenen Events. Welche Kunden wechseln die Partition?</Step>
          </ol>
          <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: '14px' }} disabled={!allGoals || xpClaimed} onClick={claimXp}>
            <Award size={14} /> {xpClaimed ? `${XP} XP erhalten` : `${XP} XP abholen`}
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>Kafka oder Message Queue?</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <thead>
                <tr style={{ color: 'var(--text-main)', textAlign: 'left' }}><th style={{ padding: '6px' }}>Merkmal</th><th style={{ padding: '6px' }}>Kafka (Log)</th><th style={{ padding: '6px' }}>Queue (z. B. RabbitMQ)</th></tr>
              </thead>
              <tbody>
                {[
                  ['Nach dem Lesen', 'bleibt bis Retention-Ende', 'wird nach Ack entfernt'],
                  ['Mehrere Empfänger', 'je Gruppe eigener Offset', 'je Empfänger eigene Queue'],
                  ['Replay', 'Offset zurücksetzen', 'nicht vorgesehen'],
                  ['Reihenfolge', 'je Partition', 'je Queue'],
                  ['Typisch', 'Event-Streaming, Logs, CDC', 'Aufgaben verteilen, RPC']
                ].map((row) => (
                  <tr key={row[0]} style={{ borderTop: '1px solid var(--border-color)' }}>{row.map((c, i) => <td key={i} style={{ padding: '6px', color: i === 0 ? 'var(--text-main)' : undefined }}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid-responsive" style={{ gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', minWidth: 0 }}>
          <span className="badge badge-teal" style={{ marginBottom: '10px' }}>Producer (KafkaJS)</span>
          <div className="code-window"><pre className="code-body"><code>{pattern.producerCode}</code></pre></div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', minWidth: 0 }}>
          <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>Consumer Group (KafkaJS)</span>
          <div className="code-window"><pre className="code-body"><code>{pattern.consumerCode}</code></pre></div>
        </div>
      </div>

      <LabDrillSection title="IHK-Drill: Event-Streaming mit Kafka" questions={KAFKA_DRILL_QUESTIONS} />
      <SourceList sources={SOURCES} checkedOn="29.10.2026" />
    </div>
  );
}
