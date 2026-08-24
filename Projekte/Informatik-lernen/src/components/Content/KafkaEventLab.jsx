import React, { useState } from 'react';
import { KAFKA_PATTERNS } from '../../data/kafkaData';
import { Network, RefreshCw, Send } from 'lucide-react';

export default function KafkaEventLab() {
  const [selectedId, setSelectedId] = useState(KAFKA_PATTERNS[0].id);

  const activePattern = KAFKA_PATTERNS.find(k => k.id === selectedId) || KAFKA_PATTERNS[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-teal)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={32} style={{ color: 'var(--accent-teal)' }} /> Event-Driven Microservices (Apache Kafka)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Asynchrone Event-Driven Architektur mit Producers, Topics, Consumer Groups & RabbitMQ Queues.
        </p>
      </div>

      <div className="grid-responsive" style={{ gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span className="badge badge-teal" style={{ marginBottom: '10px' }}>Event Producer (Publisher)</span>
          <div className="code-window">
            <pre className="code-body">
              <code>{activePattern.producerCode}</code>
            </pre>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>Event Consumer (Subscriber)</span>
          <div className="code-window">
            <pre className="code-body">
              <code>{activePattern.consumerCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
