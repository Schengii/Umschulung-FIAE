import { describe, it, expect } from 'vitest';
import {
  fnv1a,
  partitionForKey,
  createTopic,
  produce,
  assignPartitions,
  pollGroup,
  consumerLag,
  partitionsByKey,
  repartition,
  groupOffsets,
  KAFKA_DRILL_QUESTIONS
} from './kafkaEventEngine';

const fill = (topic, events) => events.reduce((t, e) => produce(t, e).topic, topic);

describe('kafkaEventEngine', () => {
  it('berechnet FNV-1a nach Referenzwerten', () => {
    expect(fnv1a('')).toBe(0x811c9dc5);
    expect(fnv1a('a')).toBe(0xe40c292c);
  });

  it('ordnet denselben Schlüssel immer derselben Partition zu', () => {
    const p = partitionForKey('kunde-42', 3);
    for (let i = 0; i < 5; i++) expect(partitionForKey('kunde-42', 3)).toBe(p);
    expect(() => partitionForKey('x', 0)).toThrow();
  });

  it('hängt Events append-only mit fortlaufenden Offsets je Partition an', () => {
    let t = createTopic(2);
    const a = produce(t, { key: 'k', value: 'v1' });
    t = a.topic;
    const b = produce(t, { key: 'k', value: 'v2' });
    expect(b.partition).toBe(a.partition);
    expect(a.offset).toBe(0);
    expect(b.offset).toBe(1);
    expect(b.topic.partitions[a.partition].map((r) => r.value)).toEqual(['v1', 'v2']);
  });

  it('verteilt Events ohne Schlüssel reihum', () => {
    const t = fill(createTopic(3), [1, 2, 3, 4].map((i) => ({ key: null, value: `e${i}` })));
    expect(t.partitions.map((l) => l.length)).toEqual([2, 1, 1]);
  });

  it('weist jede Partition genau einem Consumer der Gruppe zu', () => {
    expect(assignPartitions(4, ['c1', 'c2'])).toEqual({ c1: [0, 1], c2: [2, 3] });
    expect(assignPartitions(3, ['c1', 'c2'])).toEqual({ c1: [0, 1], c2: [2] });
    const idle = assignPartitions(2, ['c1', 'c2', 'c3']);
    expect(idle.c3).toEqual([]);
    const all = Object.values(assignPartitions(5, ['a', 'b', 'c'])).flat().sort();
    expect(all).toEqual([0, 1, 2, 3, 4]);
  });

  it('führt Offsets je Gruppe getrennt und berechnet den Lag', () => {
    let t = fill(createTopic(2), [{ key: null, value: 'a' }, { key: null, value: 'b' }, { key: null, value: 'c' }]);
    expect(consumerLag(t, 'payment').total).toBe(3);
    const r = pollGroup(t, 'payment', ['c1'], 10);
    t = r.topic;
    expect(r.deliveries).toHaveLength(3);
    expect(consumerLag(t, 'payment').total).toBe(0);
    expect(consumerLag(t, 'analytics').total).toBe(3);
    expect(groupOffsets(t, 'payment')).toEqual([2, 1]);
  });

  it('liest pro Poll höchstens maxPerPartition Events je Partition', () => {
    const t = fill(createTopic(1), [1, 2, 3].map((i) => ({ key: 'k', value: String(i) })));
    const r = pollGroup(t, 'g', ['c1'], 2);
    expect(r.deliveries.map((d) => d.record.value)).toEqual(['1', '2']);
    expect(consumerLag(r.topic, 'g').total).toBe(1);
  });

  it('hält jeden Schlüssel in einer Partition und zeigt die Verschiebung beim Repartitionieren', () => {
    const keys = ['kunde-1', 'kunde-2', 'kunde-3', 'kunde-4', 'kunde-5'];
    const t = fill(createTopic(3), keys.flatMap((k) => [{ key: k, value: '1' }, { key: k, value: '2' }]));
    Object.values(partitionsByKey(t)).forEach((ps) => expect(ps).toHaveLength(1));
    const moved = repartition(t, 4);
    expect(moved.partitions).toHaveLength(4);
    expect(moved.partitions.flat()).toHaveLength(10);
  });

  it('hat eindeutige, gültige Drillfragen', () => {
    const ids = new Set(KAFKA_DRILL_QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(KAFKA_DRILL_QUESTIONS.length);
    for (const q of KAFKA_DRILL_QUESTIONS) expect(q.korrektIndex).toBeLessThan(q.optionen.length);
  });
});
